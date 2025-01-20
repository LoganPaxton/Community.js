import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get the current file and directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class PostController {
    constructor() {
        this.message = "";
        this.username = "";
        this.blockedWordsFilePath = path.join(__dirname, 'blocked_words.txt');
    }

    // Load blocked words from the text file
    loadBlockedWords() {
        if (!fs.existsSync(this.blockedWordsFilePath)) {
            console.warn("Blocked words file not found. Creating an empty file.");
            fs.writeFileSync(this.blockedWordsFilePath, "", 'utf-8');
        }

        const data = fs.readFileSync(this.blockedWordsFilePath, { encoding: 'utf-8' });
        const blockedWords = data.split('\n').map(word => word.trim().toLowerCase()).filter(Boolean); // Remove empty lines
        return new Set(blockedWords);
    }

    // Check if the post contains any blocked words, now accounting for punctuation
    containsProfanity(message, blockedWords) {
        // Remove all non-alphanumeric characters except spaces
        const sanitizedMessage = message.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();
        
        const words = sanitizedMessage.split(/\s+/); // Split message into words
        return words.some(word => blockedWords.has(word));
    }

    // Function to add a new post
    makePost(message, username) {
        this.message = message;
        this.username = username;

        if (this.username !== "" && this.message !== "") {
            const blockedWords = this.loadBlockedWords();

            if (this.containsProfanity(this.message, blockedWords)) {
                console.error("Post contains prohibited words and cannot be added.");
                return;
            }

            const filePath = path.join(__dirname, 'Posts.json');

            fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
                if (err && err.code !== 'ENOENT') {
                    console.error("Error reading file:", err.message);
                    return;
                }

                let posts = [];
                if (data) {
                    try {
                        posts = JSON.parse(data);
                        if (!Array.isArray(posts)) {
                            console.error("Data in file is not an array, initializing a new array.");
                            posts = [];
                        }
                    } catch (parseErr) {
                        console.error("Error parsing JSON:", parseErr.message);
                        posts = [];
                    }
                }

                const newPost = {
                    username: this.username,
                    message: this.message,
                    timestamp: new Date().toISOString()
                };

                posts.push(newPost);

                fs.writeFile(filePath, JSON.stringify(posts, null, 2), (writeErr) => {
                    if (writeErr) {
                        console.error("Error writing to file:", writeErr.message);
                    } else {
                        console.log("New post added successfully!");
                    }
                });
            });
        }
    }

    // Function to remove a user's post(s)
    removePost(username, message = null) {
        const filePath = path.join(__dirname, 'Posts.json');

        fs.readFile(filePath, { encoding: 'utf-8' }, (err, data) => {
            if (err && err.code !== 'ENOENT') {
                console.error("Error reading file:", err.message);
                return;
            }

            let posts = [];
            if (data) {
                try {
                    posts = JSON.parse(data);
                    if (!Array.isArray(posts)) {
                        console.error("Data in file is not an array, cannot proceed.");
                        return;
                    }
                } catch (parseErr) {
                    console.error("Error parsing JSON:", parseErr.message);
                    return;
                }
            }

            // Filter posts to remove the specified post(s)
            const filteredPosts = posts.filter(post => {
                if (post.username !== username) return true;
                if (message && post.message !== message) return true;
                return false;
            });

            // Check if any posts were removed
            if (posts.length === filteredPosts.length) {
                console.log(`No posts found for user: ${username}${message ? ' with the specified message' : ''}`);
                return;
            }

            // Write the updated posts array back to the file
            fs.writeFile(filePath, JSON.stringify(filteredPosts, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error("Error writing to file:", writeErr.message);
                } else {
                    console.log("Post(s) removed successfully!");
                }
            });
        });
    }
}
