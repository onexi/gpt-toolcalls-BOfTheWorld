import axios from 'axios';

const execute = async (latitude, longitude) => {
    try {
        // Construct the API URL for Open-Meteo
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

        // Make the request to the Open-Meteo API
        const response = await axios.get(url);
        const weatherData = response.data.current_weather;

        // Extract necessary weather information
        const temperature = weatherData.temperature;
        const windSpeed = weatherData.windspeed;
        const weatherCode = weatherData.weathercode;
        const time = weatherData.time;

        return {
            temperature: `${temperature} °C`,
            windSpeed: `${windSpeed} km/h`,
            weatherCode,
            time
        };
    } catch (error) {
        console.error("Error fetching weather data:", error);
        throw new Error("Failed to fetch current weather.");
    }
};

const details = {
    type: "function",
    function: {
        name: "currentWeather",
        parameters: {
            type: "object",
            properties: {
                latitude: {
                    type: "number",
                    description: "The latitude of the location"
                },
                longitude: {
                    type: "number",
                    description: "The longitude of the location"
                }
            },
            required: ["latitude", "longitude"]
        }
    },
    description: "This function retrieves the current weather for a given location (latitude and longitude) using the Open-Meteo API."
};

export { execute, details };
