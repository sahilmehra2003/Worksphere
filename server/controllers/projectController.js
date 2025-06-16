import Project from '../models/projectSchema.js';
import ProjectTeam from '../models/projectTeamSchema.js';
import Client from '../models/clientSchema.js';
import Department from '../models/departmentSchema.js'; // Import Department model
import { Revenue } from '../models/revenueSchema.model.js';
import { Expense } from '../models/expenseSchema.model.js';

// Helper to normalize project
function normalizeProject(project) {
  if (!project) return null;
  return {
    _id: project._id.toString(), // Ensure ID is a string
    name: project.name,
    description: project.description || '',
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    budget: project.budget,
    totalExpenses: project.totalExpenses,
    clientId: project.clientId || null, // Will be populated object or ID
    teamId: project.teamId || [],     // Will be populated array or ID array
    departmentId: project.departmentId || null, // Will be populated object or ID
    revenueGenerated: project.revenueGenerated || 0,
    revenues: project.revenues || [],
    expenses: project.expenses || []
  };
}

// Helper function to update project financial totals
async function updateProjectFinancials(projectId) {
  const project = await Project.findById(projectId)
    .populate('revenues')
    .populate('expenses');

  if (!project) return null;

  const totalRevenue = project.revenues.reduce((sum, rev) => sum + (rev.amount || 0), 0);
  const totalExpenses = project.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  project.revenueGenerated = totalRevenue;
  project.totalExpenses = totalExpenses;

  return project.save();
}

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('clientId', 'name _id')
      .populate('teamId', 'teamName _id')
      .populate('departmentId', 'name')
      .populate('revenues', 'amount date category status')
      .populate('expenses', 'amount date category status');

    res.status(200).json({
      success: true,
      message: "Successfully fetched all projects",
      data: projects.map(normalizeProject)
    });
  } catch (error) {
    console.error('Error fetching all projects:', error);
    res.status(500).json({ success: false, message: 'Error fetching projects. Please try again later.' });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('clientId', 'name _id')
      .populate('teamId', 'teamName _id')
      .populate('departmentId', 'name')
      .populate('revenues', 'amount date category status')
      .populate('expenses', 'amount date category status');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.status(200).json({
      success: true,
      message: "Successfully fetched project",
      data: normalizeProject(project)
    });
  } catch (error) {
    console.error(`Error fetching project by ID ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: 'Error fetching project. Please try again later.' });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, status, startDate, clientId, endDate, budget, teamId, departmentId } = req.body;
    if (!name || !status || !startDate || !budget) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, status, startDate, and budget."
      });
    }
    const newProjectData = {
      name,
      description,
      clientId,
      startDate,
      endDate,
      budget,
      status,
      departmentId,
      revenueGenerated: 0,
      totalExpenses: 0
    };

    if (teamId) {
      newProjectData.teamId = Array.isArray(teamId) ? teamId : [teamId];
    }

    const newProject = new Project(newProjectData);
    await newProject.save();

    // Sync references
    if (newProject.teamId && newProject.teamId.length > 0) {
      await ProjectTeam.updateMany(
        { _id: { $in: newProject.teamId } },
        { projectId: newProject._id, workingOnProject: true }
      );
    }
    if (newProject.clientId) {
      await Client.findByIdAndUpdate(newProject.clientId, { $addToSet: { project: newProject._id } });
    }
    if (newProject.departmentId) {
      await Department.findByIdAndUpdate(newProject.departmentId, { $addToSet: { currentProjects: newProject._id } });
    }

    const populatedProject = await Project.findById(newProject._id)
      .populate('clientId', 'name _id')
      .populate('teamId', 'teamName _id')
      .populate('departmentId', 'name')
      .populate('revenues', 'amount date category status')
      .populate('expenses', 'amount date category status');

    return res.status(201).json({
      success: true,
      message: "New Project created successfully and references synchronized",
      data: normalizeProject(populatedProject)
    });
  } catch (error) {
    console.error('Error creating project:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation Error: " + error.message,
        errors: error.errors
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error creating project. Please try again later.'
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const originalProject = await Project.findById(id);
    if (!originalProject) {
      return res.status(404).json({ success: false, message: "Project not Found" });
    }

    const updatedProject = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        message: "Project not Found after update attempt"
      });
    }

    // Update financial totals if needed
    if (updateData.hasOwnProperty('revenues') || updateData.hasOwnProperty('expenses')) {
      await updateProjectFinancials(id);
    }

    // Sync Department reference if departmentId changed
    if (updateData.hasOwnProperty('departmentId') && String(originalProject.departmentId) !== String(updatedProject.departmentId)) {
      if (originalProject.departmentId) {
        await Department.findByIdAndUpdate(originalProject.departmentId, { $pull: { currentProjects: updatedProject._id } });
      }
      if (updatedProject.departmentId) {
        await Department.findByIdAndUpdate(updatedProject.departmentId, { $addToSet: { currentProjects: updatedProject._id } });
      }
    }

    // Sync Client reference if clientId changed
    if (updateData.hasOwnProperty('clientId') && String(originalProject.clientId) !== String(updatedProject.clientId)) {
      if (originalProject.clientId) {
        await Client.findByIdAndUpdate(originalProject.clientId, { $pull: { project: updatedProject._id } });
      }
      if (updatedProject.clientId) {
        await Client.findByIdAndUpdate(updatedProject.clientId, { $addToSet: { project: updatedProject._id } });
      }
    }

    // Sync ProjectTeam references if teamId changed
    if (updateData.hasOwnProperty('teamId')) {
      const originalTeams = (originalProject.teamId || []).map(t => String(t));
      const updatedTeams = (updatedProject.teamId || []).map(t => String(t));

      const teamsToAdd = updatedTeams.filter(tId => !originalTeams.includes(tId));
      const teamsToRemove = originalTeams.filter(tId => !updatedTeams.includes(tId));

      for (const team_Id of teamsToAdd) {
        await ProjectTeam.findByIdAndUpdate(team_Id, { projectId: updatedProject._id, workingOnProject: true });
      }
      for (const team_Id of teamsToRemove) {
        await ProjectTeam.findByIdAndUpdate(team_Id, { projectId: null, workingOnProject: false });
      }
    }

    const populatedProject = await Project.findById(updatedProject._id)
      .populate('clientId', 'name _id')
      .populate('teamId', 'teamName _id')
      .populate('departmentId', 'name')
      .populate('revenues', 'amount date category status')
      .populate('expenses', 'amount date category status');

    return res.status(200).json({
      success: true,
      message: "Project updated successfully and references synchronized!",
      data: normalizeProject(populatedProject)
    });
  } catch (error) {
    console.error(`Error updating project ${req.params.id}:`, error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation Error: " + error.message,
        errors: error.errors
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error updating project. Please try again later.'
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const projectToDelete = await Project.findById(id);

    if (!projectToDelete) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const teamIds = projectToDelete.teamId;
    const clientId = projectToDelete.clientId;
    const departmentId = projectToDelete.departmentId; // Get departmentId

    await Project.findByIdAndDelete(id); // Delete the project first

    // Update associated ProjectTeam documents
    if (teamIds && teamIds.length > 0) {
      await ProjectTeam.updateMany(
        { _id: { $in: teamIds } },
        { projectId: null, workingOnProject: false, clientId: null } // clientId on team might also need to be nulled if it was specific to this project
      );
    }

    // Update associated Client document
    if (clientId) {
      await Client.findByIdAndUpdate(clientId, { $pull: { project: id } });
    }

    // Update associated Department document
    if (departmentId) { // Sync with Department model
      await Department.findByIdAndUpdate(departmentId, { $pull: { currentProjects: id } });
    }

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully and associations updated'
    });
  } catch (error) {
    console.error(`Error deleting project ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting project. Please try again later.'
    });
  }
};

