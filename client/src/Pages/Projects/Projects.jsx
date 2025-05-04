import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const ProjectDataGrid = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get('http://localhost:4000/projectData/projects');
                setProjects(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    
    useEffect(() => {
        console.log('Projects data:', projects);
    }, [projects]);

    const columns = [
        { field: '_id', headerName: 'ID', width: 250 },
        { field: 'name', headerName: 'Project Name', width: 200 },
        { field: 'budget', headerName: 'Budget', width: 150 },
        { field: 'expenses', headerName: 'Expenses', width: 150 },
        { field: 'revenue', headerName: 'Revenue', width: 150 },
        {
            field: 'startDate',
            headerName: 'Start Date',
            width: 150,
            valueFormatter: (params) => {
                const dateValue = params.value;
                return dateValue ? new Date(dateValue).toLocaleDateString() : '2024-04-10';
            },
        },
        {
            field: 'endDate',
            headerName: 'End Date',
            width: 150,
            valueFormatter: (params) => {
                const dateValue = params.value;
                return dateValue ? new Date(dateValue).toLocaleDateString() : '2025-01-01';
            },
        },
        { field: 'status', headerName: 'Status', width: 150 },
        { field: 'projectStatus', headerName: 'Project Status', width: 150 },
        { field: 'description', headerName: 'Description', width: 300 },
    ];

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div style={{ height: 600, width: '100%' }}>
            <h4>Project Details</h4>
            <DataGrid
                rows={projects}
                columns={columns}
                pageSize={5} 
                rowsPerPageOptions={[5]}
                pagination
                getRowId={(row) => row._id} 
            />
        </div>
    );
};

export default ProjectDataGrid;