import React from 'react';
import { Box, Typography, Grid, Paper, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RazorpayPaymentButton from '../../components/RazorpayPayemntButton';

const subscriptionPlans = [
  {
    id: 'plus',
    name: 'Plus',
    price: 1000,
    description: 'Basic features for small teams',
    features: [
      'Up to 100 employees',
      'Basic time tracking',
      'Employee profiles',
      'Leave management',
      'Email support',
    ],
    buttonText: 'Get Plus',
    color: '#8BC34A',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 2500,
    description: 'Advanced features for growing businesses',
    features: [
      'Up to 200 employees',
      'Advanced time tracking',
      'Performance reviews',
      'Document management',
      'Payroll processing',
      'Priority email support',
      'Phone support (business hours)',
    ],
    buttonText: 'Get Pro',
    color: '#9C27B0',
    mostPopular: true,
  },
  {
    id: 'ultra',
    name: 'Ultra',
    price: 5000,
    description: 'Comprehensive solution for large enterprises',
    features: [
      'Unlimited employees',
      'Enterprise-grade security',
      'Custom workflows',
      'Advanced analytics & reporting',
      'API access',
      'Dedicated account manager',
      '24/7 phone & email support',
      'On-site training',
    ],
    buttonText: 'Get Ultra',
    color: '#FFC107',
  },
];

const SubscriptionPage = () => {
  const theme = useTheme();

  const handlePaymentSuccess = (response, planName) => {
    console.log(`Payment successful for ${planName} plan:`, response);
  };

  const handlePaymentFailure = (error, planName) => {
    console.error(`Payment failed for ${planName} plan:`, error);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        py: 8,
        px: { xs: 2, sm: 4, md: 8 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `radial-gradient(circle at 10% 20%, ${theme.palette.background.paper} 0%, transparent 50%),
                         radial-gradient(circle at 90% 80%, ${theme.palette.background.paper} 0%, transparent 50%)`,
        backgroundSize: '80% 80%',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'top left, bottom right',
      }}
    >
      <Typography variant="h2" component="h1" align="center" gutterBottom
        sx={{
          fontWeight: 'bold',
          mb: 6,
          fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
          fontFamily: theme.typography.fontFamily,
          textShadow: '0 0 10px rgba(0,255,255,0.3)',
        }}
      >
        Choose Your Plan
      </Typography>

      <Grid container spacing={4} justifyContent="center" alignItems="stretch">
        {subscriptionPlans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Paper
              elevation={plan.mostPopular ? 12 : 6}
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                borderRadius: '16px',
                border: plan.mostPopular ? `2px solid ${plan.color}` : 'none',
                backgroundColor: theme.palette.background.paper,
                boxShadow: plan.mostPopular ? `0 0 25px ${plan.color}80, 0 0 10px ${plan.color}50` : '0px 4px 20px rgba(0, 0, 0, 0.4)',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-10px) scale(1.02)',
                  boxShadow: `0 0 30px ${plan.color}a0, 0 0 15px ${plan.color}80`,
                  zIndex: 1,
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor: plan.color,
                  borderRadius: '12px',
                  py: 1.5,
                  mb: 3,
                  textAlign: 'center',
                  color: plan.id === 'ultra' ? theme.palette.text.dark : theme.palette.text.light,
                  position: 'relative',
                  boxShadow: `0 2px 5px ${plan.color}80`,
                }}
              >
                <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', fontFamily: theme.typography.fontFamily }}>
                  {plan.name}
                </Typography>
                {plan.mostPopular && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.text.light,
                      borderRadius: '8px',
                      px: 1,
                      py: 0.5,
                      fontWeight: 'bold',
                      transform: 'rotate(5deg)',
                      fontFamily: theme.typography.fontFamily,
                      boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                    }}
                  >
                    Most Popular
                  </Typography>
                )}
              </Box>

              <Typography variant="h3" component="p" align="center" sx={{ fontWeight: 'bold', mb: 2, fontFamily: theme.typography.fontFamily }}>
                ₹{plan.price.toLocaleString()}{plan.price !== 0 && <Typography component="span" variant="h6" sx={{ ml: 1, fontFamily: theme.typography.fontFamily }}>/ month</Typography>}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3, fontFamily: theme.typography.fontFamily }}>
                {plan.description}
              </Typography>

              <List sx={{ flexGrow: 1, mb: 3 }}>
                {plan.features.map((feature, index) => (
                  <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: '30px', color: plan.color }}>
                      <CheckCircleOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={<Typography variant="body2" sx={{ fontFamily: theme.typography.fontFamily }}>{feature}</Typography>} />
                  </ListItem>
                ))}
              </List>

              <Box sx={{ mt: 'auto', textAlign: 'center' }}>
                <RazorpayPaymentButton
                  amount={plan.price}
                  description={`${plan.name} Plan Subscription`}
                  onPaymentSuccess={(response) => handlePaymentSuccess(response, plan.name)}
                  onPaymentFailure={(error) => handlePaymentFailure(error, plan.name)}
                  buttonText={plan.buttonText}
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SubscriptionPage;