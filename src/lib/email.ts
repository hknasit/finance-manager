import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}${process.env.NEXT_PUBLIC_BASE_PATH}/verify-email/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email address - CashFlow",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Verify your email address</title>
        <style>
          @media only screen and (max-width: 620px) {
            .main {
              width: 100% !important;
              padding: 0 !important;
            }
            .button {
              width: 100% !important;
            }
          }
        </style>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; color: #1f2937;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f9fafb">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table class="main" width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <!-- Header with gradient -->
                <tr>
                  <td align="center" bgcolor="#f0fdf4" background="linear-gradient(to bottom right, #f0fdf4, #e0f2fe)" style="padding: 30px 30px 20px 30px; background: linear-gradient(to bottom right, #f0fdf4, #e0f2fe);">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <!-- Logo -->
                          <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="center" style="padding-bottom: 15px;">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <line x1="12" y1="1" x2="12" y2="23"></line>
                                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 28px; font-weight: bold; color: #111827;">
                                CashFlow
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td align="center" style="padding: 30px;">
                    <table border="0" cellspacing="0" cellpadding="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 20px; text-align: center;">
                          <h2 style="margin: 0; color: #111827; font-size: 24px; font-weight: bold;">Verify Your Email Address</h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 30px; text-align: center; color: #4b5563; font-size: 16px; line-height: 24px;">
                          Thank you for signing up with CashFlow! Please verify your email address to complete your registration and access all features.
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-bottom: 30px;">
                          <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="center" bgcolor="#16a34a" style="border-radius: 6px;" class="button">
                                <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 6px;">
                                  Verify Email
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px; text-align: center; color: #6b7280; font-size: 14px;">
                          Or copy and paste this link in your browser:
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 30px; text-align: center;">
                          <a href="${verificationUrl}" style="color: #16a34a; word-break: break-all; font-size: 14px; text-decoration: none; border-bottom: 1px solid #16a34a;">
                            ${verificationUrl}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="text-align: center; color: #6b7280; font-size: 14px; font-style: italic;">
                          This link will expire in 24 hours.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td align="center" bgcolor="#f3f4f6" style="padding: 20px; border-top: 1px solid #e5e7eb;">
                    <table border="0" cellspacing="0" cellpadding="0" width="100%">
                      <tr>
                        <td style="color: #6b7280; font-size: 12px; text-align: center; line-height: 18px;">
                          <p style="margin: 0;">© ${new Date().getFullYear()} CashFlow. All rights reserved.</p>
                          <p style="margin: 8px 0 0 0;">If you didn't create an account with us, please ignore this email.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

/**
 * Sends a password reset email to the user
 * @param email The recipient's email address
 * @param token The reset token (already hashed)
 * @returns Promise that resolves when the email is sent
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}${process.env.NEXT_PUBLIC_BASE_PATH}/reset-password/${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset your password - CashFlow",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Reset your password</title>
        <style>
          @media only screen and (max-width: 620px) {
            .main {
              width: 100% !important;
              padding: 0 !important;
            }
            .button {
              width: 100% !important;
            }
          }
        </style>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; color: #1f2937;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f9fafb">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table class="main" width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <!-- Header with gradient -->
                <tr>
                  <td align="center" bgcolor="#f0fdf4" background="linear-gradient(to bottom right, #f0fdf4, #e0f2fe)" style="padding: 30px 30px 20px 30px; background: linear-gradient(to bottom right, #f0fdf4, #e0f2fe);">
                    <table border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <!-- Logo -->
                          <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="center" style="padding-bottom: 15px;">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <line x1="12" y1="1" x2="12" y2="23"></line>
                                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                </svg>
                              </td>
                            </tr>
                            <tr>
                              <td align="center" style="font-size: 28px; font-weight: bold; color: #111827;">
                                CashFlow
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td align="center" style="padding: 30px;">
                    <table border="0" cellspacing="0" cellpadding="0" width="100%">
                      <tr>
                        <td style="padding-bottom: 20px; text-align: center;">
                          <h2 style="margin: 0; color: #111827; font-size: 24px; font-weight: bold;">Reset Your Password</h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 30px; text-align: center; color: #4b5563; font-size: 16px; line-height: 24px;">
                          We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-bottom: 30px;">
                          <table border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="center" bgcolor="#16a34a" style="border-radius: 6px;" class="button">
                                <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 6px;">
                                  Reset Password
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px; text-align: center; color: #6b7280; font-size: 14px;">
                          Or copy and paste this link in your browser:
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 30px; text-align: center;">
                          <a href="${resetUrl}" style="color: #16a34a; word-break: break-all; font-size: 14px; text-decoration: none; border-bottom: 1px solid #16a34a;">
                            ${resetUrl}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td style="text-align: center; color: #6b7280; font-size: 14px; font-style: italic;">
                          This link will expire in 1 hour.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td align="center" bgcolor="#f3f4f6" style="padding: 20px; border-top: 1px solid #e5e7eb;">
                    <table border="0" cellspacing="0" cellpadding="0" width="100%">
                      <tr>
                        <td style="color: #6b7280; font-size: 12px; text-align: center; line-height: 18px;">
                          <p style="margin: 0;">© ${new Date().getFullYear()} CashFlow. All rights reserved.</p>
                          <p style="margin: 8px 0 0 0;">For security reasons, please never share this email or the reset link with anyone.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  return await transporter.sendMail(mailOptions);
}