// Functions for managing Project-Team associations
export const addProjectTeam = async (req, res) => {
  try {
    const { id } = req.params; // project id
    const { teamIdToAdd } = req.body;

    if (!teamIdToAdd) {
      return res.status(400).json({ success: false, message: 'Team ID to add is required.' });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { $addToSet: { teamId: teamIdToAdd } },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const teamUpdateData = { projectId: id, workingOnProject: true };
    if (project.clientId) {
      const team = await ProjectTeam.findById(teamIdToAdd);
      if (team && !team.isInternalProject) {
        teamUpdateData.clientId = project.clientId;
      }
    }
    await ProjectTeam.findByIdAndUpdate(teamIdToAdd, teamUpdateData);

    const populatedProject = await Project.findById(id)
      .populate('clientId', 'name _id')
      .populate('teamId', 'teamName _id')
      .populate('departmentId', 'name'); // Added departmentId population

    return res.status(200).json({
      success: true,
      message: 'Team added to project successfully',
      data: normalizeProject(populatedProject)
    });
  } catch (error) {
    console.error(`Error adding team to project ${req.params.id}:`, error);
    return res.status(500).json({ success: false, message: 'Error adding team to project. Please try again later.' });
  }
};

export const removeProjectTeam = async (req, res) => {
  try {
    const { id } = req.params; // project id
    const { teamIdToRemove } = req.body;

    if (!teamIdToRemove) {
      return res.status(400).json({ success: false, message: 'Team ID to remove is required.' });
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { $pull: { teamId: teamIdToRemove } },
      { new: true }
    );

    // If project is null here, it means it wasn't found, or the team wasn't in its array.
    // We should still proceed to update the team if the team existed.
    const team = await ProjectTeam.findById(teamIdToRemove);
    if (team && String(team.projectId) === id) { // Ensure this team was indeed linked to this project
      await ProjectTeam.findByIdAndUpdate(teamIdToRemove, {
        projectId: null,
        workingOnProject: false,
        clientId: null // A team not on this specific project might not have its client removed
        // This depends on whether ProjectTeam.clientId is exclusively through Project.clientId
      });
    }

    if (!project && !team) { // If neither project was found nor team, it's likely an issue.
      return res.status(404).json({ success: false, message: 'Project not found or team not associated.' });
    }


    const populatedProject = await Project.findById(id) // Re-fetch the project for consistent response
      .populate('clientId', 'name _id')
      .populate('teamId', 'teamName _id')
      .populate('departmentId', 'name'); // Added departmentId population

    return res.status(200).json({
      success: true,
      message: 'Team removed from project successfully',
      data: normalizeProject(populatedProject) // populatedProject could be null if the project itself was deleted or invalid.
    });
  } catch (error) {
    console.error(`Error removing team from project ${req.params.id}:`, error);
    return res.status(500).json({ success: false, message: 'Error removing team from project. Please try again later.' });
  }
};

// Functions for managing Project-Client associations
export const addProjectClient = async (req, res) => {
  try {
    const { id } = req.params; // project id
    const { clientId } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, message: 'Client ID is required.' });
    }
    const clientExists = await Client.findById(clientId);
    if (!clientExists) {
      return res.status(404).json({ success: false, message: 'Client to add not found.' });
    }


    const project = await Project.findByIdAndUpdate(id, { clientId }, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await Client.findByIdAndUpdate(clientId, { $addToSet: { project: id } });

    if (project.teamId && project.teamId.length > 0) {
      for (const team_Id of project.teamId) {
        const team = await ProjectTeam.findById(team_Id);
        if (team && !team.isInternalProject) {
          await ProjectTeam.findByIdAndUpdate(team_Id, { clientId: clientId, workingOnProject: true });
        } else if (team) { // If internal team on this project, still ensure workingOnProject is true
          await ProjectTeam.findByIdAndUpdate(team_Id, { workingOnProject: true });
        }
      }
    }

    const populatedProject = await Project.findById(id)
      .populate('clientId', 'name _id')
      .populate('teamId', 'teamName _id')
      .populate('departmentId', 'name'); // Added departmentId population

    return res.status(200).json({
      success: true,
      message: 'Client added to project successfully',
      data: normalizeProject(populatedProject)
    });
  } catch (error) {
    console.error(`Error adding client to project ${req.params.id}:`, error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation Error: " + error.message,
        errors: error.errors
      });
    }
    return res.status(500).json({ success: false, message: 'Error adding client to project. Please try again later.' });
  }
};

