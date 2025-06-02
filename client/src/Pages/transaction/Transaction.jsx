import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
     Typography, Box, CircularProgress,
    FormControl, InputLabel, Select, MenuItem, Alert 
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    fetchMonthlyReport,
    fetchAvailableYears,
    clearTransactionError 
} from '../../redux/Slices/transactionSlice'; 
import BarChartComponent from '../../components/Barchart'; 
import TransactionTimeline from '../../components/Timeline'; 
import FlexBetween from '../../components/FlexBetween';

const TransactionsPage = () => {
    const dispatch = useDispatch();
    const theme = useTheme();

    const LATEST_YEAR_CAP = 2024; // Cap the latest year to 2024 as requested
    const EARLIEST_YEAR = 2020;

    // Initialize selectedYear state. We'll refine this in useEffect based on availableYears.
    const [selectedYear, setSelectedYear] = useState(''); // Start with empty or a sensible default like LATEST_YEAR_CAP

    const {
        monthlyReportData,
        availableYears,
        reportLoading,
        reportError,
        yearsLoading,
        yearsError,
    } = useSelector((state) => state.transaction);

    // Fetch available years on component mount
    useEffect(() => {
        dispatch(fetchAvailableYears());
    }, [dispatch]);

    // Effect to set selectedYear once availableYears are fetched
    useEffect(() => {
        if (availableYears && availableYears.length > 0) {
            // Sort years descending to easily pick the latest available
            const sortedYears = [...availableYears].sort((a, b) => b - a);
            let defaultYearToSet = LATEST_YEAR_CAP; // Default to your desired cap

            if (sortedYears.includes(LATEST_YEAR_CAP)) {
                defaultYearToSet = LATEST_YEAR_CAP;
            } else if (sortedYears.length > 0) {
                // If 2024 is not in the list, pick the latest available year from the backend data
                // that is not greater than LATEST_YEAR_CAP
                const latestAvailable = sortedYears.find(year => year <= LATEST_YEAR_CAP);
                if (latestAvailable) {
                    defaultYearToSet = latestAvailable;
                } else if (sortedYears[0] < LATEST_YEAR_CAP) { // If all available years are less than cap
                    defaultYearToSet = sortedYears[0];
                }
                // If sortedYears contains years greater than LATEST_YEAR_CAP but not LATEST_YEAR_CAP itself,
                // and no years are <= LATEST_YEAR_CAP, this logic might need further refinement based on desired UX.
                // For now, it prioritizes LATEST_YEAR_CAP if available, then latest from backend data <= LATEST_YEAR_CAP.
            }
            // If availableYears is empty after fetch, defaultYearToSet remains LATEST_YEAR_CAP,
            // and yearOptions will generate the 2020-2024 range.
            setSelectedYear(defaultYearToSet);
        } else if (!yearsLoading) { // If not loading and no available years, set a default
            setSelectedYear(LATEST_YEAR_CAP);
        }
    }, [availableYears, yearsLoading]); // Re-run when availableYears or its loading state changes

    // Fetch monthly report when selectedYear changes (and is not empty)
    useEffect(() => {
        if (selectedYear) { // Ensure selectedYear has a value
            dispatch(fetchMonthlyReport({ year: selectedYear }));
        }
    }, [dispatch, selectedYear]);

    useEffect(() => {
        if (reportError) {
            console.error("Report Error:", reportError);
            // toast.error(`Report Error: ${reportError}`); // Example using toast
            // dispatch(clearTransactionError()); // Consider where to best clear errors
        }
        if (yearsError) {
            console.error("Years Error:", yearsError);
            // toast.error(`Years Error: ${yearsError}`);
        }
    }, [reportError, yearsError, dispatch]);


    const handleYearChange = (event) => {
        setSelectedYear(parseInt(event.target.value, 10));
    };

    // Generate year options for the filter
    const yearsToDisplay = (availableYears && availableYears.length > 0)
        ? [...availableYears].sort((a, b) => b - a) // Use fetched years if available, sorted descending
        : Array.from({ length: (LATEST_YEAR_CAP - EARLIEST_YEAR) + 1 }, (_, i) => LATEST_YEAR_CAP - i); // Fallback range

    if ((yearsLoading || reportLoading) && (!monthlyReportData || monthlyReportData.length === 0) && !selectedYear) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    // Ensure selectedYear is valid before rendering Select with it
    const currentSelectValue = yearsToDisplay.includes(selectedYear) ? selectedYear : (yearsToDisplay.length > 0 ? yearsToDisplay[0] : '');


    return (
        <Box p={3}>
            <FlexBetween mb={2} flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                <Typography variant="h2" sx={{ color: theme.palette.text.primary, textAlign: { xs: 'center', sm: 'left' } }}>
                    Transactions Overview
                </Typography>
                <FormControl variant="outlined" sx={{ minWidth: 150, maxWidth: '100%' }}>
                    <InputLabel id="year-select-label" shrink={!!currentSelectValue || yearsLoading}>Year</InputLabel> {/* Ensure label shrinks correctly */}
                    <Select
                        labelId="year-select-label"
                        id="year-select"
                        value={currentSelectValue} // Use a guaranteed valid value
                        onChange={handleYearChange}
                        label="Year"
                        disabled={yearsLoading || yearsToDisplay.length === 0}
                    >
                        {yearsLoading && (
                            <MenuItem value={currentSelectValue || ''}><em>Loading years...</em></MenuItem>
                        )}
                        {!yearsLoading && yearsToDisplay.length === 0 && (
                            <MenuItem value="" disabled><em>No years available</em></MenuItem>
                        )}
                        {!yearsLoading && yearsToDisplay.map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </FlexBetween>

            {/* Displaying loading/error states for the report itself */}
            {reportLoading && <Box display="flex" justifyContent="center" my={2}><CircularProgress size={24} /></Box>}
            {!reportLoading && reportError && selectedYear && (
                <Alert severity="error" sx={{ my: 2 }}>
                    Failed to load report for {selectedYear}: {typeof reportError === 'string' ? reportError : JSON.stringify(reportError)}
                </Alert>
            )}
            {!reportLoading && !reportError && selectedYear && monthlyReportData.length === 0 && (
                <Alert severity="info" sx={{ my: 2 }}>No transaction data found for the year {selectedYear}.</Alert>
            )}


            {/* Pass monthlyReportData to BarChartComponent and TransactionTimeline */}
            <BarChartComponent data={monthlyReportData || []} title={`Monthly Transactions - ${selectedYear || 'N/A'}`} />
            <TransactionTimeline transactions={monthlyReportData || []} />
        </Box>
    );
};

export default TransactionsPage;