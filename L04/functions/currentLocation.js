import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const execute = async () => {
    try {
        // Check if the browser supports geolocation
        if (typeof window !== 'undefined' && navigator.geolocation) {
            console.log("Browser supports Geolocation. Attempting to retrieve high-accuracy location...");
            // Return a Promise to handle async geolocation
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        // If location is successfully retrieved from the browser
                        const { latitude, longitude, accuracy } = position.coords;
                        console.log(`Location obtained from browser: Latitude: ${latitude}, Longitude: ${longitude}, Accuracy: ${accuracy} meters`);

                        // Only accept the location if accuracy is within a reasonable range (e.g., < 50 meters)
                        if (accuracy <= 50) {
                            resolve({
                                latitude: latitude,
                                longitude: longitude,
                                accuracy: accuracy
                            });
                        } else {
                            console.warn("Location accuracy is too low. Falling back to Google Geolocation API...");
                            fallbackToGoogleAPI().then(resolve).catch(reject);
                        }
                    },
                    async (error) => {
                        console.error("Browser Geolocation failed. Error:", error);
                        // If browser geolocation fails, fallback to Google API
                        try {
                            const locationData = await fallbackToGoogleAPI();
                            resolve(locationData);
                        } catch (googleError) {
                            reject(googleError);
                        }
                    },
                    {
                        enableHighAccuracy: true, // Requests the most precise location data (e.g., GPS)
                        timeout: 15000,           // Timeout after 15 seconds
                        maximumAge: 0             // Ensures no cached location data is used
                    }
                );
            });
        } else {
            console.log("Browser does not support Geolocation, using Google API");
            return await fallbackToGoogleAPI();
        }
    } catch (error) {
        console.error("Error fetching current location:", error);
        throw new Error("Failed to get current location.");
    }
};

// Fallback method to get the location using Google Geolocation API
const fallbackToGoogleAPI = async () => {
    try {
        console.log("Attempting to fetch location using Google Geolocation API...");
        const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.GOOGLE_API_KEY}`;
        const response = await axios.post(url, {}, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const { lat, lng } = response.data.location;
        console.log(`Location obtained from Google API: Latitude: ${lat}, Longitude: ${lng}`);

        return {
            latitude: lat,
            longitude: lng,
            accuracy: response.data.accuracy
        };
    } catch (error) {
        console.error("Google Geolocation API failed:", error);
        throw new Error("Failed to get current location from Google API.");
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
    description: "This function retrieves the user's current location (latitude and longitude) using either the browser's Geolocation API for high accuracy or the Google Geolocation API as a fallback."
};

export { execute, details };
