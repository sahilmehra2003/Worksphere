import Client from '../models/clientSchema.js'; 
import mongoose from 'mongoose';
import Employee from '../models/employeeSchema.js';
import Department from '../models/departmentSchema.js';
import Project from '../models/projectSchema.js';
import ProjectTeam from '../models/projectTeamSchema.js';
import { enrichClientsWithLatLng } from './geographyController.js';
// Fetch all clients
export const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find()
        .populate('department', 'name departmentHead') 
        enrichClientsWithLatLng();
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// Fetch a client by ID
export const getClientById = async (req, res) => {
    const { id } = req.params; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid client ID' });
    }

    try {
        const client = await Client.findById(id); 

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.status(200).json(client); 
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ message: 'Internal server error' });
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
  
      // Validate required fields
      if (!name || !contactPersonName || !email || !phoneNumber || !location ) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }
      // Create the client document
      const newClient = await Client.create({
        name,
        contactPersonName,
        email,
        phoneNumber,
        location,
        clientCreationDate: clientCreationDate || Date.now(),
        clientFinishDate,
        project,
        projectTeam,
        department,
        status,
        paymentAfterCompletion,
      });

      if (department) {
          console.log("here")
          await Department.findByIdAndUpdate(
          department,
          { $push: { clientsAllocated: newClient._id } },
          { new: true }
        );
      }
      if (projectTeam) {
         await ProjectTeam.findByIdAndUpdate(
           projectTeam,
           {$push:{projectTeam:newClient._id}},
           {new:true}
         )
      }
      if (project) {
        await Project.findByIdAndUpdate(
          project,
          { $push: { project: newClient._id } },
          { new: true }
        );
      }
  
      return res.status(201).json({
        success: true,
        message: "New client created successfully",
        client: newClient,
      });
    } catch (error) {
      console.error("Error creating client:", error);
      return res.status(500).json({
        success: false,
        message: `Error occurred: ${error.message}`,
      });
    }
  };

export const updateClient=async(req,res)=>{
      try {
         const {id}=req.params;
         const updatedClientData=await Client.findByIdAndUpdate(id,req.body);
         if (!updatedClientData) {
            return res.status(400).json({
                success:false,
                message:"Client not Found"
            })
         }
         return res.status(200).json({
            success:true,
            message:"Client Updated Successfully",
            client:updatedClientData
         })
      } catch (error) {
        return res.status(500).json({
            success:false,
            message:`Error is: ${error}`
        })
      }
}
