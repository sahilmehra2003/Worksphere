import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import {
    Typography, CircularProgress, Button,
    FormControl, InputLabel, Select, MenuItem,
    Grid, TextField, Autocomplete
} from '@mui/material';
import { fetchBonusTypes } from '../../../redux/Slices/bonusSlice';
import { fetchAllEmployeesInternal } from '../../../redux/Slices/employeeSlice';

const AwardBonusForm = ({ onSubmit, loading }) => {
    const dispatch = useDispatch();
    const { bonusTypes, loading: bonusTypesLoading } = useSelector((state) => state.bonus);
    const { employees, loading: employeesLoading } = useSelector((state) => state.employee);

    const [formData, setFormData] = useState({
        employee: null,
        bonusType: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        reason: '',
        monetaryAmount: '',
        currency: 'INR',
        nonMonetaryDetails: '',
        leaveDaysGranted: ''
    });

    useEffect(() => {
        dispatch(fetchAllEmployeesInternal());
        dispatch(fetchBonusTypes());
    }, [dispatch]);

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            employeeId: formData.employee?._id,
            bonusTypeId: formData.bonusType,
            monetaryAmount: formData.monetaryAmount ? parseFloat(formData.monetaryAmount) : undefined,
            leaveDaysGranted: formData.leaveDaysGranted ? parseFloat(formData.leaveDaysGranted) : undefined
        };
        onSubmit(dataToSubmit);
    };

    const selectedBonusType = bonusTypes.find(type => type._id === formData.bonusType);
    const isMonetary = selectedBonusType?.category === 'Monetary' || selectedBonusType?.category === 'Mixed';
    const isLeaveCredit = selectedBonusType?.category === 'LeaveCredit';
    const isNonMonetary = ['NonMonetary_Gift', 'NonMonetary_Experience', 'WellnessBenefit', 'DevelopmentOpportunity', 'Recognition'].includes(selectedBonusType?.category);

    return (
        <form onSubmit={handleFormSubmit}>
            <Typography variant="h5" sx={{ mb: 3 }}>Award New Bonus</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Autocomplete
                        options={employees || []}
                        getOptionLabel={(option) => `${option.name} (${option.position})`}
                        value={formData.employee}
                        onChange={(event, newValue) => {
                            setFormData({ ...formData, employee: newValue });
                        }}
                        loading={employeesLoading}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Employee"
                                required
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {employeesLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                        <InputLabel>Bonus Type</InputLabel>
                        <Select
                            name="bonusType"
                            value={formData.bonusType}
                            label="Bonus Type"
                            onChange={(e) => setFormData({ ...formData, bonusType: e.target.value })}
                            disabled={bonusTypesLoading}
                        >
                            {bonusTypesLoading ? (
                                <MenuItem disabled>Loading...</MenuItem>
                            ) : (
                                bonusTypes.map(type => (
                                    <MenuItem key={type._id} value={type._id}>
                                        {type.name} ({type.category})
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>
                </Grid>

                {isMonetary && (
                    <>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                name="monetaryAmount"
                                label="Amount"
                                type="number"
                                value={formData.monetaryAmount}
                                onChange={(e) => setFormData({ ...formData, monetaryAmount: e.target.value })}
                                inputProps={{ min: 0, step: 0.01 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                name="currency"
                                label="Currency"
                                value={formData.currency}
                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                inputProps={{ maxLength: 3 }}
                            />
                        </Grid>
                    </>
                )}

                {isLeaveCredit && (
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            required
                            name="leaveDaysGranted"
                            label="Leave Days Granted"
                            type="number"
                            value={formData.leaveDaysGranted}
                            onChange={(e) => setFormData({ ...formData, leaveDaysGranted: e.target.value })}
                            inputProps={{ min: 0.5, step: 0.5 }}
                        />
                    </Grid>
                )}

                {isNonMonetary && (
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
                            name="nonMonetaryDetails"
                            label="Non-Monetary Details"
                            multiline
                            rows={3}
                            value={formData.nonMonetaryDetails}
                            onChange={(e) => setFormData({ ...formData, nonMonetaryDetails: e.target.value })}
                            placeholder="Describe the gift, experience, or benefit details..."
                        />
                    </Grid>
                )}

                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        required
                        name="effectiveDate"
                        label="Effective Date"
                        type="date"
                        value={formData.effectiveDate}
                        onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        required
                        name="reason"
                        label="Reason for Bonus"
                        multiline
                        rows={4}
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="Explain why this bonus is being awarded..."
                    />
                </Grid>

                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || bonusTypesLoading || employeesLoading}
                    >
                        {loading ? <CircularProgress size={24} /> : "Award Bonus"}
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

AwardBonusForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    loading: PropTypes.bool,
};

export default AwardBonusForm;
