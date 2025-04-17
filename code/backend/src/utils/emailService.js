import nodemailer from 'nodemailer';

const createTransporter = () => {
    console.log('Creating email transporter with config:', {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD
        }
    });
};

export const sendPasswordEmail = async (email, username, newPassword) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Password Has Been Updated',
            html: `
                <h1>Password Update Notification</h1>
                <p>Hello ${username},</p>
                <p>Your password has been updated. Here is your new password:</p>
                <p style="background-color: #f0f0f0; padding: 10px; font-family: monospace;">${newPassword}</p>
                <p>Please login with this password here onwards, until your password is changed again.</p>
                <p>If you did not request this change, please contact the administrator immediately.</p>
                <br>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('Detailed email error:', {
            error: error.message,
            stack: error.stack,
            code: error.code,
            command: error.command
        });
        return false;
    }
};