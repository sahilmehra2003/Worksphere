import mongoose from 'mongoose';
import Announcement from '../models/announcement.model.js';


const handleServerError = (res, error, message = 'Server error') => {
    console.error(message, error);
    res.status(500).json({
        success: false,
        message: `${message}. Please check server logs.`,
        error: error.message,
    });
};

export const createAnnouncement = async (req, res) => {
    try {
        const {
            title,
            content,
            status,
            isSticky,
            targetRoles,
            targetDepartments,
            publishDate,
            expiryDate,
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({ success: false, message: 'Title and content are required.' });
        }

        const announcement = new Announcement({
            title,
            content,
            status: status || 'Draft',
            isSticky,
            targetRoles,
            targetDepartments,
            publishDate,
            expiryDate,
            createdBy: req.user._id,
        });

        await announcement.save();
        res.status(201).json({
            success: true,
            message: 'Announcement created successfully.',
            data: announcement,
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
        }
        handleServerError(res, error, 'Error creating announcement');
    }
};

export const getAllAnnouncementsForManagement = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            search,
        } = req.query;

        const query = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
            ];
        }

        const announcements = await Announcement.find(query)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .populate('targetDepartments', 'name')
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .lean();

        const totalAnnouncements = await Announcement.countDocuments(query);

        res.status(200).json({
            success: true,
            count: announcements.length,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalAnnouncements / parseInt(limit)),
                totalRecords: totalAnnouncements,
            },
            data: announcements,
        });
    } catch (error) {
        handleServerError(res, error, 'Error fetching announcements for management');
    }
};

export const getAnnouncementByIdForManagement = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });
        }

        const announcement = await Announcement.findById(id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .populate('targetDepartments', 'name')
            .lean();

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found.' });
        }

        res.status(200).json({ success: true, data: announcement });
    } catch (error) {
        handleServerError(res, error, 'Error fetching announcement by ID');
    }
};

export const updateAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });
        }

        const updates = req.body;
        updates.updatedBy = req.user._id;

        const announcement = await Announcement.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found.' });
        }

        res.status(200).json({
            success: true,
            message: 'Announcement updated successfully.',
            data: announcement,
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
        }
        handleServerError(res, error, 'Error updating announcement');
    }
};

export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });
        }

        const announcement = await Announcement.findByIdAndDelete(id);

        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found.' });
        }

        res.status(200).json({ success: true, message: 'Announcement deleted successfully.', data: {} });
    } catch (error) {
        handleServerError(res, error, 'Error deleting announcement');
    }
};

export const publishAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });
        }

        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found.' });
        }

        if (announcement.status === 'Published') {
            return res.status(400).json({ success: false, message: 'Announcement is already published.' });
        }

        announcement.status = 'Published';
        announcement.updatedBy = req.user._id;

        await announcement.save();
        res.status(200).json({ success: true, message: 'Announcement published successfully.', data: announcement });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
        }
        handleServerError(res, error, 'Error publishing announcement');
    }
};

export const archiveAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid announcement ID.' });
        }

        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found.' });
        }

        if (announcement.status === 'Archived') {
            return res.status(400).json({ success: false, message: 'Announcement is already archived.' });
        }

        announcement.status = 'Archived';
        announcement.updatedBy = req.user._id;

        await announcement.save();
        res.status(200).json({ success: true, message: 'Announcement archived successfully.', data: announcement });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
        }
        handleServerError(res, error, 'Error archiving announcement');
    }
};

export const getActiveAnnouncementsForUser = async (req, res) => {
    try {
        const userRole = req.user.role;
        const userDepartment = req.user.department;
        const now = new Date();

        // Base query for active announcements
        const queryForActive = {
            status: 'Published',
            $or: [
                { publishDate: { $exists: false } },
                { publishDate: { $lte: now } }
            ],
            $or: [
                { expiryDate: { $exists: false } },
                { expiryDate: { $gt: now } }
            ]
        };

        // Add role-based filtering if user has a role
        if (userRole) {
            queryForActive.$or = [
                { targetRoles: { $size: 0 } }, // Matches if targetRoles is empty (visible to all)
                { targetRoles: userRole }      // Matches if userRole is in targetRoles
            ];
        }

        // Add department-based filtering if user has a department
        if (userDepartment) {
            queryForActive.$or = [
                { targetDepartments: { $size: 0 } }, // Matches if targetDepartments is empty (visible to all)
                { targetDepartments: userDepartment } // Matches if userDepartment is in targetDepartments
            ];
        }

        const activeAnnouncements = await Announcement.find(queryForActive)
            .sort({ isSticky: -1, publishDate: -1 })
            .select('title content publishDate isSticky views createdAt')
            .lean();

        res.status(200).json({
            success: true,
            count: activeAnnouncements.length,
            data: activeAnnouncements,
        });
    } catch (error) {
        handleServerError(res, error, 'Error fetching active announcements');
    }
};