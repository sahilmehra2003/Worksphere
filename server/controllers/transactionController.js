import Transaction from "../models/transactionSchema.js";

export const transactionData=async(req,res)=>{
    try {
        const {id}=req.params
        const transaction=await Transaction.findById(id);
        if (!transaction ) {
            return res.status(404).json({
                success:false,
                message:"error in fetching transaction detail"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Here is the transaction detail",
            transaction
        })
    } catch (error) {
        console.error("Error fetching transactions:", error);
      return res.status(500).json({ message: "Server error" });
    }
}
export const getAllTransactions=async(req,res)=>{
    try {
        const transactions=await Transaction.find()
        if (!transactions && transactions.length===0) {
            return res.status(404).json({
                success:false,
                message:"error in fetching transaction detail"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Here is the transaction detail",
            transactions
        })
    } catch (error) {
        console.error("Error fetching all transactions",error)
        return res.status(500).json({
            success:false,
            message:"Server Error"
        })
    }
}