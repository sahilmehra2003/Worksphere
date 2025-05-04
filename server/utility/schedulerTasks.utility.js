import Leave from '../models/leaveRequest.model.js'
import LeaveBalance from '../models/leaveBalance.model.js'

const AUTO_REJECT_DAYS = 7; // Days after which a pending request is auto-rejected

export const autoRejectOldLeaves = async () => {
    console.log(`[Scheduler Task] Running: Auto-Rejecting Leaves older than ${AUTO_REJECT_DAYS} days...`);
    try {
        const rejectionThresholdDate = new Date();
        rejectionThresholdDate.setDate(rejectionThresholdDate.getDate() - AUTO_REJECT_DAYS);

        const result = await Leave.updateMany(
            {
                status: 'Pending',
                createdAt: { $lte: rejectionThresholdDate } // Find pending leaves created on or before the threshold date
            },
            {
                $set: {
                    status: 'Auto-Rejected',
                    rejectionReason: `Request automatically rejected after ${AUTO_REJECT_DAYS} days of pending status.`
                    // Optionally set a system user ID if you track who modified records
                    // updatedBySystem: true // Example flag
                }
            }
        );

        if (result.matchedCount > 0 && result.modifiedCount > 0) {
            console.log(`[Scheduler Task] Success: Auto-rejected ${result.modifiedCount} leave request(s).`);
        } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
             console.log(`[Scheduler Task] Info: Found ${result.matchedCount} matching leave(s), but none needed updating (check query/status).`);
        }
         else {
            console.log('[Scheduler Task] Info: No pending leave requests found needing auto-rejection.');
        }
        return { success: true, rejectedCount: result.modifiedCount };

    } catch (error) {
        console.error('[Scheduler Task] ERROR during automatic leave rejection:', error);
        return { success: false, error: error.message };
    }
};


/**
 * Iterates through employee leave balances and performs the year-end carry-forward and quota reset.
 * Calls the 'performYearEndUpdate' method defined on the LeaveBalance schema.
 */
export const performYearEndBalanceUpdates = async () => {
    const currentYear = new Date().getFullYear();
    console.log(`[Scheduler Task] Running: Performing Year-End Leave Balance Update Check for year ${currentYear}...`);

    let updatedCount = 0;
    let errorCount = 0;
    let alreadyUpToDateCount = 0;

    try {
        // Find balances where the last reset was sometime *before* Jan 1st of the *current* year
        const resetDateThreshold = new Date(currentYear, 0, 1); // Jan 1st of current year

        // Use a cursor to process potentially many documents efficiently
        const cursor = LeaveBalance.find({
            lastResetDate: { $lt: resetDateThreshold }
            // Optional: Add filter for active employees if LeaveBalance has employee status or link
            // 'employee.isActive': true // Requires population or separate check
        }).cursor();

        await cursor.eachAsync(async (balance) => {
            try {
                 // The performYearEndUpdate method checks if an update is needed
                 // and modifies the 'balance' object in memory
                const updateNeeded = balance.performYearEndUpdate(); // Uses method from schema

                if (updateNeeded) {
                     // If the method indicated an update was performed in memory, save it to DB
                    await balance.save();
                    updatedCount++;
                    console.log(`[Scheduler Task] Updated balance for employee ${balance.employee}`);
                } else {
                     // If the method returned false, the year was already current
                     alreadyUpToDateCount++;
                     // Optionally update the date anyway if needed? Depends on logic.
                     // balance.lastResetDate = resetDateThreshold;
                     // await balance.save();
                }
            } catch (saveError) {
                console.error(`[Scheduler Task] ERROR saving updated balance for employee ${balance.employee}:`, saveError);
                errorCount++;
                // Decide whether to continue processing others or stop on error
            }
        });

        console.log(`[Scheduler Task] Year-End Balance Update Summary: Updated: ${updatedCount}, Errors: ${errorCount}, Already Up-to-Date: ${alreadyUpToDateCount}`);
        return { success: true, updated: updatedCount, errors: errorCount, skipped: alreadyUpToDateCount };

    } catch (error) {
        console.error('[Scheduler Task] ERROR during year-end balance update process:', error);
        return { success: false, error: error.message };
    }
};