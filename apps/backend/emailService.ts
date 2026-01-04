import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
})

export const sendWelcomeEmail = async (userEmail: string, userId: string) =>{
    try{
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: userEmail,
            replyTo: "no-reply@example.com",
            subject: "Welcome to our platform",
            text: `Welcome to our platform ${userId}! We're glad to have you here.    ` +
                "You can start creating your workflows now." ,
            html: `
                    <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1>Welcome Aboard!</h1>
                    <p>Thanks for signing up. We are excited to have you.</p>
                    <p><strong>Your User ID:</strong> ${userId}</p>
                    <p style="font-size: 12px; color: #888;">
                        Please do not reply to this email. It is an automated notification.
                    </p>
                    </div>
                `,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: ", info.response);
        return true;
    }
    catch(error){
        console.log("Error sending email: ", error);
        return false;
    }
}