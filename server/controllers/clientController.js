import Client from '../models/clientSchema.js'; 
import mongoose from 'mongoose';
import Department from '../models/departmentSchema.js';
import Project from '../models/projectSchema.js';
import ProjectTeam from '../models/projectTeamSchema.js';
import { enrichClientsWithLatLng } from './geographyController.js';
// Fetch all clients
export const getAllClients = async (req, res) => {
  try {
      const clients = await Client.find()
          .populate('department', 'name')
          .lean(); 
      res.status(200).json(clients);
  } catch (error) {
      console.error('Error fetching clients:', error);
      res.status(500).json({ success: false, message: 'Internal server error fetching clients.' });
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
                               .populate('department', 'name') 
                               .populate('project', 'name')   
                               .populate('projectTeam', 'name');

      if (!client) {
          return res.status(404).json({ success: false, message: 'Client not found.' });
      }

      res.status(200).json(client); 
  } catch (error) {
      console.error('Error fetching client by ID:', error);
      res.status(500).json({ success: false, message: 'Internal server error fetching client.' });
  }
};


// --createClient ---
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
          assignedEmployees
      } = req.body;

      if (!name || !contactPersonName || !email || !phoneNumber || !location ) {
          return res.status(400).json({
              success: false,
              message: "Missing required fields: name, contactPersonName, email, phoneNumber, location are required.",
          });
      }

      //  Geocode the location 
      let latLng = null; 
      try {
           console.log(`Geocoding location for new client '${name}': ${location}`);
           latLng = await enrichClientsWithLatLng(location); 
           console.log('Geocoding result:', latLng);
      } catch (geoError) {
           console.warn(`Warning: Could not geocode location "${location}" for client ${name}. Client will be created without coordinates. Error: ${geoError.message}`);
           // Continue creating the client even if geocoding fails
      }
      // Prepare client data including latLng
      const clientData = {
          name,
          contactPersonName,
          email,
          phoneNumber,
          location,
          latLng: latLng, 
          clientCreationDate: clientCreationDate || Date.now(),
          clientFinishDate,
          project: project || null, 
          projectTeam: projectTeam || null,
          department: department || null,
          status: status !== undefined ? status : false, 
          paymentAfterCompletion,
          assignedEmployees: assignedEmployees || [] 
      };

      // Create the client document
      const newClient = await Client.create(clientData);

      // --- Update related documents (keep this logic) ---
      if (department) {
           await Department.findByIdAndUpdate(department, { $push: { clientsAllocated: newClient._id } });
      }
      if (projectTeam) {
          // Check schema: Assuming projectTeam on Client links to ProjectTeam model which needs update?
          // Or maybe ProjectTeam model needs update based on client.projectTeam? Clarify relationship if needed.
           // Assuming you want to push the client ID to the ProjectTeam's list of clients (if it exists)
           // await ProjectTeam.findByIdAndUpdate(projectTeam, {$push:{ clients: newClient._id }});
           console.warn("ProjectTeam update logic might need review based on schema relationships.");
      }
      if (project) {
          // Assuming Project model has a 'clients' array? Push client ID there.
           await Project.findByIdAndUpdate(project, { $push: { clients: newClient._id } }); // Adjust field name 'clients' if needed
      }
      if (assignedEmployees && assignedEmployees.length > 0) {
          // If assigning employees, update their records too
          await Employee.updateMany(
               { _id: { $in: assignedEmployees } },
               { $addToSet: { client: newClient._id } } // Add client to employee's client array
          );
      }
      // --- End Update related documents ---

      return res.status(201).json({
          success: true,
          message: "New client created successfully" + (latLng ? "." : " (geocoding failed or skipped)."),
          client: newClient,
      });
  } catch (error) {
      console.error("Error creating client:", error);
       if (error.name === 'ValidationError') {
           return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
      }
      return res.status(500).json({
          success: false,
          message: `Error occurred creating client: ${error.message}`,
      });
  }
};


// --- MODIFIED: updateClient ---
export const updateClient = async (req, res) => {
   try {
      const { id } = req.params;
      const updatePayload = req.body; // Get potential updates from request body

      if (!mongoose.Types.ObjectId.isValid(id)) {
           return res.status(400).json({ success: false, message: 'Invalid Client ID format.' });
      }

      // --- ADDED: Geocode if location is being updated ---
      if (updatePayload.hasOwnProperty('location')) {
          if (typeof updatePayload.location === 'string' && updatePayload.location.trim() !== '') {
               try {
                   console.log(`Geocoding updated location for client ${id}: ${updatePayload.location}`);
                   const latLng = await enrichClientsWithLatLng(updatePayload.location);
                   console.log('Geocoding result:', latLng);
                   // Add latLng to the update payload (will be null if geocoding failed)
                   updatePayload.latLng = latLng;
               } catch (geoError) {
                   console.warn(`Warning: Could not geocode updated location "${updatePayload.location}" for client ${id}. Error: ${geoError.message}`);
                   // Set latLng to null if geocoding fails during update
                   updatePayload.latLng = null;
               }
          } else {
               // If location is being set to empty/null, clear latLng
               updatePayload.latLng = null;
          }
      }
  
      // Perform the update and get the *new* document
      const updatedClient = await Client.findByIdAndUpdate(
          id,
          { $set: updatePayload }, 
          { new: true, runValidators: true } 
      );

      if (!updatedClient) {
          // findByIdAndUpdate returns null if no document matched the ID
          return res.status(404).json({ // Use 404 Not Found
              success: false,
              message: "Client not found"
          });
      }

      // TODO: Add logic here to handle changes in relationships if fields like
      // 'department', 'project', 'projectTeam', 'assignedEmployees' are updated.
      // This involves finding the old relationships, removing the client ID,
      // finding the new relationships, and adding the client ID. This can be complex.

      return res.status(200).json({
          success: true,
          message: "Client Updated Successfully",
          client: updatedClient // Return the actual updated client data
      });
  } catch (error) {
       console.error("Error updating client:", error);
       if (error.name === 'ValidationError') {
           return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
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
        const requestingUserId = req.user._id;

        // 1. Validate ID Format
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ success: false, message: 'Invalid Client ID format.' });
        }

        // 2. Find Client to check current status
        const client = await Client.findById(clientId);

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found.' });
        }

        // 3. Check if already inactive
        if (client.status === false) {
            return res.status(400).json({ success: false, message: `Client '${client.name}' is already inactive.` });
        }

        


        // 5. Perform Update - Set status to false
        const deactivatedClient = await Client.findByIdAndUpdate(
            clientId,
            { $set: { status: false } }, // Set status to false
            { new: true, runValidators: true } // Return the updated document
        );

        

        console.log(`Client ${clientId} (${deactivatedClient.name}) deactivated by User ${requestingUserId}`);
        res.status(200).json({
            success: true,
            message: `Client '${deactivatedClient.name}' marked as inactive successfully.`,
            data: deactivatedClient 
        });

    } catch (error) {
        console.error("Error deactivating client:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: 'Validation Error', error: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error deactivating client.', error: error.message });
    }
};


// // Fetch a client by ID
// export const getClientById = async (req, res) => {
//   const { id } = req.params; 

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: 'Invalid client ID' });
//   }

//   try {
//       const client = await Client.findById(id); 

//       if (!client) {
//           return res.status(404).json({ message: 'Client not found' });
//       }

//       res.status(200).json(client); 
//   } catch (error) {
//       console.error('Error fetching client:', error);
//       res.status(500).json({ message: 'Internal server error' });
//   }
// };