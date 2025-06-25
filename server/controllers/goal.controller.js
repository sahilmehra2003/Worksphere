import Goal from '../models/goal.model.js';
import ReviewCycle from '../models/reviewCycle.model.js';
import Employee from '../models/employeeSchema.js';
import mongoose from 'mongoose';
import { uploadOnCloudinary } from '../utility/fileUpload.utility.js'


export const createGoal = async (req, res) => {
    try {
        const { reviewCycleId, description } = req.body;
        const employeeId = req.user._id;

        const cycle = await ReviewCycle.findById(reviewCycleId);
        if (!cycle || cycle.status !== 'Active') {
            return res.status(400).json({ success: false, message: 'Goals can only be set for active review cycles.' });
        }

        const newGoal = await Goal.create({
            employee: employeeId,
            reviewCycle: reviewCycleId,
            description,
        });

        res.status(201).json({ success: true, message: 'Goal created successfully.', data: newGoal });
    } catch (error) {
        console.error("Error creating goal:", error);
        res.status(500).json({ success: false, message: 'Server error creating goal.' });
    }
};


export const getGoals = async (req, res) => {
    try {
        const { reviewCycleId, employeeId } = req.query;
        const query = {};
        if (reviewCycleId) query.reviewCycle = reviewCycleId;
        if (employeeId) query.employee = employeeId;

        const goals = await Goal.find(query).populate('employee', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: goals });

    } catch (error) {
        console.error("Error fetching goals:", error);
        res.status(500).json({ success: false, message: 'Server error fetching goals.' });
    }
};

export const getGoalsByEmployeeId = async (req, res) => {
    try {
        const { empId } = req.params;
        // Optionally, you can check permissions here if needed
        const goals = await Goal.find({ employee: empId }).populate('employee', 'name').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: goals });
    } catch (error) {
        console.error("Error fetching goals by employee ID:", error);
        res.status(500).json({ success: false, message: 'Server error fetching goals by employee ID.' });
    }
};

export const updateGoalProgress = async (req, res) => {
    try {
        const { goalId } = req.params;
        const { progress, progressDescription } = req.body;
        const employeeId = req.user._id;

        if (!progressDescription) {
            return res.status(400).json({ success: false, message: "A description of the progress is required for this update." });
        }

        const goal = await Goal.findById(goalId);
        if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
        if (!goal.employee.equals(employeeId)) return res.status(403).json({ success: false, message: 'You can only update your own goals.' });

        goal.progress = progress;
        goal.status = progress > 0 && progress < 100 ? 'In Progress' : progress === 100 ? 'Completed' : 'Not Started';

        // Add to the historical log
        goal.progressUpdates.push({
            description: progressDescription,
            updatedProgress: progress,
        });

        await goal.save();
        res.status(200).json({ success: true, message: 'Goal progress updated.', data: goal });

    } catch (error) {
        console.error("Error updating goal progress:", error);
        res.status(500).json({ success: false, message: 'Server error updating goal progress.' });
    }
};


export const addGoalComment = async (req, res) => {
    try {
        const { goalId } = req.params;
        const { comment } = req.body;
        const commenter = req.user;

        if (!comment || typeof comment !== 'string' || comment.trim() === '') {
            return res.status(400).json({ success: false, message: 'A non-empty comment is required.' });
        }

        const goal = await Goal.findById(goalId).populate('employee', 'manager');
        if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });

        let updateQuery = {};

        // Check if commenter is the employee's direct manager
        const isManager = goal.employee.manager?.equals(commenter._id);

        if (commenter.role === 'HR') {
            updateQuery = { $push: { hrComments: comment } };
        } else if (isManager) {
            updateQuery = { $push: { managerComments: comment } };
        } else {
            return res.status(403).json({ success: false, message: "You are not authorized to comment on this goal." });
        }

        const updatedGoal = await Goal.findByIdAndUpdate(goalId, updateQuery, { new: true });

        res.status(200).json({ success: true, message: 'Comment added successfully.', data: updatedGoal });

    } catch (error) {
        console.error("Error adding goal comment:", error);
        res.status(500).json({ success: false, message: 'Server error adding comment.' });
    }
};



export const addGoalEvidence = async (req, res) => {
    try {
        const { goalId } = req.params;
        const employeeId = req.user._id;

        const evidenceLocalPath = req.file?.path;
        if (!evidenceLocalPath) {
            return res.status(400).json({ success: false, message: 'No evidence file uploaded.' });
        }

        const goal = await Goal.findById(goalId);
        if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' });
        if (!goal.employee.equals(employeeId)) return res.status(403).json({ success: false, message: 'You can only add evidence to your own goals.' });

        const uploadResult = await uploadOnCloudinary(evidenceLocalPath);
        if (!uploadResult || !uploadResult.url) {
            return res.status(500).json({ success: false, message: 'Failed to upload evidence to cloud storage.' });
        }

        goal.evidence.push({
            imageUrl: uploadResult.secure_url,
            publicId: uploadResult.public_id
        });

        await goal.save();
        res.status(200).json({ success: true, message: 'Evidence added successfully.', data: goal });

    } catch (error) {
        console.error("Error adding goal evidence:", error);
        res.status(500).json({ success: false, message: 'Server error adding evidence.' });
    }
};


export const deleteGoal = async (req, res) => {
    try {
        const { goalId } = req.params;
        const employeeId = req.user._id;

        const goal = await Goal.findOne({ _id: goalId, employee: employeeId });
        if (!goal) return res.status(404).json({ success: false, message: 'Goal not found or you do not have permission to delete it.' });

        if (goal.status !== 'Not Started') {
            return res.status(400).json({ success: false, message: "Cannot delete a goal that is already in progress or completed." });
        }

        await Goal.findByIdAndDelete(goalId);
        res.status(200).json({ success: true, message: 'Goal deleted successfully.' });

    } catch (error) {
        console.error("Error deleting goal:", error);
        res.status(500).json({ success: false, message: 'Server error deleting goal.' });
    }
};
