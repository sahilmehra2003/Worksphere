import axios from "axios";
import Client from '../models/clientSchema.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const getLatLng = async (location) => {
    const apiKey = process.env.OPENCAGE_API_KEY;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      location
    )}&key=${apiKey}`;
  
    try {
      const { data } = await axios.get(url);
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        return { lat, lng };
      } else {
        console.error(`No results found for location: ${location}`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching geolocation for "${location}":`, error.message);
      return null;
    }
  };
  
export  const enrichClientsWithLatLng = async () => {
    try {
      // Fetch all clients with their locations
      const clients = await Client.find({}, { location: 1, name: 1 }).lean();
      // console.log(`Fetched ${clients.length} clients`);
  
      // Enrich client data and update the database
      for (const client of clients) {
        const latLng = await getLatLng(client.location);
        if (latLng) {
          // Update the client document with lat/lng
          await Client.updateOne(
            { _id: client._id },
            { $set: { latLng } } // Add a `latLng` field to store latitude and longitude
          );
          // console.log(`Updated client: ${client.name} with latLng:`, latLng);
        } else {
          // console.warn(`Skipping client ${client.name}: Unable to fetch lat/lng`);
        }
      }
  
      console.log("All clients updated successfully with lat/lng");
    } catch (error) {
      console.error("Error enriching clients with lat/lng:", error.message);
      throw error;
    }
  };
  