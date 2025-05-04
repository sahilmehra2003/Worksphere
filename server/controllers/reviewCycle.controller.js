import ReviewCycle from '../models/reviewCycle.model.js'; // Adjust path as needed
import Employee from '../models/employeeSchema.js';
import PerformanceReview from '../models/employeePerformanceSchema.js';
import mongoose from 'mongoose';

// --- Create a new Review Cycle ---
export const createReviewCycle = async (req, res) => {
    try {
        const {
            name,
            year,
            description,
            startDate,
            endDate,
            selfAssessmentDueDate,
            managerReviewDueDate,
            status // Optional: If provided, otherwise defaults to 'Planned'
        } = req.body;

        // Basic validation for required fields defined in the schema
        if (!name || !year || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, year, startDate, endDate are required.'
            });
        }

        // TODO: Add more specific validation if needed (e.g., check date formats/logic beyond schema)

        const newCycleData = {
            name,
            year,
            description,
            startDate,
            endDate,
            selfAssessmentDueDate,
            managerReviewDueDate,
            status: status || 'Planned', // Default to 'Planned' if not provided
            createdBy: req.user._id // Assuming authN middleware added req.user
        };

        const newCycle = await ReviewCycle.create(newCycleData);

        res.status(201).json({
            success: true,
            message: 'Review Cycle created successfully.',
            data: newCycle
        });

    } catch (error) {
        console.error("Error creating review cycle:", error);
        // Handle potential duplicate key error (name + year)
        if (error.code === 11000) {
             return res.status(409).json({ // 409 Conflict
                 success: false,
                 message: `A review cycle with name '${req.body.name}' for year ${req.body.year} already exists.`
            });
        }
        // Handle validation errors from Mongoose
        if (error.name === 'ValidationError') {
             return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
        }
        res.status(500).json({
            success: false,
            message: 'Server error creating review cycle.',
            error: error.message
        });
    }
};

export const activateReviewCycle = async (req, res) => {
    const session = await mongoose.startSession(); // Use session for transaction
    session.startTransaction(); // Start transaction

    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: 'Invalid Review Cycle ID format.' });
        }

        // 1. Find the cycle and check its status within the transaction
        const cycle = await ReviewCycle.findById(id).session(session);

        if (!cycle) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: 'Review Cycle not found.' });
        }

        if (cycle.status !== 'Planned') {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: `Review Cycle is already '${cycle.status}'. Cannot activate.`
            });
        }

        // 2. Update the cycle status to 'Active' within the transaction
        cycle.status = 'Active';
        cycle.updatedBy = req.user._id; 
        await cycle.save({ session }); 

        
        const eligibleEmployees = await Employee.find(
            { employmentStatus: 'working' }, // Adjust eligibility criteria if needed
            '_id manager'
        ).session(session).lean();

        if (!eligibleEmployees || eligibleEmployees.length === 0) {
            // It's possible there are no eligible employees, but the cycle should still activate.
            // Log a warning maybe? Depends on requirements.
            console.warn(`Review Cycle ${cycle.name} (${cycle.year}) activated, but no eligible employees found.`);
            // Continue to commit transaction and send email.
        }

        // 4. Create PerformanceReview documents for eligible employees
        let reviewsCreatedCount = 0;
        let reviewsSkippedCount = 0;
        const creationPromises = [];

        for (const employee of eligibleEmployees) {
            // Check if a review already exists for this employee and cycle (to prevent duplicates)
            const existingReview = await PerformanceReview.findOne({
                employee: employee._id,
                reviewCycle: cycle._id
            }).session(session);

            if (!existingReview) {
                 if (!employee.manager) {
                    // Handle case where employee has no manager assigned
                    console.warn(`Skipping review creation for employee ${employee._id} in cycle ${cycle._id}: No manager assigned.`);
                    reviewsSkippedCount++;
                    continue; // Skip this employee
                }
                // Prepare creation promise
                 creationPromises.push(PerformanceReview.create(
                    [{ // Must pass an array to create within a session
                        employee: employee._id,
                        reviewCycle: cycle._id,
                        manager: employee.manager, // Get manager from employee record
                        status: 'Pending', 
                        isDeleted: false 
                       
                    }],
                    { session } 
                ));
                reviewsCreatedCount++;
            } else {
                console.log(`Review already exists for employee ${employee._id} and cycle ${cycle._id}. Skipping creation.`);
                reviewsSkippedCount++;
            }
        }

        // Execute all creation promises
        await Promise.all(creationPromises);

        // 5. TODO: Trigger Email Notifications (after transaction commits)
        // This should happen *after* successfully committing the transaction.

        // 6. Commit the transaction
        await session.commitTransaction();
        session.endSession();

        console.log(`Review Cycle ${id} activated. Created ${reviewsCreatedCount} reviews, skipped ${reviewsSkippedCount}.`);

        
        res.status(200).json({
            success: true,
            message: `Review Cycle activated successfully. ${reviewsCreatedCount} performance reviews created.`,
            data: {
                cycleId: cycle._id,
                status: cycle.status,
                reviewsCreated: reviewsCreatedCount,
                reviewsSkipped: reviewsSkippedCount // Includes duplicates and those missing managers
            }
        });

    } catch (error) {
        // If any error occurred, abort the transaction
        console.error("Error activating review cycle:", error);
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            success: false,
            message: 'Server error activating review cycle.',
            error: error.message
        });
    }
};

