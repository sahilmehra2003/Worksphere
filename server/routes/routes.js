import express from 'express';
const router = express.Router();
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController.js';
router.post('/create-order', createRazorpayOrder); 
router.post('/verify-payment', verifyRazorpayPayment);
export default router;