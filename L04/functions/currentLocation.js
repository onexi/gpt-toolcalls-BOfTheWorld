import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const execute = async () => {
    try {
        // IPinfo API URL
        const url = `https://ipinfo.io/json?token=${process.env.IPINFO_TOKEN}`;
        
        // Send the request to IPinfo
        const response = await axios.get(url);

        // Extract location details from the response
        const { city, region, country, loc } = response.data;
        const [latitude, longitude] = loc.split(',');

        return {
            city,
            region,
            country,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
        };
    } catch (error) {
        console.error("Error fetching current location:", error);
        throw new Error("Failed to get current location.");
    }
};

const details = {
    type: "function",
    function: {
        name: "currentLocation",
        parameters: {
            type: "object",
            properties: {}
        }
    },
    description: "This function retrieves the user's current location using the IPinfo API.",
};

export { execute, details };
