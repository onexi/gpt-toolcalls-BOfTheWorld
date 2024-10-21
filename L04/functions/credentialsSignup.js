import { appendFile, writeFile } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execute as saveLocation } from './lastLogInLocation.js'; // Import the location-saving function

function generateUniqueUserID(existingIDs) {
    let userID;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    do {
        userID = Array.from({ length: 18 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while (existingIDs.has(userID));
    return userID;
}

function isUsernameExists(username) {
    const filePath = join(process.cwd(), './functions/credentials.csv');

    if (!existsSync(filePath)) {
        return false;
    }

    const data = readFileSync(filePath, 'utf8');
    const lines = data.trim().split('\n').slice(1);

    for (const line of lines) {
        const [, storedUsername] = line.split(',');
        if (storedUsername === username) {
            return true;
        }
    }
    return false;
}

const execute = async (action, username, password) => {
    const filePath = join(process.cwd(), './functions/credentials.csv');
    const header = 'UserID,Username,Password\n';
    let existingIDs = new Set();

    try {
        if (action === 'signup') {
            if (isUsernameExists(username)) {
                return { error: 'Username already exists. Please choose a different one.' };
            }

            if (existsSync(filePath)) {
                const data = readFileSync(filePath, 'utf8');
                const lines = data.trim().split('\n').slice(1);
                for (const line of lines) {
                    const [userID] = line.split(',');
                    existingIDs.add(userID);
                }
            } else {
                await writeFile(filePath, header);
            }

            const userID = generateUniqueUserID(existingIDs);
            const newEntry = `${userID},${username},${password}\n`;
            await appendFile(filePath, newEntry);
            console.log('Signup successful:', { userID, username });

            // Save the location after successful signup
            await saveLocation('store', username);

            return { userID, username };
        } else {
            return { error: 'Invalid action specified' };
        }
    } catch (err) {
        console.error('Error handling signup:', err);
        return { error: err.message };
    }
};

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
    description: 'Function to sign up a new user, ensuring the username is unique, generating a unique UserID, and saving the location.',
};

export { execute, details };
