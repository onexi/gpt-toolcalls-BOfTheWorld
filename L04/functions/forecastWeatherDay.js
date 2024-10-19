import axios from 'axios';

const execute = async (latitude, longitude, date) => {
    try {
        // Construct the API URL for Open-Meteo to get daily forecast data
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max&start=${date}&end=${date}&timezone=auto`;

        // Make the request to the Open-Meteo API
        const response = await axios.get(url);
        const dailyWeather = response.data.daily;

        if (!dailyWeather || !dailyWeather.time.includes(date)) {
            throw new Error("No weather data available for the given date.");
        }

        // Extract the weather data for the requested day
        const dayIndex = dailyWeather.time.indexOf(date);
        const maxTemperature = dailyWeather.temperature_2m_max[dayIndex];
        const minTemperature = dailyWeather.temperature_2m_min[dayIndex];
        const precipitation = dailyWeather.precipitation_sum[dayIndex];
        const windSpeed = dailyWeather.windspeed_10m_max[dayIndex];

        return {
            date,
            maxTemperature: `${maxTemperature} °C`,
            minTemperature: `${minTemperature} °C`,
            precipitation: `${precipitation} mm`,
            windSpeed: `${windSpeed} km/h`
        };
    } catch (error) {
        console.error("Error fetching weather forecast:", error);
        throw new Error("Failed to fetch the weather forecast.");
    }
};

const details = {
    type: "function",
    function: {
        name: "forecastWeatherDay",
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
                },
                date: {
                    type: "string",
                    description: "The date for which to get the weather forecast in the format YYYY-MM-DD"
                }
            },
            required: ["latitude", "longitude", "date"]
        }
    },
    description: "This function retrieves the weather forecast for a given location (latitude and longitude) on a specific date using the Open-Meteo API."
};

export { execute, details };
