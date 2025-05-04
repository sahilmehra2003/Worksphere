// Example in server.js or scheduler.js
import cron from 'node-cron';
import { autoRejectOldLeaves, performYearEndBalanceUpdates } from '../utility/schedulerTasks.utility'; 

// Schedule auto-rejection (e.g., run daily at 1 AM)
// Syntax: second minute hour day-of-month month day-of-week
cron.schedule('0 1 * * *', () => {
    console.log('Triggering scheduled task: autoRejectOldLeaves');
    autoRejectOldLeaves(); // Don't need await if you don't need immediate result here
}, {
    scheduled: true,
    timezone: "Asia/Kolkata" // Use your server's timezone
});

// Schedule year-end update (e.g., run annually on Jan 1st at 2 AM)
cron.schedule('0 2 1 1 *', () => { // Runs at 02:00 on day 1 of month 1 (January)
    console.log('Triggering scheduled task: performYearEndBalanceUpdates');
    performYearEndBalanceUpdates();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

console.log("Scheduled tasks (Auto-Reject Leaves, Year-End Balance Update) configured.");