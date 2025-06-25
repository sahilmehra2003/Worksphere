import ReviewCycle from '../models/reviewCycle.model.js';
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
            status
        } = req.body;

        if (!name || !year || !startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, year, startDate, and endDate are required.'
            });
        }

        const newCycleData = {
            name,
            year,
            description,
            startDate,
            endDate,
            selfAssessmentDueDate,
            managerReviewDueDate,
            status: status || 'Planned',
            createdBy: req.user._id
        };

        const newCycle = await ReviewCycle.create(newCycleData);

        res.status(201).json({
            success: true,
            message: 'Review Cycle created successfully.',
            data: newCycle
        });

    } catch (error) {
        console.error("Error creating review cycle:", error);
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: `A review cycle with the name '${req.body.name}' for year ${req.body.year} already exists.`
            });
        }
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
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Review Cycle ID format.' });
        }

        const cycle = await ReviewCycle.findById(id);

        if (!cycle) {
            return res.status(404).json({ success: false, message: 'Review Cycle not found.' });
        }

        if (cycle.status !== 'Planned') {
            return res.status(400).json({
                success: false,
                message: `Review Cycle is already '${cycle.status}'. Only 'Planned' cycles can be activated.`
            });
        }

        cycle.status = 'Active';
        cycle.updatedBy = req.user._id;
        await cycle.save();

        res.status(200).json({
            success: true,
            message: `Review Cycle '${cycle.name} ${cycle.year}' has been activated.`,
            data: cycle
        });

    } catch (error) {
        console.error("Error activating review cycle:", error);
        res.status(500).json({
            success: false,
            message: 'Server error activating review cycle.',
            error: error.message
        });
    }
};

// --- Get All Review Cycles with Pagination ---
export const getAllReviewCycles = async (req, res) => {
    try {
        const { status, year, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

        // --- Build Filter Query ---
        const query = {};
        if (status) query.status = status;
        if (year && !isNaN(parseInt(year))) query.year = parseInt(year);

        // --- Build Sort Query ---
        const sort = {};
        if (sortBy === 'startDate') {
            sort.startDate = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort.year = sortOrder === 'asc' ? 1 : -1;
            sort.name = 1;
        }

        // --- Pagination Logic ---
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // --- Execute Queries in Parallel ---
        const [cycles, totalRecords] = await Promise.all([
            ReviewCycle.find(query)
                .populate('createdBy', 'name email')
                .sort(sort)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            ReviewCycle.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalRecords / limitNum);

        res.status(200).json({
            success: true,
            count: cycles.length,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalRecords
            },
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

// --- Get a Single Review Cycle by ID ---
export const getReviewCycleById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Review Cycle ID format.' });
        }
        const cycle = await ReviewCycle.findById(id).populate('createdBy', 'name email').populate('updatedBy', 'name email');
        if (!cycle) {
            return res.status(404).json({ success: false, message: 'Review Cycle not found.' });
        }
        res.status(200).json({ success: true, data: cycle });
    } catch (error) {
        console.error("Error fetching review cycle by ID:", error);
        res.status(500).json({ success: false, message: 'Server error fetching review cycle.', error: error.message });
    }
};

// --- Update a Review Cycle ---
export const updateReviewCycle = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Review Cycle ID format.' });
        }

        delete updateData.name;
        delete updateData.year;
        updateData.updatedBy = req.user._id;

        const updatedCycle = await ReviewCycle.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
            .populate('createdBy', 'name email').populate('updatedBy', 'name email');

        if (!updatedCycle) {
            return res.status(404).json({ success: false, message: 'Review Cycle not found.' });
        }
        res.status(200).json({ success: true, message: 'Review Cycle updated successfully.', data: updatedCycle });

    } catch (error) {
        console.error("Error updating review cycle:", error);
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: `Update failed: A review cycle with the resulting name and year combination already exists.` });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error updating review cycle.', error: error.message });
    }
};

// --- Delete a Planned Review Cycle ---
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
        res.status(200).json({ success: true, message: 'Review Cycle deleted successfully.', data: {} });

    } catch (error) {
        console.error("Error deleting review cycle:", error);
        res.status(500).json({ success: false, message: 'Server error deleting review cycle.', error: error.message });
    }
};
