import Task from '../models/Task.model.js' 
import Employee from '../models/employeeSchema.js'; 
import mongoose from 'mongoose';

export const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            assignedTo, 
            deadlineDate, 
            priority, 
            relatedReview 

        } = req.body;

        const createdBy = req.user._id;

        if (!title || !assignedTo) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: title and assignedTo are required."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
             return res.status(400).json({ success: false, message: 'Invalid employee ID format for assignedTo.' });
        }

        const assignedEmployee = await Employee.findById(assignedTo);
        if (!assignedEmployee) {
             return res.status(404).json({ success: false, message: `Employee with ID ${assignedTo} not found.` });
        }

        let formattedDeadline = null;
        if (deadlineDate) {
            formattedDeadline = new Date(deadlineDate);
            if (isNaN(formattedDeadline.getTime())) {
                 return res.status(400).json({ success: false, message: 'Invalid deadline date format.' });
            }

            if (formattedDeadline <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Task deadline must be set to a future date and time.'
                });
            }
        }

        const taskData = {
            title,
            description,
            assignedTo,
            deadlineDate: formattedDeadline,
            priority, 
            relatedReview,
            createdBy,
            isCompleted: false, 
            completedDate: null 
        };

        const newTask = await Task.create(taskData);

   
        res.status(201).json({
            success: true,
            message: 'Task created successfully.',
            data: newTask
        });

    } catch (error) {
        console.error("Error creating task:", error);
        if (error.name === 'ValidationError') {
             return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
        }
        res.status(500).json({
            success: false,
            message: 'Server error creating task.',
            error: error.message
        });
    }
};


export const getTasksForUser = async (req, res) => {
    try {
        const employeeId = req.user._id;
        const now = new Date();

        const incompleteTasks = await Task.find({
            assignedTo: employeeId,
            isCompleted: false
        })
        .populate('createdBy', 'name') 
        .populate('relatedReview', 'reviewCycle') 
        .sort({ deadlineDate: 1, priority: -1, createdAt: 1 }) 
        .lean();

        const upcomingTasks = [];
        const overdueTasks = [];

        incompleteTasks.forEach(task => {
            if (task.deadlineDate && new Date(task.deadlineDate) < now) {
                overdueTasks.push(task); 
            } else {
                upcomingTasks.push(task); 
            }
        });

        const recentLimit = 5; 
        const completedTasks = await Task.find({
            assignedTo: employeeId,
            isCompleted: true
        })
        .populate('createdBy', 'name')
        .sort({ completedDate: -1 }) 
        .limit(recentLimit)
        .lean();


        res.status(200).json({
            success: true,
            data: {
                upcoming: upcomingTasks, 
                overdue: overdueTasks,   
                recentlyCompleted: completedTasks 
            }
        });

    } catch (error) {
        console.error("Error fetching user's tasks:", error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching tasks.',
            error: error.message
        });
    }
};

export const getAllTasks = async (req, res) => {
    try {
        const query = {}; 

        if (req.query.assignedTo && mongoose.Types.ObjectId.isValid(req.query.assignedTo)) {
            query.assignedTo = req.query.assignedTo;
        }
        if (req.query.isCompleted) {
            query.isCompleted = req.query.isCompleted === 'true'; 
        }
        if (req.query.priority) {
            query.priority = req.query.priority; 
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const sort = { createdAt: -1 };

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        const totalTasks = await Task.countDocuments(query);

        res.status(200).json({
            success: true,
            count: tasks.length,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalTasks / limit),
                totalTasks: totalTasks
            },
            data: tasks
        });

    } catch (error) {
        console.error("Error fetching all tasks:", error);
        res.status(500).json({ success: false, message: 'Server error fetching tasks.', error: error.message });
    }
};

