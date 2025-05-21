import axios from 'axios';
import { configDotenv } from 'dotenv'; 

configDotenv(); 

const CALENDARIFIC_API_URL = 'https://calendarific.com/api/v2/holidays';
const API_KEY = process.env.CALENDARIFIC_API_KEY;


export async function getHolidaysForCountry(countryCode, year) {
    if (!API_KEY) {
        console.error("Calendarific API key is missing. Ensure CALENDARIFIC_API_KEY is set in your .env file.");
        throw new Error('Calendarific API key not found in environment variables (CALENDARIFIC_API_KEY)');
    }

    if (!countryCode || typeof countryCode !== 'string' || countryCode.length !== 2) {
         throw new Error('Invalid or missing country code. Please provide a 2-letter ISO 3166-1 alpha-2 code.');
    }

    const targetYear = year || new Date().getFullYear(); // Default to current year if not provided

    const params = {
        api_key: API_KEY,
        country: countryCode.toUpperCase(), // Ensure country code is uppercase
        year: targetYear,

    };

    try {
     
        console.log(`Workspaceing holidays for ${params.country} in ${params.year}...`);
        const response = await axios.get(CALENDARIFIC_API_URL, { params });

        // Check the structure of the response based on Calendarific's documentation
        if (response.data && response.data.meta && response.data.meta.code === 200) {
            if (response.data.response && Array.isArray(response.data.response.holidays)) {
                console.log(`Successfully fetched ${response.data.response.holidays.length} holidays.`);
                // Corrected log to use response.data (optional logging)
                // console.log("Holidays data:", response.data.response.holidays );
                return response.data.response.holidays;
            } else {
                // Handle cases where API call was successful but no holidays array is present
                console.log(`API returned success code, but no holidays found for ${params.country} in ${params.year}.`);
                return []; // Return an empty array 
            }
        } else {
            // Handle API errors reported within the response body
            const errorMessage = response.data?.meta?.error_detail || 'Unknown API error structure.';
            console.error('Calendarific API returned an error:', errorMessage);
            throw new Error(`Failed to fetch holidays: ${errorMessage}`);
        }
    } catch (error) {
         // Corrected error log format (removed HTML spans)
        console.error(`Error fetching holidays from Calendarific for ${countryCode} (${targetYear}):`, error.message);

        // Provide more specific error feedback if available from axios
        if (error.response) {
            // The request was made and the server responded with a status code outside 2xx
            console.error('API Error Status:', error.response.status);
            // Log the actual error data from Calendarific if available
            console.error('API Error Data:', JSON.stringify(error.response.data, null, 2)); // Pretty print JSON
             const apiErrorMessage = error.response.data?.meta?.error_detail || `API request failed with status ${error.response.status}`;
            throw new Error(`Failed to fetch holidays: ${apiErrorMessage}`);

        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from Calendarific API.');
            throw new Error('Failed to fetch holidays: No response from Calendarific server.');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
            throw new Error(`Failed to fetch holidays due to a request setup issue: ${error.message}`);
        }
    }
}

