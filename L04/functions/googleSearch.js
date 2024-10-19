import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

// Set up the Custom Search API
const customSearch = google.customsearch('v1');

const execute = async (query) => {
    try {
        const response = await customSearch.cse.list({
            auth: process.env.GOOGLE_API_KEY, // Your API key
            cx: process.env.GOOGLE_SEARCH_ENGINE_ID, // Your search engine ID
            q: query, // The search query input message
        });

        const searchResults = response.data.items || [];
        return searchResults.map((result) => ({
            title: result.title,
            link: result.link,
            snippet: result.snippet
        }));
    } catch (error) {
        console.error("Error performing Google search:", error);
        throw new Error("Failed to perform Google search");
    }
};

const details = {
    type: "function",
    function: {
        name: "googleSearch",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "The search query to search on Google"
                }
            },
            required: ["query"]
        }
    },
    description: "This function performs a Google search using the provided query and returns the top results."
};

export { execute, details };
