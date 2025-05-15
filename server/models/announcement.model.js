import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Announcement title is required.'],
            trim: true,
            maxlength: [200, 'Title cannot be more than 200 characters.'],
        },
        content: {
            type: String,
            required: [true, 'Announcement content is required.'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['Draft', 'Published', 'Archived'],
            default: 'Draft',
            index: true,
        },
        isSticky: { // To keep important announcements at the top
            type: Boolean,
            default: false,
        },
        targetRoles: { // Roles this announcement is visible to. Empty means all roles.
            type: [String], // e.g., ['Employee', 'Manager']
            default: [],
        },
        targetDepartments: { // Departments this announcement is visible to. Empty means all departments.
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'Department',
            default: [],
        },
        publishDate: { // Date when the announcement becomes active if status is 'Published'
            type: Date,
            validate: {
                validator: function (v) {
                    return !v || v instanceof Date;
                },
                message: 'Publish date must be a valid date'
            }
        },
        expiryDate: { // Date after which the announcement is no longer considered active
            type: Date,
            validate: {
                validator: function (v) {
                    if (!v) return true;
                    if (!(v instanceof Date)) return false;
                    if (this.publishDate && v <= this.publishDate) return false;
                    return true;
                },
                message: 'Expiry date must be after publish date'
            }
        },
        views: {
            type: Number,
            default: 0,
            min: [0, 'Views cannot be negative']
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
        },
        // Consider adding a 'views' count or 'readBy' array if tracking is needed, though this can add complexity.
    },
    {
        timestamps: true,
    }
);

// Combined index for efficient querying of active announcements
announcementSchema.index({
    status: 1,
    publishDate: -1,
    expiryDate: 1,
    isSticky: -1,
    targetRoles: 1,
    targetDepartments: 1
});

// Pre-save hook to set publishDate if status is 'Published' and publishDate is not already set
announcementSchema.pre('save', function (next) {
    if (this.isModified('status') && this.status === 'Published' && !this.publishDate) {
        this.publishDate = new Date();
    }
    next();
});

// Method to check if an announcement is currently active
announcementSchema.methods.isActive = function () {
    const now = new Date();
    return (
        this.status === 'Published' &&
        (!this.publishDate || this.publishDate <= now) &&
        (!this.expiryDate || this.expiryDate > now)
    );
};

// Method to increment views
announcementSchema.methods.incrementViews = async function () {
    this.views += 1;
    return this.save();
};

// Static method to find all active announcements
announcementSchema.statics.findActive = function () {
    const now = new Date();
    return this.find({
        status: 'Published',
        $or: [
            { publishDate: { $exists: false } },
            { publishDate: { $lte: now } }
        ],
        $or: [
            { expiryDate: { $exists: false } },
            { expiryDate: { $gt: now } }
        ]
    }).sort({ isSticky: -1, publishDate: -1 });
};

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;