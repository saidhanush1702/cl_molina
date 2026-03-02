
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const sendWelcomeEmail = async (toEmail, tempPassword, orgName) => {
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error(" ENV ERROR: SMTP_USER or SMTP_PASS is undefined.");
        throw new Error("SMTP Credentials missing. Check your .env file.");
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, 
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `"System Administrator" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `Login Credentials for ${orgName}`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h2 style="color: #4f46e5;">Welcome to the Platform</h2>
                <p>An administrator account has been created for <b>${orgName}</b>.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Email:</strong> ${toEmail}</p>
                    <p style="margin: 5px 0 0 0;"><strong>Temporary Password:</strong> <code style="color: #ef4444;">${tempPassword}</code></p>
                </div>
                <p style="font-size: 0.875rem; color: #6b7280;">Please log in and update your password immediately.</p>
            </div>
        `
    };

    try {
        console.log(` Sending email to ${toEmail}...`);
        await transporter.sendMail(mailOptions);
        console.log(" Email sent successfully!");
    } catch (error) {
        console.error(" SMTP TRANSACTION ERROR:", error.message);
        throw new Error(`Email failed: ${error.message}`);
    }
};

export const sendPasswordResetEmail = async (toEmail, code) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, 
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: `"Security Team" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: "Your Password Reset Code",
        html: `
            <div style="font-family: sans-serif; padding: 20px; text-align: center;">
                <h2 style="color: #1f2937;">Password Reset Request</h2>
                <p>Use the code below to reset your password. This code expires in 15 minutes.</p>
                <div style="margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; border: 2px dashed #e5e7eb; padding: 10px 20px;">
                        ${code}
                    </span>
                </div>
                <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};