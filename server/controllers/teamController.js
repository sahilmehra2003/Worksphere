import ProjectTeam from "../models/projectTeamSchema.js";
import Project from "../models/projectSchema.js";
import Client from "../models/clientSchema.js";
import Employee from "../models/employeeSchema.js";
import Department from "../models/departmentSchema.js"; // Ensure this model is correctly imported

// Helper function to normalize team data for responses
function normalizeTeam(team) {
    if (!team) return null;
    return {
        _id: team._id.toString(),
        teamName: team.teamName,
        description: team.description || '',
        teamHead: team.teamHead || null, // This will be populated object or null
        members: team.members || [],   // This will be populated array or empty
        projectId: team.projectId || null, // This will be populated object or null
        clientId: team.clientId || null,   // This will be populated object or null
        departmentId: team.departmentId || null, // This will be populated object or null
        workingOnProject: team.workingOnProject,
        isInternalProject: team.isInternalProject,
    };
}

export const createTeam = async (req, res) => {
    try {
        const { teamName, teamHead, description, workingOnProject, isInternalProject, members, projectId, clientId, departmentId } = req.body;

        if (!teamName || !teamHead || !description) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: teamName, teamHead, and description are required"
            });
        }

        const existingTeam = await ProjectTeam.findOne({ teamName });
        if (existingTeam) {
            return res.status(400).json({
                success: false,
                message: "Team with this name already exists"
            });
        }

        const newTeam = await ProjectTeam.create({
            teamName,
            teamHead,
            description,
            workingOnProject: projectId ? true : (workingOnProject || false),
            isInternalProject,
            members: members || [],
            projectId,
            clientId,
            departmentId
        });

        // Sync references
        if (newTeam.projectId) {
            await Project.findByIdAndUpdate(newTeam.projectId, {
                $addToSet: { teamId: newTeam._id }
            });
        }
        if (newTeam.clientId) {
            await Client.findByIdAndUpdate(newTeam.clientId, {
                $addToSet: { projectTeam: newTeam._id }
            });
        }
        if (newTeam.departmentId) { // Sync with Department
            await Department.findByIdAndUpdate(newTeam.departmentId, {
                $addToSet: { teams: newTeam._id }
            });
        }

        if (newTeam.teamHead) {
            await Employee.findByIdAndUpdate(newTeam.teamHead, {
                projectTeam: newTeam._id,
                ...(newTeam.departmentId && { department: newTeam.departmentId })
            });
        }
        if (newTeam.members && newTeam.members.length > 0) {
            for (const memberId of newTeam.members) {
                await Employee.findByIdAndUpdate(memberId, {
                    projectTeam: newTeam._id,
                    ...(newTeam.departmentId && { department: newTeam.departmentId })
                });
            }
        }

        const populatedTeam = await ProjectTeam.findById(newTeam._id)
            .populate('teamHead', 'name email department')
            .populate('members', 'name email department')
            .populate('projectId', 'name')
            .populate('clientId', 'name')
            .populate('departmentId', 'name');

        return res.status(201).json({
            success: true,
            message: "New team created successfully and references synchronized",
            data: normalizeTeam(populatedTeam)
        });
    } catch (error) {
        console.error("Error creating team:", error);
        return res.status(500).json({
            success: false,
            message: `Error creating team: ${error.message}`
        });
    }
};

