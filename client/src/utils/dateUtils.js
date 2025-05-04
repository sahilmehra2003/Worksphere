// src/utils/dateUtils.js

/**
 * Checks if two Date objects represent the same calendar date (ignores time).
 * @param {Date} date1 First Date object
 * @param {Date} date2 Second Date object
 * @returns {boolean} True if they are the same date, false otherwise.
 */
export const isSameDate = (date1, date2) => {
    // Basic validation
    if (!(date1 instanceof Date) || !(date2 instanceof Date) || isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        console.warn("Invalid date passed to isSameDate");
        return false;
    }
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
};

/**
 * Checks if a given date falls on a weekend or is a holiday.
 * @param {Date} dateToCheck The Date object to check.
 * @param {number[]} weekends Array of weekend day numbers (0=Sun, 6=Sat).
 * @param {object[]} holidays Array of holiday objects, each expected to have a 'date' property (Date object or ISO String).
 * @returns {boolean} True if the date is a weekend or holiday, false otherwise.
 */
export const isNonWorkingDay = (dateToCheck, weekends = [], holidays = []) => {
    if (!(dateToCheck instanceof Date) || isNaN(dateToCheck.getTime())) {
         console.warn("Invalid dateToCheck passed to isNonWorkingDay");
         return false; // Treat invalid date as working day? Or throw error?
    }

    // 1. Check Weekend
    const dayOfWeek = dateToCheck.getDay(); // 0 = Sunday, 6 = Saturday
    if (weekends.includes(dayOfWeek)) {
        return true;
    }

    // 2. Check Holiday
    // Compare YYYY-MM-DD strings for reliable date-only comparison
    const dateToCheckStr = dateToCheck.toISOString().split('T')[0];

    return holidays.some(holiday => {
        if (!holiday?.date) return false; // Skip if holiday object has no date
        try {
            // Ensure holiday.date is treated as a Date object before comparison
            const holidayDate = new Date(holiday.date);
            if (isNaN(holidayDate.getTime())) return false; // Skip if holiday date is invalid

            // Compare YYYY-MM-DD part using UTC dates to avoid timezone issues with just date strings
            const holidayDateUTC = new Date(Date.UTC(holidayDate.getFullYear(), holidayDate.getMonth(), holidayDate.getDate()));
            return holidayDateUTC.toISOString().split('T')[0] === dateToCheckStr;

        } catch (e) {
            console.error("Error processing holiday date in isNonWorkingDay:", holiday.date, e);
            return false; // Skip if error processing date
        }
    });
};


/**
 * Calculates the number of working days between two dates (inclusive),
 * excluding specified weekends and holidays.
 * @param {Date} startDate Start Date object.
 * @param {Date} endDate End Date object (inclusive).
 * @param {number[]} weekends Array of weekend day numbers (0=Sun, 6=Sat).
 * @param {object[]} holidays Array of holiday objects with 'date' property.
 * @returns {number} The count of working days.
 */
export const calculateWorkingDaysFrontend = (startDate, endDate, weekends = [], holidays = []) => {
    let count = 0;
    // Validate input dates
     if (!(startDate instanceof Date) || isNaN(startDate.getTime()) ||
         !(endDate instanceof Date) || isNaN(endDate.getTime()) ||
         startDate > endDate) {
         console.error("Invalid dates passed to calculateWorkingDaysFrontend:", startDate, endDate);
         return 0;
     }

    // Iterate using UTC dates to avoid DST/timezone shifts during iteration
    let currentDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()));
    const end = new Date(Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()));

    while (currentDate <= end) {
        // For checking against weekends/holidays, create a Date object representing the *local* day
        // This assumes weekends/holidays are defined based on the user's local perception
        const checkDate = new Date(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate());

        if (!isNonWorkingDay(checkDate, weekends, holidays)) {
            count++;
        }
        // Move to the next day in UTC
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    console.log(`Calculated frontend working days: ${count}`);
    return count;
};