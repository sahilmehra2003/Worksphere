import Client from '../models/clientSchema.js';
import mongoose from 'mongoose';
import Department from '../models/departmentSchema.js';
import Project from '../models/projectSchema.js';
import ProjectTeam from '../models/projectTeamSchema.js';
import Employee from '../models/employeeSchema.js'; 
import { enrichClientsWithLatLng } from './geographyController.js'; 
import { Revenue } from '../models/revenueSchema.model.js';
import { Expense } from '../models/expenseSchema.model.js';

// Helper function to normalize client data (optional, but good for consistency)
function normalizeClient(client) {
    if (!client) return null;
    const clientObject = client.toObject ? client.toObject() : client; 
    return {
        _id: clientObject._id.toString(),
        name: clientObject.name,
        contactPersonName: clientObject.contactPersonName,
        email: clientObject.email,
        phoneNumber: clientObject.phoneNumber,
        location: clientObject.location,
        latLng: clientObject.latLng,
        clientCreationDate: clientObject.clientCreationDate,
        clientFinishDate: clientObject.clientFinishDate,
        project: clientObject.project || [], 
        projectTeam: clientObject.projectTeam || [], 
        department: clientObject.department || [], 
        status: clientObject.status,
        clientExpenses: clientObject.clientExpenses || 0,
        totalRevenue: clientObject.totalRevenue || 0,
        paymentAfterCompletion: clientObject.paymentAfterCompletion,
        createdAt: clientObject.createdAt,
        updatedAt: clientObject.updatedAt,
    };
}

// Helper function to update client financial totals
async function updateClientFinancials(clientId) {
    const client = await Client.findById(clientId)
        .populate('revenues')
        .populate('expenses');

    if (!client) return null;

    const totalRevenue = client.revenues.reduce((sum, rev) => sum + (rev.amount || 0), 0);
    const totalExpenses = client.expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    client.totalRevenue = totalRevenue;
    client.clientExpenses = totalExpenses;

    return client.save();
}

// Fetch all clients
export const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find()
            .populate('department', 'name') 
            .populate('project', 'name status') 
            .populate('projectTeam', 'teamName') 
            .populate('revenues', 'amount date category status')
            .populate('expenses', 'amount date category status')
            .lean(); 

        // const enrichedClients = await enrichClientsWithLatLng(clients); // Assuming this is how you want to use it
        // For now, let's assume latLng is already on the client or handled during create/update

        return res.status(200).json({
            success: true,
            message: "Successfully fetched all clients",
            data: clients.map(normalizeClient) 
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        return res.status(500).json({ success: false, message: 'Internal server error fetching clients.' });
    }
};

// --- getClientById
export const getClientById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: 'Invalid client ID format.' });
    }

    try {
        const client = await Client.findById(id)
            .populate('department', 'name') // Populate the department array
            .populate('project', 'name status') // Populate the project array
            .populate('projectTeam', 'teamName') // Populate the projectTeam array
            .populate('revenues', 'amount date category status')
            .populate('expenses', 'amount date category status');

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found.' });
        }

        res.status(200).json({
            success: true,
            message: "Client fetched successfully",
            data: normalizeClient(client)
        });
    } catch (error) {
        console.error('Error fetching client by ID:', error);
        res.status(500).json({ success: false, message: 'Internal server error fetching client.' });
    }
};



