import PerformanceReview from "../models/employeePerformanceSchema.js";
import ReviewCycle from "../models/reviewCycle.model.js";
import Employee from "../models/employeeSchema.js";
import Goal from "../models/goal.model.js";
import mongoose from "mongoose";




export const createPerformanceReview = async (req, res) => {
    try {
        const { employeeId, reviewCycleId } = req.body;

        // --- Validation ---
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ success: false, message: "Employee not found." });

        const reviewCycle = await ReviewCycle.findById(reviewCycleId);
        if (!reviewCycle) return res.status(404).json({ success: false, message: "Review Cycle not found." });
        if (reviewCycle.status !== 'Active') {
            return res.status(400).json({ success: false, message: "Reviews can only be initiated for 'Active' review cycles." });
        }

        // --- Prevent Duplicates ---
        const existingReview = await PerformanceReview.findOne({ employee: employeeId, reviewCycle: reviewCycleId });
        if (existingReview) {
            return res.status(409).json({ success: false, message: "A performance review for this employee already exists in this cycle." });
        }

        // --- Fetch employee's goals for this specific cycle ---
        const employeeGoals = await Goal.find({ employee: employeeId, reviewCycle: reviewCycleId });

        // --- Create the Review ---
        const newReview = await PerformanceReview.create({
            employee: employeeId,
            reviewCycle: reviewCycleId,
            manager: employee.manager || null, // Allow null if no manager assigned
            goals: employeeGoals.map(goal => goal._id),
            status: 'Pending Self-Assessment'
        });

        res.status(201).json({ success: true, message: "Performance review initiated successfully.", data: newReview });

    } catch (error) {
        console.error("Error creating performance review:", error);
        res.status(500).json({ success: false, message: 'Server error while initiating review.' });
    }
};

export const getMyPerformanceReviews = async (req, res) => {
    try {

        const employeeId = req.user._id;


        const query = {
            employee: employeeId,
            isDeleted: false
        };


        // Find the reviews
        const reviews = await PerformanceReview.find(query)
            // Populate details from related documents
            .populate({
                path: 'reviewCycle',
                select: 'name year startDate endDate status'
            })
            .populate({
                path: 'manager',
                select: 'name email'
            })

            .sort({ 'reviewCycle.startDate': -1 })
            .lean();


        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });

    } catch (error) {
        console.error("Error fetching employee's performance reviews:", error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching performance reviews.',
            error: error.message
        });
    }
};


// --- Get Performance Reviews for Team Members (Manager/Head View) ---
export const getTeamPerformanceReviews = async (req, res) => {
    try {
        const managerId = req.user._id; // Logged-in user is the manager/head

        // Find employees reporting directly to this manager/head who are active
        // NOTE: This only covers DIRECT reports. Logic for DeptHead/TeamHead needing wider access is more complex.
        // We might need to adjust based on role if a Head needs to see beyond direct reports.
        const teamMembers = await Employee.find(
            { manager: managerId, employmentStatus: 'working' }, // Find direct reports who are 'working'
            '_id' // Select only the ID
        ).lean();

        if (!teamMembers || teamMembers.length === 0) {
            return res.status(200).json({ success: true, count: 0, data: [] }); // No team members found
        }

        const teamMemberIds = teamMembers.map(member => member._id);

        // Base query for reviews of team members, not deleted
        const query = {
            employee: { $in: teamMemberIds },
            isDeleted: false
        };

        // --- Optional: Add filtering by req.query ---
        if (req.query.cycleId && mongoose.Types.ObjectId.isValid(req.query.cycleId)) {
            query.reviewCycle = req.query.cycleId;
        }
        // Add other filters like year if needed (would involve querying ReviewCycle first)

        const reviews = await PerformanceReview.find(query)
            .populate({ path: 'reviewCycle', select: 'name year startDate endDate status' })
            .populate({ path: 'employee', select: 'name email position' }) // Populate the employee being reviewed
            .sort({ 'employee.name': 1, 'reviewCycle.startDate': -1 }) // Sort by employee name, then cycle date
            .lean();

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });

    } catch (error) {
        console.error("Error fetching team performance reviews:", error);
        res.status(500).json({ success: false, message: 'Server error fetching team reviews.', error: error.message });
    }
};


