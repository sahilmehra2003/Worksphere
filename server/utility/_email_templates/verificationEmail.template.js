import dotenv from 'dotenv'
dotenv.config()

export const otpEmailTemplate = (name, otp) => {

  const containerStyle = "max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; font-family: Arial, sans-serif; line-height: 1.6; background-color: #ffffff;"; // Added white background to container
  const headerStyle = "text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-bottom: 20px;";
   
  const contentStyle = "margin-bottom: 20px; color: #333;"; const logoStyle = "max-width: 250px; height:auto; margin-bottom: 10px; filter:invert(1) hue-rotate(180deg);";
  const otpWrapperStyle = "text-align: center; margin: 25px 0;";
  const otpStyle = "font-size: 28px; font-weight: bold; color: #1a1a1a; background-color: #f2f2f2; padding: 12px 20px; border-radius: 5px; display: inline-block; letter-spacing: 3px;";
  const footerStyle = "text-align: center; font-size: 12px; color: #888; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;";
  const bodyStyle = "background-color: #f4f4f4; padding: 10px; margin: 0;"; 
  const logoPath = process.env.MAILTRAP_LOGO_URL || 'fallback url';

  return `
  <!doctype html>
  <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Worksphere - Email Verification</title>
    </head>
    <body style="${bodyStyle}">
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <img src="${logoPath}" alt="Worksphere Logo" style="${logoStyle}">
        </div>
        <div style="${contentStyle}">
          <p>Hello ${name || 'User'},</p>
          <p>Thank you for registering with Worksphere. Please use the following One-Time Password (OTP) to verify your email address:</p>
          <div style="${otpWrapperStyle}">
             <span style="${otpStyle}">${otp}</span>
          </div>
          <p>This code is valid for 5 minutes. Please enter it on the verification page.</p>
          <p>If you did not request this verification, please ignore this email or contact support if you have concerns.</p>
          <p>Thanks,<br>The Worksphere Team</p>
        </div>
        <div style="${footerStyle}">
          &copy; ${new Date().getFullYear()} Worksphere. All rights reserved.<br>
          &#128205 Delhi, India
        </div>
      </div>
    </body>
  </html>`;
};