import mongoose from 'mongoose'; // <-- Import Mongoose (needed for ObjectId validation)
import CountryCalendar from "../models/calender.model.js";
// 1. Import the utility function (ensure path is correct)
import { getHolidaysForCountry } from '../utility/getCountryHolidays.js';

// --- Existing Upsert Function ---
export const upsertCountryCalendar = async (req, res) => {
    try {
        const { country, weekends, year } = req.body;

        // Ensure user is authenticated and ID is available
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "User not authenticated" });
        }
        const createdBy = req.user._id;

        if (!country) {
            return res.status(400).json({ message: "Missing required field: country" });
        }

        let fetchedHolidaysRaw = [];
        // Determine the target year for fetching holidays
        const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
        if (isNaN(targetYear)) {
             return res.status(400).json({ message: "Invalid year provided." });
        }

        try {
            console.log(`Workspaceing holidays for ${country}, year: ${targetYear}...`);
            fetchedHolidaysRaw = await getHolidaysForCountry(country, targetYear);
            console.log(`Successfully fetched ${fetchedHolidaysRaw.length} holidays for ${country}.`);
        } catch (calendarificError) {
            console.error("Error fetching holidays from external service:", calendarificError.message);
            // Consider if you want to stop or allow saving without external holidays
            return res.status(502).json({
                message: "Failed to fetch holiday data from external service. Calendar not created/updated.",
                error: calendarificError.message
            });
        }

        // Transformation Step
        const holidaysToSave = fetchedHolidaysRaw.map(holiday => {
            if (!holiday.name || !holiday.date || !holiday.date.iso) {
                console.warn(`Skipping holiday due to missing name or date.iso:`, holiday);
                return null;
            }
            const dateObj = new Date(holiday.date.iso);
             if (isNaN(dateObj.getTime())) {
                 console.warn(`Skipping holiday due to invalid date format:`, holiday.date.iso);
                 return null;
             }
            return {
                name: holiday.name,
                date: dateObj, // Converted to Date object
                description: holiday.description || undefined,
                // recurring defaults to true in schema
            };
        }).filter(holiday => holiday !== null);

        console.log(`Upserting calendar for ${country} with ${holidaysToSave.length} processed holidays for year ${targetYear}. Weekends: ${weekends !== undefined ? weekends : 'Schema Default'}`);

        // Prepare update data, only including weekends if provided in request
        let updateData = {
            createdBy: createdBy,
            lastFetchedYear: targetYear
        };
        if (weekends !== undefined) {
             updateData.weekends = weekends;
        }

        // Find existing calendar to decide holiday merge strategy if needed
        // This implementation OVERWRITES the holidays array with the fetched ones
        updateData.holidays = holidaysToSave;


        const updatedCalendar = await CountryCalendar.findOneAndUpdate(
            { country: country.toUpperCase() },
            { $set: updateData }, // Use $set to update specified fields
            {
               new: true,                 // Return the updated document
               upsert: true,              // Create if doesn't exist
               setDefaultsOnInsert: true, // Apply schema defaults on creation
               runValidators: true        // Run schema validators on update
            }
        );

        res.status(200).json(updatedCalendar);

    } catch (error) {
        console.error("Error in upsertCountryCalendar controller:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error", error: error.message });
        }
        res.status(500).json({ message: "Error creating/updating country calendar in database", error: error.message });
    }
};

