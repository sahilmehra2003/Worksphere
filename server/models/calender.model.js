// models/calender.model.js (or your existing calendar model file name)
import mongoose from 'mongoose';

// Sub-schema for individual holidays within a calendar
const holidaySchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true }, // Store as Date object
    description: String,
    // recurring: { type: Boolean, default: true } // Schema default handles this
 }, { _id: true }); // Ensure holidays get their own _id for easier deletion

const countryCalendarSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true,
    unique: true, // Ensure only one calendar per country
    index: true, // Index for fast lookup by country
    uppercase: true,
    trim: true,
    match: /^[A-Z]{2}$/ // Validate it's a 2-letter uppercase code
  },
  holidays: [holidaySchema], // Array of holiday sub-documents
  weekends: {
    type: [Number], // Array of numbers [0-6] where 0=Sunday, 6=Saturday
    default: [0, 6], // Default to Saturday & Sunday weekends
    validate: {
      validator: function(days) {
        // Ensure all values are integers between 0 and 6
        return Array.isArray(days) && days.every(d => Number.isInteger(d) && d >= 0 && d <= 6);
      },
      message: props => `${props.value} contains invalid day numbers. Weekends must be between 0 (Sunday) and 6 (Saturday).`
    }
  },
  // Link to the Employee who created/last updated this calendar record
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee", // Link to your Employee model
    required: true
  },
  // Optional: Track the year for which holidays were last fetched via the upsert process
  lastFetchedYear: Number
}, { timestamps: true }); // Adds createdAt, updatedAt

// --- Static Method to Check if a Date is a Weekend or Holiday ---
// Call this like: await CountryCalendar.isNonWorkingDay(myDateObject, 'IN');
countryCalendarSchema.statics.isNonWorkingDay = async function(dateToCheck, countryCode) {
    // Ensure input is a valid Date object
    if (!(dateToCheck instanceof Date) || isNaN(dateToCheck.getTime())) {
        console.error("Invalid date provided to isNonWorkingDay:", dateToCheck);
        return false; // Or throw an error? Returning false assumes it's a working day if date is invalid.
    }
     if (!countryCode || typeof countryCode !== 'string') {
         console.error("Invalid countryCode provided to isNonWorkingDay:", countryCode);
         // Fallback to default weekends without a country code? Risky. Let's return false or throw.
          return false; // Assume working day if country code is invalid/missing
     }


    try {
        // Find the calendar document for the given country
        const calendar = await this.findOne({ country: countryCode.toUpperCase() }).lean(); // .lean() for performance if not modifying

        let weekends = [0, 6]; // Default weekends (Sun, Sat) if no calendar found
        let holidays = [];      // Default empty holidays

        if (calendar) {
            weekends = calendar.weekends;
            holidays = calendar.holidays;
        } else {
            console.warn(`No calendar found for country ${countryCode}. Using default weekends [0, 6].`);
        }

        // 1. Check if the day falls on a defined weekend
        const dayOfWeek = dateToCheck.getDay(); // 0 = Sunday, 6 = Saturday
        if (weekends.includes(dayOfWeek)) {
            return true; // It's a weekend
        }

        // 2. Check if the date matches any holiday in the list
        // Compare only the date part (YYYY-MM-DD), ignoring timezones for this check.
        // Convert dateToCheck to YYYY-MM-DD string format (in UTC to avoid timezone shifts)
        const dateToCheckUTC = new Date(Date.UTC(dateToCheck.getFullYear(), dateToCheck.getMonth(), dateToCheck.getDate()));
        const dateToCheckStr = dateToCheckUTC.toISOString().split('T')[0];


        const isHoliday = holidays.some(holiday => {
             // Ensure holiday.date is valid before comparing
             if (holiday.date instanceof Date && !isNaN(holiday.date)) {
                  // Convert holiday date to YYYY-MM-DD string format (in UTC)
                  const holidayDateUTC = new Date(Date.UTC(holiday.date.getFullYear(), holiday.date.getMonth(), holiday.date.getDate()));
                  return holidayDateUTC.toISOString().split('T')[0] === dateToCheckStr;
             }
             return false; // Skip invalid dates in the holiday list
         });

        return isHoliday; // Return true if it matched any holiday date

    } catch (error) {
        console.error(`Error in isNonWorkingDay check for ${countryCode}, date ${dateToCheck}:`, error);
        // Fallback strategy on error: assume it's a working day to avoid blocking leaves? Or re-throw?
        // Let's return false (assume working) to be less disruptive on error.
        return false;
    }
};

const CountryCalendar = mongoose.model("CountryCalendar", countryCalendarSchema);
export default CountryCalendar;