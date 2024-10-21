import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execute as saveLocation } from './lastLogInLocation.js'; // Import the location-saving function

// Function to verify user credentials
function verifyCredentials(username, password) {
    const filePath = join(process.cwd(), './functions/credentials.csv');

    if (!existsSync(filePath)) {
        console.error('Credentials file does not exist.');
        return { success: false, message: 'Credentials file not found.' };
    }

    const data = readFileSync(filePath, 'utf8');
    const lines = data.trim().split('\n').slice(1); // Skip the header

    for (const line of lines) {
        const [storedUserID, storedUsername, storedPassword] = line.split(',');
        if (storedUsername === username && storedPassword === password) {
            return { success: true, userID: storedUserID, username: storedUsername };
        }
    }

    return { success: false, message: 'Invalid username or password.' };
}

// Main execute function for handling login
const execute = async (action, username, password) => {
    try {
        if (action === 'login') {
            const result = verifyCredentials(username, password);

            if (result.success) {
                console.log(`Login successful for user: ${result.username}`);

                // Save the location after successful login
                const locationResult = await saveLocation('store', username);
                if (locationResult.error) {
                    console.error('Error saving location:', locationResult.error);
                    return { error: 'Login successful, but failed to save location.' };
                }

                // Return the user data and location
                return { userID: result.userID, username: result.username, location: locationResult.location };
            } else {
                console.error(result.message);
                return { error: result.message };
            }
        } else {
            return { error: 'Invalid action specified' };
        }
    } catch (err) {
        console.error('Error during login:', err);
        return { error: err.message };
    }
};

// Details for integration with the server and OpenAI API
const details = {
    type: 'function',
    function: {
        name: 'credentialLogin',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    description: 'The action to perform (e.g., login)',
                },
                username: {
                    type: 'string',
                    description: 'The username to log in.',
                },
                password: {
                    type: 'string',
                    description: 'The password for the user.',
                },
            },
            required: ['action', 'username', 'password'],
        },
    },
    description: 'Function to log in a user using username and password, and save the location upon successful login.',
};

export { execute, details };
