import { appendFile, writeFile } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

// Function to generate a unique 18-digit alphanumeric UserID
function generateUniqueUserID(existingIDs) {
    let userID;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    do {
        userID = Array.from({ length: 18 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while (existingIDs.has(userID));
    return userID;
}

// Function to check if a username already exists
function isUsernameExists(username) {
    const filePath = join(process.cwd(), './functions/credentials.csv');

    if (!existsSync(filePath)) {
        return false; // File does not exist, so the username does not exist.
    }

    const data = readFileSync(filePath, 'utf8');
    const lines = data.trim().split('\n').slice(1); // Skip the header

    for (const line of lines) {
        const [, storedUsername] = line.split(',');
        if (storedUsername === username) {
            return true; // Username already exists
        }
    }
    return false;
}

// Main execute function for handling signup actions
const execute = async (action, username, password) => {
    const filePath = join(process.cwd(), './functions/credentials.csv');
    const header = 'UserID,Username,Password\n';
    let existingIDs = new Set();

    try {
        if (action === 'signup') {
            // Check if the username already exists
            if (isUsernameExists(username)) {
                return { error: 'Username already exists. Please choose a different one.' };
            }

            // Check if the file exists and read existing IDs
            if (existsSync(filePath)) {
                const data = readFileSync(filePath, 'utf8');
                const lines = data.trim().split('\n').slice(1); // Skip header
                for (const line of lines) {
                    const [userID] = line.split(',');
                    existingIDs.add(userID);
                }
            } else {
                // If the file does not exist, write the header
                await writeFile(filePath, header);
            }

            // Generate a unique UserID
            const userID = generateUniqueUserID(existingIDs);

            // Prepare the new CSV entry
            const newEntry = `${userID},${username},${password}\n`;

            // Append the new entry to the file
            await appendFile(filePath, newEntry);
            console.log('Signup successful:', { userID, username, password });
            return { userID, username, password };
        } else {
            return { error: 'Invalid action specified' };
        }
    } catch (err) {
        console.error('Error handling signup:', err);
        return { error: err.message };
    }
};

// Details for integration with the server and OpenAI API
const details = {
    type: 'function',
    function: {
        name: 'credentialsSignup',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    description: 'The action to perform (e.g., signup)',
                },
                username: {
                    type: 'string',
                    description: 'The username to sign up.',
                },
                password: {
                    type: 'string',
                    description: 'The password for the new account.',
                },
            },
            required: ['action', 'username', 'password'],
        },
    },
    description: 'Function to sign up a new user, ensuring the username is unique and generating a unique UserID.',
};

export { execute, details };
