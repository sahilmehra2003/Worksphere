import FinancialPeriodRecord from "../models/financialPeriod.model.js";
import { Revenue } from "../models/revenueSchema.model.js";
import mongoose from 'mongoose';
import Client from '../models/clientSchema.js';
import Project from '../models/projectSchema.js';
import Employee from "../models/employeeSchema.js";

const getMonthName = (date) => {
    return date.toLocaleString('default', { month: 'long' });
};


export const createRevenue = async (req, res) => {
    try {
        const revenueData = { ...req.body, createdBy: req.user._id, status: "Expected" };
        const revenue = new Revenue(revenueData);
        await revenue.save();

        const revenueDate = new Date(revenueData.date);
        const monthName = getMonthName(revenueDate);
        const year = revenueDate.getFullYear();
        const financialPeriod = await FinancialPeriodRecord.findOrCreateRecord({
            year,
            monthName,
            departmentId: revenueData.department
        });
        await financialPeriod.addRevenueReference(revenue);

        // This original function updates both if both IDs are provided.
        // The new createProjectRevenue function provides more specific allocation.
        if (revenueData.project) {
            await Project.findByIdAndUpdate(revenueData.project, {
                $push: { revenues: revenue._id },
                $inc: { revenueGenerated: revenueData.amount }
            });
        }
        if (revenueData.client) {
            await Client.findByIdAndUpdate(revenueData.client, {
                $push: { revenues: revenue._id },
                $inc: { totalRevenue: revenueData.amount }
            });
        }
        return res.status(201).json({ success: true, data: revenue, message: "Revenue created successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

export const getPendingRevenues = async (req, res) => {
    try {
        const pendingRevenues = await Revenue.find({ status: 'Pending' })
            .populate('createdBy', 'name')
            .populate('project', 'name')
            .populate('department', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: pendingRevenues
        });

    } catch (error) {
        console.error("Error fetching pending expenses:", error);
        return res.status(500).json({
            success: false,
            error: "Server error while fetching pending expenses."
        });
    }
};

export const createProjectRevenue = async (req, res) => {
    try {
        const { projectId, ...revenueDetails } = req.body;
        if (!projectId) {
            return res.status(400).json({ success: false, error: "Project ID is required to create project revenue." });
        }

        // 2. Find the project to determine its type
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ success: false, error: "Project not found." });
        }

        // 3. Create the base revenue document
        const revenue = new Revenue({
            ...revenueDetails,
            project: projectId,
            client: project.isInternalProject ? null : project.clientId,
            createdBy: req.user._id,
            status: "Expected"
        });
        await revenue.save();

        // 4. Conditionally associate the revenue with the Project (if internal) or Client (if external)
        if (project.isInternalProject) {
            // Logic for internal projects: revenue is recorded against the project.
            await Project.findByIdAndUpdate(
                projectId,
                {
                    $push: { revenues: revenue._id },
                    $inc: { revenueGenerated: revenue.amount }
                }
            );
            console.log(`Revenue ${revenue._id} added to internal project ${projectId}`);
        } else {
            // Logic for client projects: revenue is recorded against the client.
            if (!project.clientId) {
                // This is a safeguard. A non-internal project should always have a client.
                return res.status(400).json({ success: false, error: `Project "${project.name}" is a client project but has no client associated with it.` });
            }
            await Client.findByIdAndUpdate(
                project.clientId,
                {
                    $push: { revenues: revenue._id },
                    $inc: { totalRevenue: revenue.amount }
                }
            );
            console.log(`Revenue ${revenue._id} added to client ${project.clientId} via project ${projectId}`);
        }

        // 5. Update the financial period record for accounting
        const revenueDate = new Date(revenue.date);
        const monthName = getMonthName(revenueDate);
        const year = revenueDate.getFullYear();
        const financialPeriod = await FinancialPeriodRecord.findOrCreateRecord({
            year,
            monthName,
            departmentId: revenue.department
        });
        await financialPeriod.addRevenueReference(revenue);

        // 6. Send the success response
        return res.status(201).json({
            success: true,
            message: "Project revenue created and allocated successfully.",
            data: revenue,
        });

    } catch (error) {
        console.error("Error creating project revenue:", error);
        return res.status(400).json({
            success: false,
            error: error.message
        });
    }
};



