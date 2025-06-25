import express from 'express';
    const router = express.Router();
    import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController.js';
    // Assuming you might want to protect these routes in a real application
    // import { authN } from '../middlewares/auth.js'; 

    // Route to create a new Razorpay order
    // Example: POST /api/v1/payments/create-order
    router.post('/create-order', createRazorpayOrder); // You can add authN middleware here if needed

    // Route to verify the payment after a successful transaction
    // Example: POST /api/v1/payments/verify-payment
    router.post('/verify-payment', verifyRazorpayPayment); // You can add authN middleware here if needed

    export default router;
    