import { readFileSync } from 'fs';
import { join } from 'path';

// Function to get user information based on userID
function getUserInfo(userID) {
    const filePath = join(process.cwd(), './functions/credentials.csv');

    if (!existsSync(filePath)) {
        console.error('Credentials file does not exist.');
        return null;
    }

    const data = readFileSync(filePath, 'utf8');
    const lines = data.trim().split('\n').slice(1); // Skip header

    for (const line of lines) {
        const [storedUserID, username] = line.split(',');
        if (storedUserID === userID) {
            return { userID: storedUserID, username };
        }
    }

    console.error('User ID not found in credentials.');
    return null;
}

// Function to greet the user
function greetUser(userID) {
    const userInfo = getUserInfo(userID);

    if (userInfo) {
        console.log(`Welcome back, ${userInfo.username}!`);
        return `Welcome back, ${userInfo.username}!`;
    } else {
        console.log('User not found.');
        return 'User not found.';
    }
}

// Export the greetUser function for integration
const details = {
    type: 'function',
    function: {
        name: 'greetUser',
        parameters: {
            type: 'object',
            properties: {
                userID: {
                    type: 'string',
                    description: 'The user ID to greet the user upon login or signup.',
                },
            },
            required: ['userID'],
        },
    },
    description: 'Function to greet the user based on userID upon login or signup.',
};

export { greetUser, details };
