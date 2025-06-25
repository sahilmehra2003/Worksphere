import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const RazorpayPaymentButton = ({ amount, description, onPaymentSuccess, onPaymentFailure, buttonText = "Pay Now" }) => {
    const [loading, setLoading] = useState(false);

    const displayRazorpay = async () => {
        setLoading(true);
        try {
            const { data: orderData } = await axios.post(
                `${BASE_URL}/api/v1/payments/create-order`,
                { amount, currency: 'INR', receipt: `order_receipt_${Date.now()}` },
                { withCredentials: true }
            );

            if (!orderData.success) {
                toast.error(orderData.message || "Failed to create payment order.");
                setLoading(false);
                return;
            }

            const options = {
                key: RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Worksphere",
                description: description || "Payment for service/product",
                order_id: orderData.orderId,
                handler: async function (response) {
                    try {
                        const { data: verificationData } = await axios.post(
                            `${BASE_URL}/api/v1/payments/verify-payment`,
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                            { withCredentials: true }
                        );

                        if (verificationData.success) {
                            toast.success("Payment successful!");
                            onPaymentSuccess && onPaymentSuccess(verificationData);
                        } else {
                            toast.error(verificationData.message || "Payment verification failed.");
                            onPaymentFailure && onPaymentFailure(verificationData);
                        }
                    } catch (verifyError) {
                        console.error("Error during payment verification:", verifyError);
                        toast.error("An error occurred during payment verification.");
                        onPaymentFailure && onPaymentFailure(verifyError);
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {},
                notes: {
                    address: "Worksphere HQ"
                },
                theme: {
                    color: "#3399CC"
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

            paymentObject.on('payment.failed', function (response) {
                console.error("Payment failed or cancelled:", response.error);
                toast.error(response.error.description || "Payment failed or cancelled.");
                onPaymentFailure && onPaymentFailure(response.error);
                setLoading(false);
            });

        } catch (error) {
            console.error("Error creating Razorpay order or during checkout setup:", error);
            toast.error(error.response?.data?.message || "Could not initiate payment.");
            onPaymentFailure && onPaymentFailure(error);
            setLoading(false);
        }
    };

    return (
        <Button
            variant="contained"
            color="primary"
            onClick={displayRazorpay}
            disabled={loading}
            sx={{ mt: 2 }}
        >
            {loading ? <CircularProgress size={24} color="inherit" /> : buttonText}
        </Button>
    );
};

export default RazorpayPaymentButton;