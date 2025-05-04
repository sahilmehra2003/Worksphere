
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, useTheme } from '@mui/material';

const BarChartComponent = ({ data, title }) => {
    const theme = useTheme(); 

    return (
        <Paper elevation={3} style={{ padding: '20px', margin: '20px' ,
         backgroundColor:'#1a0a1a'}}
        >
            <Typography variant="h3" style={{ color:'whitesmoke', textAlign:'center'}}>{title}</Typography><br/>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" stroke={theme.palette.neutral.main} />
                    <YAxis stroke={theme.palette.neutral.main} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="expenses" fill={theme.palette.secondary.main} />
                    <Bar dataKey="revenue" fill={theme.palette.primary.main} />
                    <Bar dataKey="profit" fill='green' /> 
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default BarChartComponent;