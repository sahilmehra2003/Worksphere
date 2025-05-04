import mongoose from "mongoose";
import dotenv from 'dotenv'


dotenv.config()

const dbConnect=()=>{
    mongoose.connect(process.env.MONGOdB_URL)
    .then(()=>{console.log("Db connection succesful")})
    .catch((error)=>{console.log("Issue in db Connection")
        console.error(error)
        process.exit(1);
    }   
)}

export default dbConnect