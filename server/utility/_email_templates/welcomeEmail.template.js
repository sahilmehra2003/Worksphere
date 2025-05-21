import dotenv from 'dotenv'
dotenv.config();

const logoPath = process.env.MAILTRAP_LOGO_URL || 'DEFAULT_FALLBACK_LOGO_URL';
const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : '#';

export const welcomeEmailTemplate = (name) => {
  const containerStyle = "max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; font-family: Arial, sans-serif; line-height: 1.6; background-color: #ffffff;";
  const headerStyle = "text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-bottom: 20px;";
  const contentStyle = "margin-bottom: 20px; color: #333;";
  const logoStyle = "max-width: 250px; height:auto; margin-bottom: 10px; filter:invert(1) hue-rotate(180deg);";
  const buttonWrapperStyle = "text-align: center; margin: 25px 0;";
  const buttonStyle = "background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;";
  const footerStyle = "text-align: center; font-size: 12px; color: #888; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;";
  const bodyStyle = "background-color: #f4f4f4; padding: 10px; margin: 0;";

  return `
  <!doctype html>
  <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Welcome to Worksphere!</title>
    </head>
    <body style="${bodyStyle}">
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <img src="${logoPath}" alt="Worksphere Logo" style="${logoStyle}">
        </div>
        <div style="${contentStyle}">
          <h1 style="color: #e65100; text-align: center; margin-bottom: 20px;">Welcome Aboard!</h1>
          <p>Hello ${name || 'there'},</p>
          <p>We're thrilled to welcome you to Worksphere! Your email address has been successfully verified, and your account is now active.</p>
          <p>You can now log in to access your dashboard, manage your tasks, view company resources, and much more.</p>
          <div style="${buttonWrapperStyle}">
            <a href="${loginUrl}" target="_blank" style="${buttonStyle}">
              Go to Worksphere Login
            </a>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The Worksphere Team</p>
        </div>
        <div style="${footerStyle}">
          &copy; ${new Date().getFullYear()} Worksphere. All rights reserved.<br>
          &#128205; Delhi, India
        </div>
      </div>
    </body>
  </html>`;
};