import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function notifyAdminOnSignup({ email }) {
    if (!process.env.ADMIN_EMAIL) return;
    await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: 'New user signup pending approval',
        text: `A new user signed up and is awaiting approval: ${email}`
    });
}

export async function notifyUserOnApproval({ email }) {
    await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Your account has been approved',
        text: `Hi, your account is now approved. You can log in and submit your eligibility information.`
    });
}