
export const getStartOfWeek = (date, startDay = 1) => {
    // Validate input
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error("Invalid input date provided to getStartOfWeek.");
    }
    if (startDay < 0 || startDay > 6) {
        console.warn("getStartOfWeek: startDay should be between 0 (Sun) and 6 (Sat). Using default 1 (Mon).");
        startDay = 1;
    }

    // Work with UTC dates
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    // Get the date part (day of the month) of the input date in UTC
    const dayOfMonth = date.getUTCDate();
    // Get the day of the week in UTC (0 for Sunday, 1 for Monday, etc.)
    const dayOfWeek = date.getUTCDay();

    // Calculate the difference needed to get back to the target startDay
    // How many days ago was the last 'startDay'?
    const difference = dayOfWeek - startDay; // e.g., if today is Wed (3) and week starts Mon (1), diff = 2
                                          // e.g., if today is Sun (0) and week starts Mon (1), diff = -1

    let daysToSubtract;
    if (difference >= 0) {
        // Target start day is today or earlier in the current week cycle
        daysToSubtract = difference;
    } else {
        // Target start day is later in the week, meaning it was last week
        // e.g., Sun(0) - Mon(1) = -1. Need to go back 6 days (7 + (-1))
        daysToSubtract = 7 + difference;
    }

    // Calculate the date of the week's start day
    const startDayDate = dayOfMonth - daysToSubtract;

    // Create a new Date object for the start of that day in UTC
    const weekStartDate = new Date(Date.UTC(year, month, startDayDate));

    return weekStartDate;
};

