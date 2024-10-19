import { appendFile, writeFile } from 'fs/promises';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios'; // To fetch the user's location via an IP geolocation API

// Function to fetch the user's location based on IP address
async function fetchLocation() {
    try {
        const response = await axios.get('https://ipapi.co/json/');
        const { city, region, country } = response.data;
        return `${city}, ${region}, ${country}`;
    } catch (error) {
        console.error('Error fetching location:', error);
        return 'Location unavailable';
    }
}

// Function to get UniqueID from credentials.csv
function getUniqueIDFromCredentials(username) {
    const credentialsFilePath = join(process.cwd(), './functions/credentials.csv');

    if (!existsSync(credentialsFilePath)) {
        console.error('Credentials file does not exist.');
        return null;
    }

    const data = readFileSync(credentialsFilePath, 'utf8');
    const lines = data.trim().split('\n').slice(1); // Skip header

    for (const line of lines) {
        const [uniqueID, storedUsername] = line.split(',');
        if (storedUsername === username) {
            return uniqueID;
        }
    }

    console.error('Username not found in credentials.');
    return null;
}

// Main execute function for handling actions
const execute = async (action, username) => {
    const filePath = join(process.cwd(), './functions/lastLoginLocation.csv');
    const header = 'UniqueID,Location\n';

    try {
        if (action === 'store') {
            // Retrieve the UniqueID from credentials.csv
            const uniqueID = getUniqueIDFromCredentials(username);
            if (!uniqueID) {
                return { error: 'User ID not found for the given username.' };
            }

            // Fetch user location
            const location = await fetchLocation();

            // Prepare the new CSV entry
            const newEntry = `${uniqueID},${location}\n`;

            // Check if the file exists
            if (!existsSync(filePath)) {
                // If the file does not exist, write the header
                await writeFile(filePath, header);
            }

            // Append the new entry to the file
            await appendFile(filePath, newEntry);
            console.log('Location stored:', { uniqueID, location });
            return { uniqueID, location };
        } else {
            return { error: 'Invalid action specified' };
        }
    } catch (err) {
        console.error('Error handling location:', err);
        return { error: err.message };
    }
};

// Details for integration with the server and OpenAI API
const details = {
    type: 'function',
    function: {
        name: 'lastLogInLocation',
        parameters: {
            type: 'object',
            properties: {
                action: {
                    type: 'string',
                    description: 'The action to perform (e.g., store)',
                },
                username: {
                    type: 'string',
                    description: 'The username associated with the login session.',
                },
            },
            required: ['action', 'username'],
        },
    },
    description: 'Function to store user login location with a UniqueID retrieved from credentials.csv.',
};

export { execute, details };