export const createClient = async (req, res) => {
    try {
        const {
            name,
            contactPersonName,
            email,
            phoneNumber,
            location,
            clientCreationDate,
            clientFinishDate,
            project, 
            projectTeam, 
            department, 
            status,
            paymentAfterCompletion,
           
        } = req.body;

        if (!name || !contactPersonName || !email || !phoneNumber || !location) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: name, contactPersonName, email, phoneNumber, location are required.",
            });
        }

        let latLngValue = null;
        if (location) {
            try {
                console.log(`Geocoding location for new client '${name}': ${location}`);
                latLngValue = await enrichClientsWithLatLng(location);
                console.log('Geocoding result:', latLngValue);
            } catch (geoError) {
                console.warn(`Warning: Could not geocode location "${location}" for client ${name}. Client will be created without coordinates. Error: ${geoError.message}`);
            }
        }

        const clientData = {
            name,
            contactPersonName,
            email,
            phoneNumber,
            location,
            latLng: latLngValue,
            clientCreationDate: clientCreationDate || Date.now(),
            clientFinishDate,
            project: project || [], 
            projectTeam: projectTeam || [], 
            department: department || [], 
            status: status !== undefined ? status : true, 
            paymentAfterCompletion,
            totalRevenue: 0,
            clientExpenses: 0
        };

        const newClient = await Client.create(clientData);

        // Update related documents
        if (newClient.department && newClient.department.length > 0) {
            for (const deptId of newClient.department) {
                await Department.findByIdAndUpdate(deptId, { $addToSet: { clientsAllocated: newClient._id } });
            }
        }
        if (newClient.projectTeam && newClient.projectTeam.length > 0) {
            for (const teamId of newClient.projectTeam) {
                await ProjectTeam.findByIdAndUpdate(teamId, { clientId: newClient._id }); 
            }
        }
        if (newClient.project && newClient.project.length > 0) {
            for (const projId of newClient.project) {
                await Project.findByIdAndUpdate(projId, { clientId: newClient._id }); 
            }
        }
       


        const populatedClient = await Client.findById(newClient._id)
            .populate('department', 'name')
            .populate('project', 'name')
            .populate('projectTeam', 'teamName')
            .populate('revenues', 'amount date category status')
            .populate('expenses', 'amount date category status');

        return res.status(201).json({
            success: true,
            message: "New client created successfully" + (latLngValue ? "." : " (geocoding failed or skipped)."),
            data: normalizeClient(populatedClient),
        });
    } catch (error) {
        console.error("Error creating client:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
        }
        return res.status(500).json({
            success: false,
            message: `Error occurred creating client: ${error.message}`,
        });
    }
};


// --- updateClient ---
export const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const updatePayload = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid Client ID format.' });
        }

        const originalClient = await Client.findById(id).lean(); 
        if (!originalClient) {
            return res.status(404).json({ success: false, message: "Client not found" });
        }

        if (updatePayload.hasOwnProperty('location') && updatePayload.location !== originalClient.location) {
            if (typeof updatePayload.location === 'string' && updatePayload.location.trim() !== '') {
                try {
                    const latLng = await enrichClientsWithLatLng(updatePayload.location);
                    updatePayload.latLng = latLng;
                } catch (geoError) {
                    console.warn(`Warning: Could not geocode updated location "${updatePayload.location}" for client ${id}. Error: ${geoError.message}`);
                    updatePayload.latLng = originalClient.latLng; // Keep old or set to null
                }
            } else {
                updatePayload.latLng = null;
            }
        }

        const updatedClient = await Client.findByIdAndUpdate(
            id,
            { $set: updatePayload },
            { new: true, runValidators: true }
        );

        if (!updatedClient) { 
            return res.status(404).json({ success: false, message: "Client not found after update attempt" });
        }

        // Update financial totals if needed
        if (updatePayload.hasOwnProperty('revenues') || updatePayload.hasOwnProperty('expenses')) {
            await updateClientFinancials(id);
        }

        
        // Departments
        if (updatePayload.hasOwnProperty('department')) {
            const oldDepts = (originalClient.department || []).map(d => d.toString());
            const newDepts = (updatedClient.department || []).map(d => d.toString());

            const deptsToAdd = newDepts.filter(d => !oldDepts.includes(d));
            const deptsToRemove = oldDepts.filter(d => !newDepts.includes(d));

            for (const deptId of deptsToAdd) {
                await Department.findByIdAndUpdate(deptId, { $addToSet: { clientsAllocated: updatedClient._id } });
            }
            for (const deptId of deptsToRemove) {
                await Department.findByIdAndUpdate(deptId, { $pull: { clientsAllocated: updatedClient._id } });
            }
        }

        // Projects (Project schema has a single clientId)
        if (updatePayload.hasOwnProperty('project')) { 
            const oldProjects = (originalClient.project || []).map(p => p.toString());
            const newProjects = (updatedClient.project || []).map(p => p.toString());

            const projectsToAddLink = newProjects.filter(p => !oldProjects.includes(p));
            const projectsToRemoveLink = oldProjects.filter(p => !newProjects.includes(p));

            for (const projId of projectsToAddLink) {
                await Project.findByIdAndUpdate(projId, { clientId: updatedClient._id });
            }
            for (const projId of projectsToRemoveLink) { 
                await Project.findByIdAndUpdate(projId, { clientId: null });
            }
        }

        // ProjectTeams (ProjectTeam schema has a single clientId)
        if (updatePayload.hasOwnProperty('projectTeam')) {
            const oldTeams = (originalClient.projectTeam || []).map(t => t.toString());
            const newTeams = (updatedClient.projectTeam || []).map(t => t.toString());

            const teamsToAddLink = newTeams.filter(t => !oldTeams.includes(t));
            const teamsToRemoveLink = oldTeams.filter(t => !newTeams.includes(t));

            for (const teamId of teamsToAddLink) {
                await ProjectTeam.findByIdAndUpdate(teamId, { clientId: updatedClient._id });
            }
            for (const teamId of teamsToRemoveLink) {
                await ProjectTeam.findByIdAndUpdate(teamId, { clientId: null });
            }
        }

        const populatedClient = await Client.findById(updatedClient._id)
            .populate('department', 'name')
            .populate('project', 'name status')
            .populate('projectTeam', 'teamName')
            .populate('revenues', 'amount date category status')
            .populate('expenses', 'amount date category status');


        return res.status(200).json({
            success: true,
            message: "Client Updated Successfully",
            data: normalizeClient(populatedClient)
        });
    } catch (error) {
        console.error("Error updating client:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
        }
        return res.status(500).json({
            success: false,
            message: `Error updating client: ${error.message}`
        });
    }
};