export const removeProjectClient = async (req, res) => {
  try {
    const { id } = req.params; // project id
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const originalClientId = project.clientId;

    if (!originalClientId) { // No client was assigned
      const populated = await Project.findById(id)
        .populate('clientId', 'name _id')
        .populate('teamId', 'teamName _id')
        .populate('departmentId', 'name');
      return res.status(200).json({
        success: true,
        message: 'No client was assigned to this project.',
        data: normalizeProject(populated)
      });
    }

    project.clientId = null;
    await project.save({ validateBeforeSave: true }); // run validators on save

    await Client.findByIdAndUpdate(originalClientId, { $pull: { project: id } });

    if (project.teamId && project.teamId.length > 0) {
      for (const team_Id of project.teamId) {
        const team = await ProjectTeam.findById(team_Id);
        if (team && !team.isInternalProject && team.clientId && String(team.clientId) === String(originalClientId)) {
          await ProjectTeam.findByIdAndUpdate(team_Id, { clientId: null });
        }
      }
    }

    const populatedProject = await Project.findById(id)
      .populate('clientId', 'name _id')
      .populate('teamId', 'teamName _id')
      .populate('departmentId', 'name'); // Added departmentId population

    return res.status(200).json({
      success: true,
      message: 'Client removed from project successfully',
      data: normalizeProject(populatedProject)
    });
  } catch (error) {
    console.error(`Error removing client from project ${req.params.id}:`, error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation Error: " + error.message,
        errors: error.errors
      });
    }
    return res.status(500).json({ success: false, message: 'Error removing client from project. Please try again later.' });
  }
};