export const approveRevenue = async (req, res) => {
    try {
        const { revenueId } = req.params;
        const { status, notes } = req.body;

        const revenue = await Revenue.findById(revenueId);
        if (!revenue) {
            return res.status(404).json({ success: false, error: "Revenue entry not found" });
        }
        revenue.status = status;
        revenue.approvedBy = req.user._id;
        revenue.approvalDate = new Date();
        if (notes) revenue.notes = notes;
        await revenue.save();
        return res.status(200).json({ success: true, data: revenue, message: "Revenue status updated successfully" });
    } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

export const updateRevenue = async (req, res) => {
    try {
        const { revenueId } = req.params;
        const updateData = req.body;

        const revenue = await Revenue.findById(revenueId);

        if (!revenue) {
            return res.status(404).json({ success: false, error: "Revenue entry not found." });
        }

        // --- Handle financial adjustments if amount is changed ---
        if (updateData.amount && updateData.amount !== revenue.amount) {
            const amountDifference = updateData.amount - revenue.amount;

            // Adjust the total on the associated project or client
            if (revenue.project) {
                const project = await Project.findById(revenue.project);
                if (project) {
                    const updateField = project.isInternalProject ? 'revenueGenerated' : 'totalRevenue';
                    const modelToUpdate = project.isInternalProject ? Project : Client;
                    const idToUpdate = project.isInternalProject ? project._id : project.clientId;

                    if (idToUpdate) {
                        await modelToUpdate.findByIdAndUpdate(idToUpdate, { $inc: { [updateField]: amountDifference } });
                    }
                }
            } else if (revenue.client) {
                await Client.findByIdAndUpdate(revenue.client, { $inc: { totalRevenue: amountDifference } });
            }
            // Adjust financial period summary
            await FinancialPeriodRecord.updateMany(
                { revenues: revenueId },
                { $inc: { 'summary.totalRevenue': amountDifference } }
            );
        }

        // Update the revenue document
        const updatedRevenue = await Revenue.findByIdAndUpdate(revenueId, updateData, {
            new: true,
            runValidators: true,
        });

        return res.status(200).json({
            success: true,
            message: "Revenue updated successfully.",
            data: updatedRevenue
        });

    } catch (error) {
        console.error("Error updating revenue:", error);
        return res.status(500).json({ success: false, error: "Server error while updating revenue." });
    }
};


export const deleteRevenue = async (req, res) => {
    try {
        const { revenueId } = req.params;
        const revenue = await Revenue.findById(revenueId);

        if (!revenue) {
            return res.status(404).json({ success: false, error: "Revenue not found." });
        }

        // --- Reverse the financial impact before deleting ---
        const amount = -revenue.amount;
        if (revenue.project) {
            const project = await Project.findById(revenue.project);
            if (project) {
                const updateQuery = { $pull: { revenues: revenue._id }, $inc: { revenueGenerated: amount } };
                if (project.isInternalProject) {
                    await Project.findByIdAndUpdate(revenue.project, updateQuery);
                } else if (project.clientId) {
                    await Client.findByIdAndUpdate(project.clientId, {
                        $pull: { revenues: revenue._id },
                        $inc: { totalRevenue: amount }
                    });
                }
            }
        } else if (revenue.client) {
            await Client.findByIdAndUpdate(revenue.client, {
                $pull: { revenues: revenue._id },
                $inc: { totalRevenue: amount }
            });
        }

        // Remove from financial period record
        await FinancialPeriodRecord.updateMany(
            { revenues: revenueId },
            {
                $pull: { revenues: revenueId },
                $inc: { 'summary.totalRevenue': amount }
            }
        );

        // Finally, delete the revenue document
        await Revenue.findByIdAndDelete(revenueId);

        return res.status(200).json({
            success: true,
            message: "Revenue deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting revenue:", error);
        return res.status(500).json({ success: false, error: "Server error while deleting revenue." });
    }
};

