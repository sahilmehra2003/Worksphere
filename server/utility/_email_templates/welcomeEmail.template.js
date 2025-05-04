import dotenv from 'dotenv'
dotenv.config();
const logoUrl = process.env.MAILTRAP_LOGO_URL || 'DEFAULT_FALLBACK_LOGO_URL'; 
const loginUrl = process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login` : '#'; 

export const welcomeEmailTemplate = (name) => {
  return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Worksphere!</title>
    <style>
      body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f4f4f4; font-family: Arial, sans-serif; }
      table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      td { border-collapse: collapse; vertical-align: top; }
      img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
      p { margin: 0 0 1em 0; color: #333333; font-size: 16px; line-height: 1.6; }
      a { color: #007bff; text-decoration: none; }
      h1 { color: #333333; margin: 0 0 15px 0; font-size: 24px; font-weight: bold;}

      .button-td { padding: 15px 0 25px 0; text-align: center; }
      .button-a {
        background-color: #007bff; /* Primary button color */
        color: #ffffff !important; /* Ensure text is white */
        padding: 12px 30px;
        text-decoration: none !important; /* Force no underline */
        border-radius: 5px;
        font-weight: bold;
        display: inline-block;
        text-align: center;
        border: none;
        font-size: 16px;
      }

      .footer-td { padding: 20px 30px 20px 30px; border-top: 1px solid #dddddd; text-align: center; }
      .footer-td p { color: #888888; font-size: 12px; margin: 0; padding: 0; line-height: 1.4; }

      @media only screen and (max-width: 640px) {
        .wrapper { width: 100% !important; border-radius: 0 !important; }
        .container { width: 90% !important; }
        .logo { max-width: 130px !important; }
        .content-td { padding: 25px 20px 15px 20px !important; }
      }
    </style>
  </head>
  <body>
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
      <tr>
        <td align="center">

          <table class="wrapper" width="600" border="0" cellpadding="0" cellspacing="0" align="center" style="background-color: #ffffff; border: 1px solid #dddddd; border-radius: 8px; margin: 20px auto;">

            <tr>
              <td align="center" style="padding: 25px 0 20px 0; border-bottom: 1px solid #dddddd;">
                <img class="logo" src="${logoUrl}" alt="Worksphere Logo" width="150" style="max-width: 150px; height: auto; display: block; margin: 0 auto;">
              </td>
            </tr>

            <tr>
              <td class="content-td" style="padding: 35px 30px 20px 30px;">
                <h1>Welcome Aboard!</h1>
                <p>Hello ${name || 'there'},</p>
                <p>We're thrilled to welcome you to Worksphere! Your email address has been successfully verified, and your account is now active.</p>
                <p>You can now log in to access your dashboard, manage your tasks, view company resources, and much more.</p>

                {/* */}
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td class="button-td">
                      <a class="button-a" href="${loginUrl}" target="_blank" style="color: #ffffff;">
                        Go to Worksphere Login
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin: 1em 0 0 0;">If you have any questions, feel free to reach out to our support team.</p>
                <p style="margin: 0.5em 0 0 0;">Best regards,<br>The Worksphere Team</p>
              </td>
            </tr>

            {/* */}
            <tr>
              <td class="footer-td">
                 <p>
                   &copy; ${new Date().getFullYear()} Worksphere. All rights reserved.<br>
                   &#128205; Delhi, India
                 </p>
              </td>
            </tr>
          </table>
          {/* */}
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};