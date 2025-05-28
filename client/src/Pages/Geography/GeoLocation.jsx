import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks
import { fetchAllClients } from "../../redux/Slices/clientSlice"; // Import your thunk
import { Box, CircularProgress, Typography } from "@mui/material"; // For loading/error states

// Sample Icon Fix for React-Leaflet Marker
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const GeoLocation = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    // Get clients, loading state, and error from Redux store
    const { clients, loading, error } = useSelector((state) => state.client); // Assuming your client slice is named 'client' in the store
    const [locationData, setLocationData] = useState({});

    useEffect(() => {
        // Fetch clients when the component mounts
        dispatch(fetchAllClients());
    }, [dispatch]);

    useEffect(() => {
        // Process clients data when it's fetched from Redux
        if (clients && clients.length > 0) {
            const groupedData = clients.reduce((acc, client) => {
                const location = client.location; // Ensure client.location exists
                const revenue = client.paymentAfterCompletion || 0;

                if (!location) { // Skip clients with no location
                    console.warn(`Client ${client.name || client._id} has no location, skipping for map.`);
                    return acc;
                }
                if (!client.latLng || typeof client.latLng.lat !== 'number' || typeof client.latLng.lng !== 'number') {
                    console.warn(`Client ${client.name || client._id} at location ${location} has invalid or missing latLng, skipping for map.`);
                    return acc;
                }


                if (!acc[location]) {
                    acc[location] = {
                        totalRevenue: 0,
                        clients: [],
                        latLng: [client.latLng.lat, client.latLng.lng], // Use array format [lat, lng]
                    };
                }
                acc[location].totalRevenue += revenue;
                acc[location].clients.push(client);

                return acc;
            }, {});
            setLocationData(groupedData);
        } else {
            setLocationData({}); // Clear location data if no clients
        }
    }, [clients]); // Re-run this effect when 'clients' from Redux store changes

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" style={{ height: "600px", width: "100%", margin: "20px 0" }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading client locations...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" style={{ height: "600px", width: "100%", margin: "20px 0" }}>
                <Typography color="error">Error fetching client data: {typeof error === 'string' ? error : error.message || "Unknown error"}</Typography>
            </Box>
        );
    }

    return (
        <div style={{ height: "600px", width: "100%", margin: "20px 0" }}>
            <MapContainer
                center={[20.5937, 78.9629]} // Default center (e.g., India)
                zoom={5}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {Object.entries(locationData).map(([location, data]) => {
                    // Ensure latLng is valid before rendering Circle and Marker
                    if (!data.latLng || data.latLng.length !== 2 || typeof data.latLng[0] !== 'number' || typeof data.latLng[1] !== 'number') {
                        console.warn(`Skipping render for location ${location} due to invalid latLng:`, data.latLng);
                        return null;
                    }
                    return (
                        <React.Fragment key={location}>
                            {/* Circle to represent revenue */}
                            <Circle
                                center={data.latLng} // Leaflet expects [lat, lng]
                                radius={Math.sqrt(data.totalRevenue / Math.PI) * 30} // Example: Scale radius more meaningfully
                                pathOptions={{
                                    color: theme.palette.secondary.main,
                                    fillColor: theme.palette.secondary.light,
                                    fillOpacity: 0.5
                                }}
                            />
                            {/* Marker with Popup */}
                            <Marker position={data.latLng}>
                                <Popup>
                                    <strong>Location:</strong> {location}
                                    <br />
                                    <strong>Total Revenue:</strong> ₹{data.totalRevenue.toLocaleString()} {/* Assuming INR */}
                                    <br />
                                    <strong>Clients ({data.clients.length}):</strong>
                                    <ul>
                                        {data.clients.map(client => (
                                            <li key={client._id}>{client.name}</li>
                                        ))}
                                    </ul>
                                </Popup>
                            </Marker>
                        </React.Fragment>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default GeoLocation;