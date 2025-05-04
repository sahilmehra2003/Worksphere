import dotenv from 'dotenv'
dotenv.config();
 
const logoPath = process.env.MAILTRAP_LOGO_URL || 'fallback url'; 

export const resetPasswordTemplate = (name, resetUrl) => {
  const containerStyle = "max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; font-family: Arial, sans-serif; line-height: 1.6; background-color: #ffffff;";
  const headerStyle = "text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-bottom: 20px;";
  const logoStyle = "max-width: 250px; height:auto; margin-bottom: 10px; filter:invert(1) hue-rotate(180deg);";
  const contentStyle = "margin-bottom: 20px; color: #333;";
  const buttonWrapperStyle = "text-align: center; margin: 25px 0;";

  const buttonStyle = "background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;";
  const footerStyle = "text-align: center; font-size: 12px; color: #888; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;";
  const bodyStyle = "background-color: #f4f4f4; padding: 10px; margin: 0;";

  return `
  <!doctype html>
  <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Worksphere - Password Reset</title>
    </head>
    <body style="${bodyStyle}">
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <img src="${logoPath}" alt="Worksphere Logo" style="${logoStyle}">
        </div>
        <div style="${contentStyle}">
          <p>Hello ${name || 'User'},</p>
          <p>We received a request to reset the password for your Worksphere account associated with this email address.</p>
          <p>Please click the button below to set a new password:</p>
          <div style="${buttonWrapperStyle}">
            <a href="${resetUrl}" target="_blank" style="${buttonStyle}">
              Reset Password
            </a>
          </div>
          <p>This password reset link is only valid for 15 minutes.</p>
          <p>If you did not request a password reset, please ignore this email or contact support if you have concerns. Your password will remain unchanged.</p>
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