// --- Controller to Add a Single Holiday ---
// Expected Route: POST /api/calendars/:countryCode/holidays (example)
export const addHoliday = async (req, res) => {
    try {
        const { countryCode } = req.params;
        const { name, date, description, recurring } = req.body;

         // Validate input
        if (!name || !date) {
            return res.status(400).json({ message: "Missing required fields: name, date (YYYY-MM-DD)" });
        }

        // Validate and convert date string (assuming YYYY-MM-DD)
        const holidayDate = new Date(date);
        // Check if the conversion resulted in a valid date
        // getTime() returns NaN for invalid dates. Also check if input string was reasonable.
        if (isNaN(holidayDate.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
        }
         // Optional: Adjust for timezone if needed, e.g., ensure it's UTC midnight
         // const holidayDateUTC = new Date(Date.UTC(holidayDate.getFullYear(), holidayDate.getMonth(), holidayDate.getDate()));

        const newHoliday = {
            name,
            date: holidayDate, // Use the validated Date object
            description,
            // Let schema handle default for recurring if 'recurring' is undefined in req.body
            ...(recurring !== undefined && { recurring: Boolean(recurring) }) // Ensure boolean
        };

        // Find the calendar and push the new holiday
        // $push allows duplicate entries based on content.
        const updatedCalendar = await CountryCalendar.findOneAndUpdate(
            { country: countryCode.toUpperCase() }, // Case-insensitive find
            { $push: { holidays: newHoliday } },
            { new: true, runValidators: true } // Return updated doc, run subdocument validators
        );

        if (!updatedCalendar) {
            return res.status(404).json({ message: `Calendar for country ${countryCode.toUpperCase()} not found.` });
        }

        // Respond with the updated calendar (includes the new holiday)
        res.status(201).json(updatedCalendar); // 201 Created status

    } catch (error) {
        console.error("Error adding holiday:", error);
        if (error.name === 'ValidationError') {
            // Mongoose validation error (e.g., required field in subschema)
            return res.status(400).json({ message: "Validation Error adding holiday", error: error.message });
        }
        res.status(500).json({ message: "Error adding holiday to calendar", error: error.message });
    }
};


// --- Controller to Delete a Single Holiday ---
// Expected Route: DELETE /api/calendars/:countryCode/holidays/:holidayId (example)
export const deleteHoliday = async (req, res) => {
    try {
        const { countryCode, holidayId } = req.params;

        // Validate the Holiday ID format before hitting the DB
        if (!mongoose.Types.ObjectId.isValid(holidayId)) {
             return res.status(400).json({ message: "Invalid holiday ID format." });
        }

        // Use updateOne with $pull to remove the holiday subdocument
        const result = await CountryCalendar.updateOne(
            // Find the correct country calendar
            { country: countryCode.toUpperCase() },
            // Specify the pull operation on the holidays array
            { $pull: { holidays: { _id: holidayId } } }
        );

        // Check results
        if (result.matchedCount === 0) {
            // No document matched the country code
            return res.status(404).json({ message: `Calendar for country ${countryCode.toUpperCase()} not found.` });
        }

        if (result.modifiedCount === 0) {
            // Document was found, but no subdocument matched the holidayId (or was already deleted)
            return res.status(404).json({ message: `Holiday with ID ${holidayId} not found in calendar for ${countryCode.toUpperCase()}.` });
        }

        // If matchedCount > 0 and modifiedCount > 0, deletion was successful
        res.status(200).json({ message: "Holiday deleted successfully" });

    } catch (error) {
        console.error("Error deleting holiday:", error);
        res.status(500).json({ message: "Error deleting holiday from calendar", error: error.message });
    }
};


// --- Existing Getters/Delete Calendar ---
export const getCountryCalendar = async (req, res) => {
    try {
        const { country } = req.params;
        // Ensure consistent case for lookup
        const calendar = await CountryCalendar.findOne({ country: country.toUpperCase() });

        if (!calendar) {
            return res.status(404).json({ message: `Calendar not found for ${country.toUpperCase()}` });
        }

        res.status(200).json(calendar);
    } catch (error) {
        console.error("Error fetching country calendar:", error);
        res.status(500).json({ message: "Error fetching calendar", error: error.message });
    }
};

export const getAllCountryCalendars = async (req, res) => {
    try {
        // Only select the 'country' field and the unique '_id'
        const calendars = await CountryCalendar.find({}, "country").sort({ country: 1 }); // Sort alphabetically
        res.status(200).json(calendars);
    } catch (error) {
        console.error("Error fetching all country calendars:", error);
        res.status(500).json({ message: "Error fetching list of calendars", error: error.message });
    }
};

export const deleteCountryCalendar = async (req, res) => {
    try {
        const { country } = req.params;
        const deleted = await CountryCalendar.findOneAndDelete({ country: country.toUpperCase() });

        if (!deleted) {
            return res.status(404).json({ message: `Calendar not found for ${country.toUpperCase()}` });
        }

        res.status(200).json({ message: `Calendar for ${country.toUpperCase()} deleted successfully` });
    } catch (error) {
        console.error("Error deleting country calendar:", error);
        res.status(500).json({ message: "Error deleting calendar", error: error.message });
    }
};