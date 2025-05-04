import { transporter  } from "../config/transporter.config.js";


export const sendMail=async(email,name,subject,value,htmlTemplate)=>{
    const mailOptions = {
        from: {
          address: process.env.MAILTRAP_SENDEREMAIL,
          name: "WORKSPHERE",
        },
        to: {
          address: email,
          name: name,
        },
        subject:subject, // subject line
        html:htmlTemplate(name,value),
        
  };
  try {
    await transporter.sendMail(mailOptions);
    // console.log("mail sent successfully with response: ",info.response)
  } catch (error) {
     console.log("Error in sending mail",error.message)
  }
} 