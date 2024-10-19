import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const execute = async (latitude, longitude, destination) => {
    try {
        const apiKey = process.env.GOOGLE_API_KEY; // Your Google Maps API key
        const origin = `${latitude},${longitude}`; // Starting point (current location)
        
        // Build the request URL for Google Maps Directions API
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${encodeURIComponent(destination)}&key=${apiKey}`;

        // Make the request to the Google Maps Directions API
        const response = await axios.get(url);
        const directionsData = response.data;

        if (!directionsData.routes || directionsData.routes.length === 0) {
            throw new Error("No directions found.");
        }

        // Get the first route and the legs of the journey
        const route = directionsData.routes[0].legs[0];
        const steps = route.steps.map(step => ({
            distance: step.distance.text,
            duration: step.duration.text,
            instructions: step.html_instructions
        }));

        return {
            start_address: route.start_address,
            end_address: route.end_address,
            total_distance: route.distance.text,
            total_duration: route.duration.text,
            steps
        };
    } catch (error) {
        console.error("Error fetching directions:", error);
        throw new Error("Failed to get directions.");
    }
};

const details = {
    type: "function",
    function: {
        name: "mapDirections",
        parameters: {
            type: "object",
            properties: {
                latitude: {
                    type: "number",
                    description: "The latitude of the current location"
                },
                longitude: {
                    type: "number",
                    description: "The longitude of the current location"
                },
                destination: {
                    type: "string",
                    description: "The destination address for the directions"
                }
            },
            required: ["latitude", "longitude", "destination"]
        }
    },
    description: "This function retrieves directions from the current location (latitude and longitude) to a specified destination using the Google Maps Directions API."
};

export { execute, details };
