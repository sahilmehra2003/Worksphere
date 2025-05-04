
import mongoose from "mongoose";

const monthlyProfitLossSchema = new mongoose.Schema({
  month: { type: String, required: true },
  year: { type: Number, required: true },
  revenue: { type: Number },
  expenses: { type: Number },
  profit: { type: Number }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', monthlyProfitLossSchema);
export default Transaction