import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, useTheme } from '@mui/material';

const BarChartComponent = ({ data, title }) => {
    const theme = useTheme();

    // Format currency values
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Custom tooltip formatter
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <Paper elevation={3} sx={{ p: 2, backgroundColor: theme.palette.background.paper }}>
                    <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary }}>
                        {label}
                    </Typography>
                    {payload.map((entry, index) => (
                        <Typography
                            key={index}
                            variant="body2"
                            sx={{ color: entry.color }}
                        >
                            {`${entry.name}: ${formatCurrency(entry.value)}`}
                        </Typography>
                    ))}
                </Paper>
            );
        }
        return null;
    };

    return (
        <Paper
            elevation={3}
            sx={{
                p: 3,
                m: 2,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2
            }}
        >
            <Typography
                variant="h4"
                sx={{
                    color: theme.palette.text.primary,
                    textAlign: 'center',
                    mb: 3
                }}
            >
                {title}
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                        dataKey="month"
                        stroke={theme.palette.text.secondary}
                        tick={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis
                        stroke={theme.palette.text.secondary}
                        tick={{ fill: theme.palette.text.secondary }}
                        tickFormatter={formatCurrency}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                        dataKey="expenses"
                        name="Expenses"
                        fill={theme.palette.error.main}
                    />
                    <Bar
                        dataKey="revenue"
                        name="Revenue"
                        fill={theme.palette.success.main}
                    />
                    <Bar
                        dataKey="profit"
                        name="Profit"
                        fill={theme.palette.primary.main}
                    />
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

BarChartComponent.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        month: PropTypes.string.isRequired,
        expenses: PropTypes.number.isRequired,
        revenue: PropTypes.number.isRequired,
        profit: PropTypes.number.isRequired
    })).isRequired,
    title: PropTypes.string.isRequired
};

export default BarChartComponent;