export const deactivateClient = async (req, res) => {
    try {
        const { clientId } = req.params;
        // const requestingUserId = req.user._id; // Assuming req.user is populated by authN middleware

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ success: false, message: 'Invalid Client ID format.' });
        }

        const client = await Client.findById(clientId);

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found.' });
        }

        if (client.status === false) { // Client schema uses boolean status, false means inactive
            return res.status(400).json({ success: false, message: `Client '${client.name}' is already inactive.` });
        }

        // Set status to false (inactive)
        client.status = false;
        // Potentially set clientFinishDate if not already set
        if (!client.clientFinishDate) {
            client.clientFinishDate = new Date();
        }
        await client.save({ validateBeforeSave: true }); // Ensure validators run

        // When deactivating a client, you might want to:
        // 1. Unassign this client from any active projects (set project.clientId to null)
        const projectsToUpdate = await Project.find({ clientId: client._id, status: "In Progress" }); // Or any other relevant status
        for (const project of projectsToUpdate) {
            project.clientId = null;
            // Optionally change project status, e.g., to 'Abandoned' or 'On Hold'
            // project.status = "Abandoned";
            await project.save();
            console.log(`Project ${project.name} unassigned from deactivated client ${client.name}.`);
        }

        // 2. Unassign this client from any project teams (set projectTeam.clientId to null)
        const teamsToUpdate = await ProjectTeam.find({ clientId: client._id });
        for (const team of teamsToUpdate) {
            team.clientId = null;
            // Optionally, if team was only for this client and not internal, update team status
            // if (!team.isInternalProject) team.workingOnProject = false;
            await team.save();
            console.log(`ProjectTeam ${team.teamName} unassigned from deactivated client ${client.name}.`);
        }

        // 3. Remove this client from employees' client list
        await Employee.updateMany(
            { client: client._id },
            { $pull: { client: client._id } }
        );

        // 4. Remove client from Departments' clientsAllocated list
        await Department.updateMany(
            { clientsAllocated: client._id },
            { $pull: { clientsAllocated: client._id } }
        );


        // console.log(`Client ${clientId} (${client.name}) deactivated by User ${requestingUserId}`);
        console.log(`Client ${clientId} (${client.name}) deactivated.`);
        return res.status(200).json({
            success: true,
            message: `Client '${client.name}' marked as inactive successfully and associations updated.`,
            data: normalizeClient(client)
        });

    } catch (error) {
        console.error("Error deactivating client:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation Error', errors: error.errors });
        }
        return res.status(500).json({ success: false, message: 'Server error deactivating client.', error: error.message });
    }
};