export const getPerformanceReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const requestingUser = req.user;

        const review = await PerformanceReview.findOne({ _id: id, isDeleted: false })
            .populate({ path: 'reviewCycle', select: 'name year startDate endDate status' })
            .populate({ path: 'employee', select: 'name email position' })
            .populate({ path: 'manager', select: 'name email' })
            .populate({ path: 'goals', select: 'description status progress' });

        if (!review) {
            return res.status(404).json({ success: false, message: 'Performance Review not found.' });
        }

        // Authorization logic remains the same
        const isAdminOrHR = requestingUser.role === 'Admin' || requestingUser.role === 'HR';
        const isOwnReview = requestingUser._id.equals(review.employee._id);
        const isTheirManager = requestingUser._id.equals(review.manager?._id);

        if (isAdminOrHR || isOwnReview || isTheirManager) {
            return res.status(200).json({ success: true, data: review });
        } else {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }

    } catch (error) {
        console.error("Error fetching performance review by ID:", error);
        res.status(500).json({ success: false, message: 'Server error fetching review.' });
    }
};

export const updatePerformanceReview = async (req, res) => {
    try {
        const { id } = req.params;
        const updatePayload = req.body;
        const requester = req.user;

        const review = await PerformanceReview.findById(id);
        if (!review) return res.status(404).json({ success: false, message: "Review not found." });
        if (['Completed', 'Closed'].includes(review.status)) {
            return res.status(400).json({ success: false, message: 'This review is completed and cannot be updated.' });
        }

        let allowedUpdates = {};
        let successMessage = "Review updated successfully.";

        // --- Logic for Employee submitting Self-Assessment ---
        if (review.employee.equals(requester._id)) {
            if (review.status === 'Pending Self-Assessment') {
                if (updatePayload.selfAssessmentComments !== undefined) {
                    allowedUpdates.selfAssessmentComments = updatePayload.selfAssessmentComments;
                }
                allowedUpdates.status = 'Pending Manager Review';
                successMessage = "Self-assessment submitted successfully.";
            } else {
                return res.status(400).json({ success: false, message: `Cannot submit self-assessment. Review status is '${review.status}'.` });
            }
        }
        // --- Logic for Manager submitting their review ---
        else if (review.manager && review.manager.equals(requester._id)) {
            if (review.status === 'Pending Manager Review') {
                const managerFields = ['managerComments', 'managerRating', 'strengths', 'areasForDevelopment'];
                managerFields.forEach(field => {
                    if (updatePayload[field] !== undefined) allowedUpdates[field] = updatePayload[field];
                });
                allowedUpdates.status = 'Completed';
                successMessage = "Manager review submitted successfully.";
            } else {
                return res.status(400).json({ success: false, message: `Cannot submit manager review. Status is '${review.status}'.` });
            }
        }
        // --- Logic for Employee Acknowledging the review ---
        else if (review.employee.equals(requester._id)) {
            if (review.status === 'Completed') {
                allowedUpdates.status = 'Closed';
                successMessage = "Review acknowledged successfully.";
            } else {
                return res.status(400).json({ success: false, message: `Cannot acknowledge review. Status is '${review.status}'.` });
            }
        } else {
            return res.status(403).json({ success: false, message: "You can only update your own reviews or reviews you manage." });
        }

        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({ success: false, message: "No valid fields provided for update." });
        }

        const updatedReview = await PerformanceReview.findByIdAndUpdate(id, { $set: allowedUpdates }, { new: true });
        res.status(200).json({ success: true, message: successMessage, data: updatedReview });

    } catch (error) {
        console.error("Error updating performance review:", error);
        res.status(500).json({ success: false, message: 'Server error while updating review.' });
    }
};


