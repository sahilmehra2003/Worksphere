import PerformanceReview from "../models/employeePerformanceSchema.js";
import ReviewCycle from "../models/reviewCycle.model.js";
import Employee from "../models/employeeSchema.js";
import mongoose from "mongoose";


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
        const { reviewId } = req.params;
        const requestingUser = req.user; 

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ success: false, message: 'Invalid Performance Review ID format.' });
        }

        const review = await PerformanceReview.findOne({ _id: reviewId, isDeleted: false })
            .populate({ path: 'reviewCycle', select: 'name year startDate endDate status' })
            .populate({ path: 'employee', select: 'name email position department manager' }) 
            .populate({ path: 'manager', select: 'name email' }); 

        if (!review) {
            return res.status(404).json({ success: false, message: 'Performance Review not found.' });
        }

     
        const isAdminOrHR = requestingUser.role === 'Admin' || requestingUser.role === 'HR';
        const isOwnReview = requestingUser._id.equals(review.employee._id);
        const isTheirManager = requestingUser._id.equals(review.manager?._id); // Check direct manager stored in review
        

        if (isAdminOrHR || isOwnReview || isTheirManager) {
            // User is authorized
             res.status(200).json({
                success: true,
                data: review
            });
        } else {
            // User is not authorized to view this specific review
            return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to view this review.' });
        }

    } catch (error) {
        console.error("Error fetching performance review by ID:", error);
        res.status(500).json({ success: false, message: 'Server error fetching review.', error: error.message });
    }
};


export const updatePerformanceReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const requestingUser = req.user;
        const updatePayload = req.body;

        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({ success: false, message: 'Invalid Performance Review ID format.' });
        }

        
        const review = await PerformanceReview.findOne({ _id: reviewId, isDeleted: false })
             .populate('employee', 'manager department projectTeam'); 

        if (!review) {
            return res.status(404).json({ success: false, message: 'Performance Review not found.' });
        }

        const allowedUpdates = {};
        const isOwnReview = requestingUser._id.equals(review.employee._id);
        const isManager = requestingUser._id.equals(review.manager); // Check against manager stored in review

        const isDeptHead = requestingUser.role === 'DepartmentHead' 
        const isTeamHead = requestingUser.role === 'TeamHead' 

      
        if (isOwnReview && updatePayload.hasOwnProperty('selfAssessmentComments')) {
            allowedUpdates.selfAssessmentComments = updatePayload.selfAssessmentComments;

        }

        if (isManager) {
            const managerFields = ['managerComments', 'managerRating', 'strengths', 'areasForDevelopment', 'clientRating', 'clientComments'];
            managerFields.forEach(field => {
                if (updatePayload.hasOwnProperty(field)) {
                    allowedUpdates[field] = updatePayload[field];
                }
            });
           
        }


        if (isDeptHead && review.employee) {

            const employeeDepartmentId = review.employee.department;

            let headManagesDeptId = null;
            try {

                const departmentManaged = await Department.findOne({ departmentHead: req.user._id });
                if (departmentManaged) {
                    headManagesDeptId = departmentManaged._id;
                }
            } catch(err) {
                console.error("Error looking up department for head:", err);
            }
            if (employeeDepartmentId && headManagesDeptId && employeeDepartmentId.equals(headManagesDeptId)) {
                console.log(`DeptHead Auth Success: User ${req.user._id} manages Dept ${headManagesDeptId}, Employee ${review.employee._id} is in Dept ${employeeDepartmentId}`);
                const headFields = ['departmentHeadRating', 'departmentHeadComments'];
                headFields.forEach(field => {
                    if (updatePayload.hasOwnProperty(field)) {
                        allowedUpdates[field] = updatePayload[field];
                    }
                });
            } else {
                 console.warn(`DeptHead Auth Failed: User ${req.user._id} does not manage employee ${review.employee._id}'s department (${employeeDepartmentId}). They manage dept ${headManagesDeptId}`);
            }
        }
        

         if (isTeamHead && review.employee) {

            const employeeTeamId = review.employee.projectTeam;
        
            if (employeeTeamId) {

                try {

                    const teamManagedByRequester = await ProjectTeam.findOne({
                        _id: employeeTeamId,      
                        teamLead: requestingUser._id 
                    });
        
                    if (teamManagedByRequester) {

                        console.log(`TeamHead Auth Success: User ${requestingUser._id} leads Team ${employeeTeamId}, Employee ${review.employee._id} is in this team.`);
 
                        const headFields = ['teamHeadRating', 'teamHeadComments']; 
                        headFields.forEach(field => {
                            if (updatePayload.hasOwnProperty(field)) {
                                allowedUpdates[field] = updatePayload[field];
                            }
                        });
                    } else {
                        console.warn(`TeamHead Auth Failed: User ${requestingUser._id} does not lead employee ${review.employee._id}'s assigned team (${employeeTeamId}).`);
                 
                    }
                } catch (teamLookupError) {
                    console.error(`Error checking team leadership for TeamHead ${requestingUser._id} and Team ${employeeTeamId}:`, teamLookupError);
                
                }
            } else {
               
                console.warn(`TeamHead Auth Failed: Employee ${review.employee._id} is not assigned to a project team.`);
              
            }
        }
        

        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields provided for update or insufficient permissions.' });
        }

        allowedUpdates.updatedAt = Date.now(); 

        const updatedReview = await PerformanceReview.findByIdAndUpdate(
            reviewId,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        )
        .populate({ path: 'reviewCycle', select: 'name year' })
        .populate({ path: 'employee', select: 'name email' })
        .populate({ path: 'manager', select: 'name email' });


        res.status(200).json({
            success: true,
            message: 'Performance Review updated successfully.',
            data: updatedReview
        });

    } catch (error) {
        console.error("Error updating performance review:", error);
         if (error.name === 'ValidationError') {
             return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error updating review.', error: error.message });
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


// Only HR/Admin
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