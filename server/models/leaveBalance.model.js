// models/leaveBalance.model.js
import mongoose from 'mongoose';

// Define base quotas (Consider making these configurable later, e.g., in a policy document)
const ANNUAL_QUOTAS = {
    casual: 12,
    sick: 10,
    earned: 15,
    maternity: 180,
    paternity: 15,
};

const leaveBalanceSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee", // Link to your Employee model
        required: true,
        unique: true, // Each employee should have only one balance document
        index: true,
    },
    // Casual Leave: Often lapses if not used, but can have some carry forward
    casualLeaves: {
        current: { type: Number, default: ANNUAL_QUOTAS.casual, min: 0 },
        carried: { type: Number, default: 0, min: 0 }, // Carried from previous year
        maxCarryForward: { type: Number, default: 5 } // Max CLs that can be carried over
    },
    // Sick Leave: Often doesn't carry forward, or has different rules
    sickLeaves: {
        current: { type: Number, default: ANNUAL_QUOTAS.sick, min: 0 },
        // Assuming no carry-forward for sick leaves based on previous logic
        // carried: { type: Number, default: 0 },
        // maxCarryForward: { type: Number, default: 0 } // Explicitly state no carry forward
    },
    // Earned Leave (Privilege Leave): Usually accrues and carries forward significantly
    earnedLeaves: {
        current: { type: Number, default: ANNUAL_QUOTAS.earned, min: 0 },
        carried: { type: Number, default: 0, min: 0 }, // Carried from previous year
        maxCarryForward: { type: Number, default: 30 } // Example: Max ELs that can be carried over (adjust as needed)
    },
    // Maternity Leave: Typically granted as a block, not accrued/carried annually in the same way
    maternityLeaves: {
        current: { type: Number, default: 0, min: 0 } // Granted when applicable, not reset annually here
        // quota: { type: Number, default: ANNUAL_QUOTAS.maternity } // Store quota separately?
    },
    // Paternity Leave: Similar to Maternity
    paternityLeaves: {
        current: { type: Number, default: 0, min: 0 }
        // quota: { type: Number, default: ANNUAL_QUOTAS.paternity }
    },
    // Compensatory Off: Earned for working extra, usually has an expiry date
    compensatoryLeaves: {
        current: { type: Number, default: 0, min: 0 }
        // Might need array of objects { earnedDate, expiryDate, count } for better tracking
    },
    // Leave Encashment: Balance of leaves eligible for encashment (often Earned Leaves beyond a limit)
    leaveEncashmentBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    // Tracks the last date the annual reset/carry-forward was performed
    lastResetDate: {
        type: Date,
        default: () => new Date(new Date().getFullYear(), 0, 1) // Default to Jan 1st of current year
    }
}, { timestamps: true }); // Adds createdAt, updatedAt

// --- Method to perform year-end leave carry forward and quota reset ---
// Note: This method MODIFIES the document instance but DOES NOT SAVE it automatically.
// It should be called within a scheduled job or administrative task.
leaveBalanceSchema.methods.performYearEndUpdate = function() {
    const now = new Date();
    // Check if the current year is later than the year of the last reset
    if (now.getFullYear() > this.lastResetDate.getFullYear()) {
        console.log(`Performing year-end update for employee ${this.employee} for year ${now.getFullYear()}`);

        // 1. Calculate amounts carried forward from *last* year's *remaining* balance
        this.casualLeaves.carried = Math.min(
            this.casualLeaves.current, // Remaining balance at year end
            this.casualLeaves.maxCarryForward
        );
        this.earnedLeaves.carried = Math.min(
            this.earnedLeaves.current, // Remaining balance at year end
            this.earnedLeaves.maxCarryForward
        );
        // Assuming Sick leaves do not carry forward based on schema structure
        // this.sickLeaves.carried = Math.min(this.sickLeaves.current, this.sickLeaves.maxCarryForward || 0);


        // 2. Reset CURRENT balances for the NEW year, adding the carried amount
        this.casualLeaves.current = ANNUAL_QUOTAS.casual + this.casualLeaves.carried;
        this.earnedLeaves.current = ANNUAL_QUOTAS.earned + this.earnedLeaves.carried;
        this.sickLeaves.current = ANNUAL_QUOTAS.sick; // Reset to quota (add carried if policy allows)

        // Reset balances for leaves not typically carried over annually (may need specific logic)
        // Maternity/Paternity are usually granted, not reset annually.
        // Compensatory off usually expires, handled separately.
        // this.compensatoryLeaves.current = 0; // Example: Expire all at year end? Needs policy.

        // 3. Update the last reset date to today (or Jan 1st of current year)
        this.lastResetDate = new Date(now.getFullYear(), 0, 1); // Set to Jan 1st of current year

        console.log(`Update complete for employee ${this.employee}. New balances - CL: ${this.casualLeaves.current}, EL: ${this.earnedLeaves.current}, SL: ${this.sickLeaves.current}`);
        return true; // Indicates an update was performed
    }
    // console.log(`No year-end update needed for employee ${this.employee}. Current Year: ${now.getFullYear()}, Last Reset: ${this.lastResetDate.getFullYear()}`);
    return false; 
};

const LeaveBalance = mongoose.model("LeaveBalance", leaveBalanceSchema);
export default LeaveBalance;