export const getAllPerformanceReviews = async (req, res) => {
    try {
        // Base query to exclude soft-deleted reviews
        const query = { isDeleted: false };

        if (req.query.cycleId && mongoose.Types.ObjectId.isValid(req.query.cycleId)) {
            query.reviewCycle = req.query.cycleId;
        }
        if (req.query.employeeId && mongoose.Types.ObjectId.isValid(req.query.employeeId)) {
            query.employee = req.query.employeeId;
        }
        if (req.query.managerId && mongoose.Types.ObjectId.isValid(req.query.managerId)) {
            query.manager = req.query.managerId;
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20; // Default limit 20
        const skip = (page - 1) * limit;

        // Simpler sort for now: by creation date
        const sort = { createdAt: -1 };

        const reviews = await PerformanceReview.find(query)
            .populate({ path: 'reviewCycle', select: 'name year' })
            .populate({ path: 'employee', select: 'name email' })
            .populate({ path: 'manager', select: 'name email' })
            .sort(sort) // Add sort - careful with sorting on populated fields
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count for pagination
        const totalReviews = await PerformanceReview.countDocuments(query);

        res.status(200).json({
            success: true,
            count: reviews.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalReviews / limit),
                totalReviews: totalReviews
            },
            data: reviews
        });

    } catch (error) {
        console.error("Error fetching all performance reviews:", error);
        res.status(500).json({ success: false, message: 'Server error fetching reviews.', error: error.message });
    }
};



export const softDeletePerformanceReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ success: false, message: 'Invalid Performance Review ID format.' });
        }

        const updatedReview = await PerformanceReview.findByIdAndUpdate(
            reviewId,
            { isDeleted: true },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({ success: false, message: 'Performance Review not found.' });
        }

        res.status(200).json({
            success: true,
            message: 'Performance Review marked as deleted successfully.',
            data: { id: updatedReview._id, isDeleted: updatedReview.isDeleted }
        });

    } catch (error) {
        console.error("Error soft deleting performance review:", error);
        res.status(500).json({ success: false, message: 'Server error deleting review.', error: error.message });
    }
};

// --- NEW: Submit Self-Assessment ---
export const submitSelfAssessment = async (req, res) => {
    try {
        const { reviewId, employeeId, reviewCycleId, selfAssessmentComments } = req.body;
        const requester = req.user;

        let targetReviewId = reviewId;
        let review;

        // If no reviewId provided, find or create review
        if (!targetReviewId) {
            if (!employeeId || !reviewCycleId) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID and Review Cycle ID are required when creating a new review."
                });
            }

            // Check if review already exists
            review = await PerformanceReview.findOne({
                employee: employeeId,
                reviewCycle: reviewCycleId,
                isDeleted: false
            });

            if (review) {
                targetReviewId = review._id;
            } else {
                // Create new review
                const employee = await Employee.findById(employeeId);
                if (!employee) {
                    return res.status(404).json({ success: false, message: "Employee not found." });
                }

                const reviewCycle = await ReviewCycle.findById(reviewCycleId);
                if (!reviewCycle) {
                    return res.status(404).json({ success: false, message: "Review Cycle not found." });
                }

                const employeeGoals = await Goal.find({ employee: employeeId, reviewCycle: reviewCycleId });

                review = await PerformanceReview.create({
                    employee: employeeId,
                    reviewCycle: reviewCycleId,
                    manager: employee.manager || null,
                    goals: employeeGoals.map(goal => goal._id),
                    status: 'Pending Self-Assessment'
                });
                targetReviewId = review._id;
            }
        } else {
            review = await PerformanceReview.findById(targetReviewId);
        }

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        // Authorization check
        const isAdminOrHR = requester.role === 'Admin' || requester.role === 'HR';
        const isOwnReview = review.employee.equals(requester._id);

        if (!isAdminOrHR && !isOwnReview) {
            return res.status(403).json({
                success: false,
                message: "You can only submit self-assessment for your own review or as Admin/HR."
            });
        }

        // Status validation
        if (review.status !== 'Pending Self-Assessment') {
            return res.status(400).json({
                success: false,
                message: `Cannot submit self-assessment. Review status is '${review.status}'.`
            });
        }

        // Update the review
        const updatedReview = await PerformanceReview.findByIdAndUpdate(
            targetReviewId,
            {
                selfAssessmentComments,
                status: 'Pending Manager Review'
            },
            { new: true }
        ).populate([
            { path: 'reviewCycle', select: 'name year startDate endDate status' },
            { path: 'employee', select: 'name email position' },
            { path: 'manager', select: 'name email' },
            { path: 'goals', select: 'description status progress' }
        ]);

        res.status(200).json({
            success: true,
            message: "Self-assessment submitted successfully.",
            data: updatedReview
        });

    } catch (error) {
        console.error("Error submitting self-assessment:", error);
        res.status(500).json({ success: false, message: 'Server error while submitting self-assessment.' });
    }
};

