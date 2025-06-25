import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, currency = "INR", receipt = `receipt_order_${Date.now()}` } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Amount is required and must be greater than 0." });
        }

        const options = {
            amount: Number(amount) * 100,
            currency,
            receipt,
        };

        const order = await razorpayInstance.orders.create(options);

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
        });

    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ success: false, message: "Failed to create Razorpay order.", error: error.message });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing required payment verification details." });
        }

        const crypto = await import('crypto');
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        hmac.update(body);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature === razorpay_signature) {
            console.log("Payment successful and signature verified!");
            res.status(200).json({ success: true, message: "Payment verified successfully!" });
        } else {
            console.warn("Payment verification failed: Signature mismatch.");
            res.status(400).json({ success: false, message: "Payment verification failed: Invalid signature." });
        }

    } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        res.status(500).json({ success: false, message: "Failed to verify Razorpay payment.", error: error.message });
    }
};