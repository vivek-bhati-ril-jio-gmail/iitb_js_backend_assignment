const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('../models/books'); 
const Member = require('../models/members'); 
const User = require('../models/users'); 
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    try {
        if (!mongoose.connection.readyState) {
            await mongoose.connection.asPromise();
        }

        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);

        // Drop collections if they exist
        const collectionsToDrop = ['books', 'members', 'users'];
        for (const collection of collectionsToDrop) {
            if (collectionNames.includes(collection)) {
                await mongoose.connection.db.dropCollection(collection);
                console.log(`${collection.charAt(0).toUpperCase() + collection.slice(1)} collection dropped`);
            }
        }

        // Seed Members collection
        console.log('Seeding Members collection...');
        const membersToSeed = [];
        for (let i = 1; i <= 100; i++) {
            membersToSeed.push({
                username: `member${i}`,
                password: await bcrypt.hash('password', 10), 
                email: `member${i}@example.com`,
                borrowedBooks: [],
                history: [],
                isActive: true
            });
        }
        const members = await Member.insertMany(membersToSeed);
        console.log(`${members.length} members inserted`);

        // Seed Books collection
        console.log('Seeding Books collection...');
        const books = [];

        for (let i = 1; i <= 100; i++) {
            const book = {
                title: `Book Title ${i}`,
                author: `Author ${i}`,
                status: 'AVAILABLE',
                numberOfCopies: Math.floor(Math.random() * 5) + 1,
                borrowedBy: []
            };

            const insertedBook = await Book.create(book);
            const bookId = insertedBook._id;
            const uniqueMembers = new Set(); // To track unique members borrowing this book

            for (let j = 0; j < insertedBook.numberOfCopies; j++) {
                const randomIndex = Math.floor(Math.random() * members.length);
                const randomMember = members[randomIndex]; 

                if (!uniqueMembers.has(randomMember._id.toString())) {
                    uniqueMembers.add(randomMember._id.toString()); // Ensure uniqueness
                    randomMember.borrowedBooks.push(bookId);
                    await randomMember.save();

                    // Add the member ID to the book's borrowedBy list if not already present
                    if (!insertedBook.borrowedBy.includes(randomMember._id)) {
                        insertedBook.borrowedBy.push(randomMember._id);
                    }

                    // Add a BORROWED action to the member's history
                    const borrowDate = new Date();
                    randomMember.history.push({
                        bookId: bookId,
                        action: 'BORROWED',
                        date: borrowDate
                    });
                }
            }

            await insertedBook.save();
            books.push(insertedBook);
        }
        console.log(`${books.length} books inserted`);

        // Add RETURNED actions for borrowed books in member history
        for (const member of members) {
            const borrowedBooksCount = member.borrowedBooks.length;

            if (borrowedBooksCount > 0) {
                // Ensure BORROWED actions first
                const borrowCount = Math.floor(Math.random() * 2) * 2 + 1; // Odd number
                for (let i = 0; i < borrowCount; i++) {
                    const bookIndex = Math.floor(Math.random() * borrowedBooksCount);
                    const borrowedBookId = member.borrowedBooks[bookIndex];
                    const borrowDate = new Date();
                    const existingHistoryEntry = member.history.filter(entry => entry.bookId.equals(borrowedBookId));
                    if (existingHistoryEntry.length == 0) {
                        member.history.push({
                        bookId: borrowedBookId,
                        action: 'BORROWED',
                        date: borrowDate
                    });
                    }
                }

                // Ensure corresponding RETURNED actions
                for (let i = 0; i < borrowCount; i++) {
                    const bookIndex = Math.floor(Math.random() * borrowedBooksCount);
                    const borrowedBookId = member.borrowedBooks[bookIndex];
                    const existingHistoryEntry = member.history.filter(entry => entry.bookId.equals(borrowedBookId));
                    
                    let returnDate = new Date(); // Should be after the borrow date

                    if (existingHistoryEntry.length > 0) {
                        const lastEntry = existingHistoryEntry.sort((a, b) => b.date - a.date)[0]; // Get the most recent entry
                        returnDate = new Date(lastEntry.date.getTime() + 1000); // Ensure RETURNED date is after BORROWED date

                        // If last entry was BORROWED, add RETURNED entry
                        if (lastEntry.action === 'BORROWED') {
                            member.history.push({
                                bookId: borrowedBookId,
                                action: 'RETURNED',
                                date: returnDate
                            });
                        } else {
                            // If last entry was RETURNED, add BORROWED entry (to maintain the odd count)
                            member.history.push({
                                bookId: borrowedBookId,
                                action: 'BORROWED',
                                date: returnDate
                            });
                        }
                    } else {
                        // If no existing entry, assume it was borrowed and return it
                        member.history.push({
                            bookId: borrowedBookId,
                            action: 'RETURNED',
                            date: returnDate
                        });
                    }
                }
            }

            // Sort history to ensure BORROWED comes before RETURNED
            member.history.sort((a, b) => a.date - b.date);
            // Remove from borrowedBooks if BORROWED and RETURNED counts are equal
            const bookIdsChecked = new Set();
            for (const entry of member.history) {
                if (entry.action === 'BORROWED') {
                    const bookId = entry.bookId.toString();
                    bookIdsChecked.add(bookId);
                }
            }

            for (const bookId of bookIdsChecked) {
                const borrowedCount = member.history.filter(entry => entry.bookId.equals(bookId) && entry.action === 'BORROWED').length;
                const returnedCount = member.history.filter(entry => entry.bookId.equals(bookId) && entry.action === 'RETURNED').length;

                if (borrowedCount === returnedCount) {
                    member.borrowedBooks = member.borrowedBooks.filter(b => !b.equals(bookId)); // Remove the book from borrowedBooks
                    // Also remove this member ID from the book's borrowedBy list
                    const book = await Book.findById(bookId);
                    if (book) {
                        book.borrowedBy = book.borrowedBy.filter(borrowerId => !borrowerId.equals(member._id));
                        await book.save(); // Save updated book
                    }
                }
            }
            await member.save(); // Save updated member
        }

        // Seed Users collection (Librarians and Members)
        console.log('Seeding Users collection...');
        const users = [];
        users.push({
            username: 'librarian1',
            password: await bcrypt.hash('librarianPassword', 10),
            role: 'LIBRARIAN'
        });
        for (let i = 1; i <= 10; i++) {
            users.push({
                username: `memberUser${i}`,
                password: await bcrypt.hash('memberPassword', 10), 
                role: 'MEMBER'
            });
        }
        await User.insertMany(users);
        console.log(`${users.length} users inserted`);

        // Add all members to User collection as members
        // Add all members to User collection as members
        const memberUsers = await Promise.all(members.map(async (member) => ({
            username: member.username,
            password: await bcrypt.hash(member.password, 10), // Hash the password correctly
            role: 'MEMBER'
        })));
        await User.insertMany(memberUsers);
        console.log(`${memberUsers.length} member users inserted`);

    } catch (error) {
        console.error('Error during seeding:', error.message);
    }
}

// Export the function
module.exports = seedDatabase;
