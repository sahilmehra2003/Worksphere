import {Schema,model} from 'mongoose';
import { sendMail } from '../utility/sendEmail.util.js';
const otpSchema=new Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
        expires:5*60,
    }
})


const OTP=model('OTP',otpSchema);
export default OTP;