// --- NEW: Submit Manager/HR/Admin Review ---
export const submitManagerReview = async (req, res) => {
    try {
        const {
            reviewId,
            employeeId,
            reviewCycleId,
            managerComments,
            managerRating,
            strengths,
            areasForDevelopment
        } = req.body;
        const requester = req.user;

        let targetReviewId = reviewId;
        let review;

        // If no reviewId provided, find or create review
        if (!targetReviewId) {
            if (!employeeId || !reviewCycleId) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID and Review Cycle ID are required when creating a new review."
                });
            }

            // Check if review already exists
            review = await PerformanceReview.findOne({
                employee: employeeId,
                reviewCycle: reviewCycleId,
                isDeleted: false
            });

            if (review) {
                targetReviewId = review._id;
            } else {
                // Create new review
                const employee = await Employee.findById(employeeId);
                if (!employee) {
                    return res.status(404).json({ success: false, message: "Employee not found." });
                }

                const reviewCycle = await ReviewCycle.findById(reviewCycleId);
                if (!reviewCycle) {
                    return res.status(404).json({ success: false, message: "Review Cycle not found." });
                }

                const employeeGoals = await Goal.find({ employee: employeeId, reviewCycle: reviewCycleId });

                review = await PerformanceReview.create({
                    employee: employeeId,
                    reviewCycle: reviewCycleId,
                    manager: requester._id, // Set the requester as manager
                    goals: employeeGoals.map(goal => goal._id),
                    status: 'Pending Manager Review'
                });
                targetReviewId = review._id;
            }
        } else {
            review = await PerformanceReview.findById(targetReviewId);
        }

        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        // Authorization check
        const isAdminOrHR = requester.role === 'Admin' || requester.role === 'HR';
        const isManager = review.manager && review.manager.equals(requester._id);

        if (!isAdminOrHR && !isManager) {
            return res.status(403).json({
                success: false,
                message: "You can only submit manager review for reviews you manage or as Admin/HR."
            });
        }

        // Status validation
        if (review.status !== 'Pending Manager Review') {
            return res.status(400).json({
                success: false,
                message: `Cannot submit manager review. Review status is '${review.status}'.`
            });
        }

        // Validation for required fields
        if (!managerComments || !managerRating) {
            return res.status(400).json({
                success: false,
                message: "Manager comments and rating are required."
            });
        }

        if (managerRating < 1 || managerRating > 5) {
            return res.status(400).json({
                success: false,
                message: "Manager rating must be between 1 and 5."
            });
        }

        // Update the review
        const updatedReview = await PerformanceReview.findByIdAndUpdate(
            targetReviewId,
            {
                managerComments,
                managerRating: parseInt(managerRating),
                strengths: strengths || [],
                areasForDevelopment: areasForDevelopment || [],
                status: 'Completed'
            },
            { new: true }
        ).populate([
            { path: 'reviewCycle', select: 'name year startDate endDate status' },
            { path: 'employee', select: 'name email position' },
            { path: 'manager', select: 'name email' },
            { path: 'goals', select: 'description status progress' }
        ]);

        res.status(200).json({
            success: true,
            message: "Manager review submitted successfully.",
            data: updatedReview
        });

    } catch (error) {
        console.error("Error submitting manager review:", error);
        res.status(500).json({ success: false, message: 'Server error while submitting manager review.' });
    }
};