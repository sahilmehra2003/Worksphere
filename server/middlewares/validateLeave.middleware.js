
import Leave from '../models/leaveRequest.model.js'

export const checkOverlappingLeaves = async (req, res, next) => {
    try {
        // Ensure user is authenticated by previous middleware
        if (!req.user || !req.user.id) {
            console.warn("checkOverlappingLeaves middleware called without authenticated user.");
            return res.status(401).json({ success: false, message: "Authentication required." });
        }

        const employeeId = req.user._id;
        const { startDate, endDate } = req.body;

        if (!startDate || !endDate) {
             // Basic check, more specific validation might happen in controller or dedicated validation middleware
             return res.status(400).json({ success: false, message: "Start date and end date are required in request body." });
        }

        // --- Date Validation ---
        let start, end;
        try {
             start = new Date(startDate);
             end = new Date(endDate);
              // Set end date to the end of the day for inclusive checking if needed, or ensure comparison logic handles it.
              // For overlap check, comparing dates directly is often sufficient if stored as Date objects.
             // end.setUTCHours(23, 59, 59, 999); // Optional: make endDate inclusive of the whole day

             if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                  throw new Error("Invalid date format");
             }
             if (start > end) {
                  return res.status(400).json({ success: false, message: "Leave start date cannot be after end date." });
             }
        } catch (dateError) {
             return res.status(400).json({ success: false, message: "Invalid start or end date format. Use YYYY-MM-DD." });
        }
        // --- End Date Validation ---


        // Find existing leaves that are not rejected or cancelled and overlap
        const overlappingLeaves = await Leave.find({
            employee: employeeId,
            status: { $in: ["Pending", "Approved"] }, // Check against active/pending requests
            // Overlap condition: (ExistingStart <= NewEnd) AND (ExistingEnd >= NewStart)
            startDate: { $lte: end },
            endDate: { $gte: start }
        }).lean(); // Use lean for performance as we only need to check existence/details

        if (overlappingLeaves.length > 0) {
            const overlapDetails = overlappingLeaves.map(l =>
                 // Ensure date formatting handles potential timezone issues if necessary
                 `${l.leaveType} (${l.startDate.toISOString().split('T')[0]} - ${l.endDate.toISOString().split('T')[0]})`
             ).join(', ');
            console.warn(`Overlap detected for employee ${employeeId}: ${overlapDetails}`);
            return res.status(400).json({ // 400 Bad Request is appropriate
                success: false,
                message: `Requested dates overlap with existing leave request(s): ${overlapDetails}`
            });
        }

        // No overlaps found, proceed to the next step (likely the applyLeave controller)
        next();

    } catch (error) {
        console.error("Error in checkOverlappingLeaves middleware:", error);
        // Pass error to the global Express error handler
        next(error);
    }
};