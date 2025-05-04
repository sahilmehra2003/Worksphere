import User from "../models/userSchema.js";

export const getUser=async(req,res)=>{
    try {
        const user=await User.find();
        if (!user) {
          return res.status(400).json({
            status:false,
            message:"No user exist"
          })   
        }
        return res.status(200).json({
            success:true,
            message:"Here is the User",
            user
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:`Error is,${error}`
        })
    }
}