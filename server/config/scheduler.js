import cron from 'node-cron';
import { autoRejectOldLeaves, performYearEndBalanceUpdates } from '../utility/schedulerTasks.utility'; 


cron.schedule('0 1 * * *', () => {
    console.log('Triggering scheduled task: autoRejectOldLeaves');
    autoRejectOldLeaves(); 
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});


cron.schedule('0 2 1 1 *', () => { 
    console.log('Triggering scheduled task: performYearEndBalanceUpdates');
    performYearEndBalanceUpdates();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

console.log("Scheduled tasks (Auto-Reject Leaves, Year-End Balance Update) configured.");