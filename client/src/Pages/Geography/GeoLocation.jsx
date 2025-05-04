import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "@mui/material/styles";

// Sample Icon Fix for React-Leaflet Marker
import L from "leaflet";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const GeoLocation = () => {
    // eslint-disable-next-line no-unused-vars
    const [clients, setClients] = useState([]);
    const [locationData, setLocationData] = useState({});
    const theme = useTheme();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await fetch("http://localhost:4000/clientData/clients");
                const data = await response.json();
                // console.log(data);
                // Group by location and sum revenue
                const groupedData = data.reduce((acc, client) => {
                    const location = client.location;
                    const revenue = client.paymentAfterCompletion || 0;

                    if (!acc[location]) {
                        acc[location] = {
                            totalRevenue: 0,
                            clients: [],
                            latLng: client.latLng, // Ensure backend sends lat/lng for each client
                        };
                    }
                    acc[location].totalRevenue += revenue;
                    acc[location].clients.push(client);

                    return acc;
                }, {});

                setLocationData(groupedData);
                setClients(data);
            } catch (error) {
                console.error("Error fetching client data:", error);
            }
        };

        fetchClients();
    }, []);

    return (
        <div style={{ height: "600px", width: "100%", margin: "20px 0" }}>
            <MapContainer
                center={[20, 78]} // Default center (e.g., India)
                zoom={5}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {Object.entries(locationData).map(([location, data]) => (
                    <React.Fragment key={location}>
                        {/* Circle to represent revenue */}
                        <Circle
                            center={data.latLng}
                            radius={data.totalRevenue * 10} // Scale radius by revenue
                            color={theme.palette.secondary.main}
                            fillColor={theme.palette.secondary.light}
                            fillOpacity={0.5}
                        />
                        {/* Marker with Popup */}
                        <Marker position={data.latLng}>
                            <Popup>
                                <strong>Location:</strong> {location}
                                <br />
                                <strong>Total Revenue:</strong> ${data.totalRevenue}
                                <br />
                                <strong>Clients:</strong>
                                <ul>
                                    {data.clients.map(client => (
                                        <li key={client._id}>{client.name}</li>
                                    ))}
                                </ul>
                            </Popup>
                        </Marker>
                    </React.Fragment>
                ))}
            </MapContainer>
        </div>
    );
};

export default GeoLocation;