export const getAllReviewCycles = async (req, res) => {
    try {
        // Basic filtering example (can be expanded)
        const query = {};
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.year) {
            query.year = parseInt(req.query.year); // Ensure year is a number
            if (isNaN(query.year)) {
                return res.status(400).json({ success: false, message: "Invalid year provided for filtering."});
            }
        }

        const sort = {};
        if (req.query.sortBy === 'startDate') {
            sort.startDate = req.query.sortOrder === 'desc' ? -1 : 1;
        } else {
            sort.year = req.query.sortOrder === 'asc' ? 1 : -1; // Default sort by year desc
            sort.name = 1; // Then by name asc
        }

        // TODO: Add pagination later if needed

        const cycles = await ReviewCycle.find(query)
                                        .populate('createdBy', 'name email') 
                                        .sort(sort)
                                        .lean(); 

        res.status(200).json({
            success: true,
            count: cycles.length,
            data: cycles
        });

    } catch (error) {
        console.error("Error fetching review cycles:", error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching review cycles.',
            error: error.message
        });
    }
};

export const getReviewCycleById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Review Cycle ID format.' });
        }

        const cycle = await ReviewCycle.findById(id)
                                      .populate('createdBy', 'name email') 
                                      .populate('updatedBy', 'name email'); 

        if (!cycle) {
            return res.status(404).json({
                success: false,
                message: 'Review Cycle not found.'
            });
        }

        res.status(200).json({
            success: true,
            data: cycle
        });

    } catch (error) {
        console.error("Error fetching review cycle by ID:", error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching review cycle.',
            error: error.message
        });
    }
};


export const updateReviewCycle = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body }; 

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Review Cycle ID format.' });
        }

        
         delete updateData.name; 
         delete updateData.year; 

        // Add updatedBy field
        updateData.updatedBy = req.user._id; 

        const updatedCycle = await ReviewCycle.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true, 
                runValidators: true 
            }
        ).populate('createdBy', 'name email').populate('updatedBy', 'name email');

        if (!updatedCycle) {
            return res.status(404).json({
                success: false,
                message: 'Review Cycle not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Review Cycle updated successfully.',
            data: updatedCycle
        });

    } catch (error) {
        console.error("Error updating review cycle:", error);
       
        if (error.code === 11000) {
             return res.status(409).json({ 
                 success: false,
                 message: `Update failed: A review cycle with the resulting name and year combination already exists.`
            });
        }
        
        if (error.name === 'ValidationError') {
             return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
        }
        res.status(500).json({
            success: false,
            message: 'Server error updating review cycle.',
            error: error.message
        });
    }
};


export const deleteReviewCycle = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Review Cycle ID format.' });
        }

        const cycleToDelete = await ReviewCycle.findById(id);

        if (!cycleToDelete) {
             return res.status(404).json({ success: false, message: 'Review Cycle not found.' });
        }

        if (cycleToDelete.status !== 'Planned') {
            return res.status(400).json({
                success: false,
                message: `Cannot delete a cycle that is '${cycleToDelete.status}'. Only 'Planned' cycles can be deleted.`
            });
        }
       

        await ReviewCycle.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Review Cycle deleted successfully.',
            data: {} 
        });

    } catch (error) {
        console.error("Error deleting review cycle:", error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting review cycle.',
            error: error.message
        });
    }
};