export const updateTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const originalTeam = await ProjectTeam.findById(id);
        if (!originalTeam) {
            return res.status(404).json({
                success: false,
                message: "Project team not found"
            });
        }

        if (updateData.teamName && updateData.teamName !== originalTeam.teamName) {
            const existingTeam = await ProjectTeam.findOne({ teamName: updateData.teamName });
            if (existingTeam) {
                return res.status(400).json({
                    success: false,
                    message: "Team with this name already exists"
                });
            }
        }

        if (updateData.hasOwnProperty('projectId')) {
            if (updateData.projectId) {
                updateData.workingOnProject = true;
            } else if (updateData.projectId === null && !updateData.hasOwnProperty('workingOnProject')) {
                updateData.workingOnProject = false;
            }
        }

        const updatedTeam = await ProjectTeam.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });

        if (!updatedTeam) {
            return res.status(404).json({
                success: false,
                message: "Project team not found after update attempt."
            });
        }

        // Sync references
        if (String(originalTeam.projectId) !== String(updatedTeam.projectId)) {
            if (originalTeam.projectId) {
                await Project.findByIdAndUpdate(originalTeam.projectId, { $pull: { teamId: updatedTeam._id } });
            }
            if (updatedTeam.projectId) {
                await Project.findByIdAndUpdate(updatedTeam.projectId, { $addToSet: { teamId: updatedTeam._id } });
            }
        }

        if (String(originalTeam.clientId) !== String(updatedTeam.clientId)) {
            if (originalTeam.clientId) {
                await Client.findByIdAndUpdate(originalTeam.clientId, { $pull: { projectTeam: updatedTeam._id } });
            }
            if (updatedTeam.clientId) {
                await Client.findByIdAndUpdate(updatedTeam.clientId, { $addToSet: { projectTeam: updatedTeam._id } });
            }
        }

        const departmentChanged = String(originalTeam.departmentId) !== String(updatedTeam.departmentId);
        if (departmentChanged) {
            if (originalTeam.departmentId) { // Remove from old department's teams array
                await Department.findByIdAndUpdate(originalTeam.departmentId, { $pull: { teams: updatedTeam._id } });
            }
            if (updatedTeam.departmentId) { // Add to new department's teams array
                await Department.findByIdAndUpdate(updatedTeam.departmentId, { $addToSet: { teams: updatedTeam._id } });
            }
        }

        const teamHeadChanged = String(originalTeam.teamHead) !== String(updatedTeam.teamHead);
        if (teamHeadChanged) {
            if (originalTeam.teamHead) {
                await Employee.findByIdAndUpdate(originalTeam.teamHead, { projectTeam: null /* Potentially update department if rules dictate */ });
            }
        }
        // Update new/current team head's department if team's department changed or if head itself changed
        if (updatedTeam.teamHead && (teamHeadChanged || departmentChanged)) {
            await Employee.findByIdAndUpdate(updatedTeam.teamHead, {
                projectTeam: updatedTeam._id,
                ...(updatedTeam.departmentId && { department: updatedTeam.departmentId })
            });
        }

        const membersFieldWasUpdated = updateData.hasOwnProperty('members');
        if (membersFieldWasUpdated || departmentChanged) {
            const originalMembersStr = originalTeam.members.map(m => String(m));
            const currentUpdatedMembersStr = updatedTeam.members.map(m => String(m));

            if (membersFieldWasUpdated) {
                const addedMembers = currentUpdatedMembersStr.filter(mId => !originalMembersStr.includes(mId));
                const removedMembers = originalMembersStr.filter(mId => !currentUpdatedMembersStr.includes(mId));

                for (const memberId of addedMembers) {
                    await Employee.findByIdAndUpdate(memberId, {
                        projectTeam: updatedTeam._id,
                        ...(updatedTeam.departmentId && { department: updatedTeam.departmentId })
                    });
                }
                for (const memberId of removedMembers) {
                    if (String(updatedTeam.teamHead) !== memberId) {
                        await Employee.findByIdAndUpdate(memberId, { projectTeam: null /* Potentially update department */ });
                    }
                }
            } else if (departmentChanged) { // Members array itself not in updateData, but team's department changed
                for (const memberId of currentUpdatedMembersStr) {
                    // Only update department if the member is not the team head that just changed (to avoid double update)
                    // or if the team head didn't change but the department did.
                    if (String(updatedTeam.teamHead) !== memberId || !teamHeadChanged) {
                        await Employee.findByIdAndUpdate(memberId, {
                            ...(updatedTeam.departmentId && { department: updatedTeam.departmentId })
                        });
                    }
                }
            }
        }

        const populatedTeamForResponse = await ProjectTeam.findById(updatedTeam._id)
            .populate('teamHead', 'name email department')
            .populate('members', 'name email department')
            .populate('projectId', 'name')
            .populate('clientId', 'name')
            .populate('departmentId', 'name');

        return res.status(200).json({
            success: true,
            message: "Team updated successfully and references synchronized",
            data: normalizeTeam(populatedTeamForResponse)
        });

    } catch (error) {
        console.error("Error updating team:", error);
        return res.status(500).json({
            success: false,
            message: `Error updating team: ${error.message}`
        });
    }
};

export const getTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await ProjectTeam.findById(id)
            .populate('teamHead', 'name email department')
            .populate('members', 'name email department')
            .populate('projectId', 'name')
            .populate('clientId', 'name')
            .populate('departmentId', 'name');

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Project team not found"
            });
        }
        return res.status(200).json({
            success: true,
            data: normalizeTeam(team)
        });
    } catch (error) {
        console.error("Error fetching team:", error);
        return res.status(500).json({
            success: false,
            message: `Error fetching team: ${error.message}`
        });
    }
};

export const getAllTeams = async (req, res) => {
    try {
        const teams = await ProjectTeam.find()
            .populate('teamHead', 'name email department')
            .populate('members', 'name email department')
            .populate('projectId', 'name')
            .populate('clientId', 'name')
            .populate('departmentId', 'name');

        const normalizedTeams = teams.map(normalizeTeam);

        return res.status(200).json({
            success: true,
            count: normalizedTeams.length,
            data: normalizedTeams
        });
    } catch (error) {
        console.error("Error fetching teams:", error);
        return res.status(500).json({
            success: false,
            message: `Error fetching teams: ${error.message}`
        });
    }
};