export const getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;
        const requestingUser = req.user;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ success: false, message: 'Invalid Task ID format.' });
        }

        const task = await Task.findById(taskId)
            .populate('assignedTo', 'name email manager') 
            .populate('createdBy', 'name email'); 

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }

        const isAdminOrHR = ['Admin', 'HR'].includes(requestingUser.role);
        const isAssignee = requestingUser._id.equals(task.assignedTo?._id);

        const isAssigneeManager = task.assignedTo?.manager && requestingUser._id.equals(task.assignedTo.manager);

        if (isAdminOrHR || isAssignee || isAssigneeManager) {

            res.status(200).json({
                success: true,
                data: task
            });
        } else {

            return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to view this task.' });
        }


    } catch (error) {
        console.error("Error fetching task by ID:", error);
        res.status(500).json({ success: false, message: 'Server error fetching task.', error: error.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const requestingUser = req.user;
        const updatePayload = req.body;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ success: false, message: 'Invalid Task ID format.' });
        }

       
        const task = await Task.findById(taskId)
            .populate('assignedTo', 'manager') 
            .populate('createdBy'); 

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }

        if (task.isCompleted && updatePayload.hasOwnProperty('isCompleted') && updatePayload.isCompleted === false) {
             return res.status(400).json({ success: false, message: 'Cannot mark a completed task as incomplete here. Please use the specific "reopen" action if available.' });
        }

        const allowedUpdates = {};
        const isAdmin = requestingUser.role === 'Admin';
        const isAssignee = requestingUser._id.equals(task.assignedTo?._id);
        const isAssigneeManager = task.assignedTo?.manager && requestingUser._id.equals(task.assignedTo.manager);
        const isCreator = task.createdBy?._id && requestingUser._id.equals(task.createdBy._id);


        const editableFieldsByAssignee = ['isCompleted'];
        const editableFieldsByManager = ['title', 'description', 'deadlineDate', 'priority', 'isCompleted']; // Manager can edit details & complete
        const editableFieldsByCreator = ['title', 'description', 'deadlineDate', 'priority']; // Creator can edit details maybe?
        const editableFieldsByAdmin = ['title', 'description', 'deadlineDate', 'priority', 'isCompleted', 'assignedTo', 'relatedReview']; // Admin can edit almost everything

        for (const field in updatePayload) {

            if (Task.schema.paths.hasOwnProperty(field)) {
                let canUpdateField = false;

                if (isAdmin && editableFieldsByAdmin.includes(field)) {
                    canUpdateField = true;
                } else if (isAssigneeManager && editableFieldsByManager.includes(field)) {
                    canUpdateField = true;
                } else if (isAssignee && editableFieldsByAssignee.includes(field)) {
                     if (field === 'isCompleted' && updatePayload[field] !== true) {
                        console.warn(`User ${requestingUser._id} (Assignee) tried to set isCompleted to false on task ${taskId}. Denied.`);
                        continue;
                    }
                    canUpdateField = true;
                } else if (isCreator && editableFieldsByCreator.includes(field)) {
                    canUpdateField = true;
                }

                if (canUpdateField) {
                    if (field === 'deadlineDate' && updatePayload[field]) {
                         const newDeadline = new Date(updatePayload[field]);
                         if (isNaN(newDeadline.getTime())) {
                             return res.status(400).json({ success: false, message: 'Invalid deadline date format provided.' });
                         }
                         if (newDeadline <= new Date()) {
                             return res.status(400).json({ success: false, message: 'Task deadline must be set to a future date and time.'});
                         }
                         allowedUpdates[field] = newDeadline; 
                    } else {
                         allowedUpdates[field] = updatePayload[field];
                    }
                }
            }
        }

        if (Object.keys(allowedUpdates).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields provided for update or insufficient permissions for the provided fields.' });
        }
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            { $set: allowedUpdates },
            { new: true, runValidators: true } 
        )
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');


        res.status(200).json({
            success: true,
            message: 'Task updated successfully.',
            data: updatedTask
        });

    } catch (error) {
        console.error("Error updating task:", error);
         if (error.name === 'ValidationError') {
             return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error updating task.', error: error.message });
    }
};

export const reopenTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const requestingUser = req.user; 
        const { newDeadlineDate, description } = req.body; 

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ success: false, message: 'Invalid Task ID format.' });
        }
        if (!newDeadlineDate) {

            return res.status(400).json({ success: false, message: 'A new deadline date (newDeadlineDate) is required in the request body to reopen a task.' });
        }
        const validatedDeadline = new Date(newDeadlineDate);
        if (isNaN(validatedDeadline.getTime())) {
            return res.status(400).json({ success: false, message: 'Invalid format for new deadline date.' });
        }
 
        if (validatedDeadline <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'New deadline must be set to a future date and time.'
            });
        }
  
        const task = await Task.findById(taskId).populate('assignedTo', 'manager');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }
 
        if (!task.isCompleted) {
            return res.status(400).json({
                success: false,
                message: 'Task is already open or was never completed. Cannot reopen.'
            });
        }

        const isAdminOrHR = ['Admin', 'HR'].includes(requestingUser.role);
        const isAssigneeManager = task.assignedTo?.manager && requestingUser._id.equals(task.assignedTo.manager);

        if (!isAdminOrHR && !isAssigneeManager) {
            console.warn(`Forbidden: User ${requestingUser._id} (Role: ${requestingUser.role}) attempted to reopen task ${taskId} assigned to ${task.assignedTo?._id}`);
            return res.status(403).json({ success: false, message: 'You are not authorized to reopen this task.' });
        }

        task.isCompleted = false;
        task.completedDate = null;       
        task.isReopened = true;      
        task.deadlineDate = validatedDeadline;
        if (description !== undefined) {   
            task.description = description;
        }

        const reopenedTask = await task.save();

        console.log(`Task ${taskId} reopened by User ${requestingUser._id}. New deadline: ${validatedDeadline.toISOString()}`);
        res.status(200).json({
            success: true,
            message: 'Task reopened successfully.',
            data: reopenedTask
        });

    } catch (error) {
        console.error("Error reopening task:", error);
        if (error.name === 'ValidationError') {
             return res.status(400).json({ success: false, message: 'Validation Error reopening task.', error: error.message });
        }
        res.status(500).json({
            success: false,
            message: 'Server error reopening task.',
            error: error.message
        });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const requestingUser = req.user;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {
            return res.status(400).json({ success: false, message: 'Invalid Task ID format.' });
        }

        // Find the task first to check permissions before deleting
        const task = await Task.findById(taskId)
             .populate('assignedTo', 'manager') 
             .populate('createdBy'); 
        if (!task) {

            return res.status(404).json({ success: false, message: 'Task not found.' });
        }

        const isAdmin = requestingUser.role === 'Admin';
        const isAssigneeManager = task.assignedTo?.manager && requestingUser._id.equals(task.assignedTo.manager);
        const isCreator = task.createdBy?._id && requestingUser._id.equals(task.createdBy._id);

        if (isAdmin || isAssigneeManager || isCreator ) {
            await Task.findByIdAndDelete(taskId);

            console.log(`Task ${taskId} permanently deleted by User ${requestingUser._id}`);

            return res.status(204).send();
             // Or send 200 with a message if preferred:
            // return res.status(200).json({ success: true, message: 'Task deleted successfully.' });

        } else {
            console.warn(`Forbidden: User ${requestingUser._id} attempted to delete task ${taskId}.`);
            return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to delete this task.' });
        }

    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ success: false, message: 'Server error deleting task.', error: error.message });
    }
};