export const deleteTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const teamToDelete = await ProjectTeam.findById(id);

        if (!teamToDelete) {
            return res.status(404).json({
                success: false,
                message: "Project team not found"
            });
        }

        if (teamToDelete.projectId) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete team that is currently assigned to a project. Please unassign from project first."
            });
        }

        // Sync references before deleting
        if (teamToDelete.departmentId) { // Remove team from Department's teams array
            await Department.findByIdAndUpdate(teamToDelete.departmentId, {
                $pull: { teams: teamToDelete._id }
            });
        }
        // Note: projectId and clientId references on Project/Client models were to be removed when team is unassigned from them.
        // Since deletion is only allowed if not on a project, teamId on Project is already handled.
        // If clientId was set on team, clear from Client.projectTeam
        if (teamToDelete.clientId) {
            await Client.findByIdAndUpdate(teamToDelete.clientId, {
                $pull: { projectTeam: teamToDelete._id }
            });
        }

        if (teamToDelete.teamHead) {
            await Employee.findByIdAndUpdate(teamToDelete.teamHead, { projectTeam: null });
        }
        if (teamToDelete.members && teamToDelete.members.length > 0) {
            for (const memberId of teamToDelete.members) {
                // Check if member is not the head to avoid double update attempts or conflicts
                if (String(teamToDelete.teamHead) !== String(memberId)) {
                    await Employee.findByIdAndUpdate(memberId, { projectTeam: null });
                }
            }
        }

        await ProjectTeam.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Team deleted successfully and references updated"
        });
    } catch (error) {
        console.error("Error deleting team:", error);
        return res.status(500).json({
            success: false,
            message: `Error deleting team: ${error.message}`
        });
    }
};

export const addTeamMember = async (req, res) => {
    try {
        const { id } = req.params; // teamId
        const { memberId } = req.body; // employeeId to add

        if (!memberId) {
            return res.status(400).json({ success: false, message: "Member ID is required" });
        }

        const team = await ProjectTeam.findById(id);
        if (!team) {
            return res.status(404).json({ success: false, message: "Project team not found" });
        }

        const employeeToAdd = await Employee.findById(memberId);
        if (!employeeToAdd) {
            return res.status(404).json({ success: false, message: "Employee to add not found." });
        }

        if (team.members.map(m => String(m)).includes(String(memberId))) {
            return res.status(400).json({ success: false, message: "Member is already in the team" });
        }

        const updatedTeam = await ProjectTeam.findByIdAndUpdate(
            id,
            { $addToSet: { members: memberId } },
            { new: true, runValidators: true }
        );

        if (!updatedTeam) {
            return res.status(404).json({ success: false, message: "Team not found or member not added." });
        }

        await Employee.findByIdAndUpdate(memberId, {
            projectTeam: updatedTeam._id,
            ...(updatedTeam.departmentId && { department: updatedTeam.departmentId })
        });

        const populatedTeam = await ProjectTeam.findById(updatedTeam._id)
            .populate('teamHead', 'name email department')
            .populate('members', 'name email department')
            .populate('projectId', 'name')
            .populate('clientId', 'name')
            .populate('departmentId', 'name');

        return res.status(200).json({
            success: true,
            message: "Member added to team successfully",
            data: normalizeTeam(populatedTeam)
        });
    } catch (error) {
        console.error("Error adding team member:", error);
        return res.status(500).json({
            success: false,
            message: `Error adding team member: ${error.message}`
        });
    }
};

export const removeTeamMember = async (req, res) => {
    try {
        const { id } = req.params; // teamId
        const { memberId } = req.body; // employeeId to remove

        if (!memberId) {
            return res.status(400).json({ success: false, message: "Member ID is required" });
        }

        const team = await ProjectTeam.findById(id);
        if (!team) {
            return res.status(404).json({ success: false, message: "Project team not found" });
        }

        if (String(team.teamHead) === String(memberId)) {
            return res.status(400).json({
                success: false,
                message: "Cannot remove the team head. Please change the team head first."
            });
        }

        if (!team.members.map(m => String(m)).includes(String(memberId))) {
            return res.status(400).json({ success: false, message: "Member is not in the team" });
        }

        const updatedTeam = await ProjectTeam.findByIdAndUpdate(
            id,
            { $pull: { members: memberId } },
            { new: true, runValidators: true }
        );

        if (!updatedTeam) {
            return res.status(404).json({ success: false, message: "Team not found or member not removed." });
        }

        await Employee.findByIdAndUpdate(memberId, { projectTeam: null /* Consider department implications */ });

        const populatedTeam = await ProjectTeam.findById(updatedTeam._id)
            .populate('teamHead', 'name email department')
            .populate('members', 'name email department')
            .populate('projectId', 'name')
            .populate('clientId', 'name')
            .populate('departmentId', 'name');

        return res.status(200).json({
            success: true,
            message: "Member removed from team successfully",
            data: normalizeTeam(populatedTeam)
        });
    } catch (error) {
        console.error("Error removing team member:", error);
        return res.status(500).json({
            success: false,
            message: `Error removing team member: ${error.message}`
        });
    }
};