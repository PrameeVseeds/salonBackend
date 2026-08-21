import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT);
const smtpUser = process.env.SMTP_USER;
const smtpPassword = process.env.SMTP_PASSWORD;
const emailFromName = process.env.EMAIL_FROM_NAME ?? "Salon Booking System";
const emailFromAddress = process.env.EMAIL_FROM_ADDRESS;

if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !emailFromAddress) {
    throw new Error("Email configuration is incomplete.");
}

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: smtpUser,
        pass: smtpPassword,
    },
});

// Verifies SMTP settings by connecting to the mail server.
export const verifyEmailConnection = async (): Promise<void> => {
    await transporter.verify();
};

export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
    await transporter.sendMail(
        {
            from: { name: emailFromName, address: emailFromAddress },
            to, subject, text
        });
};

interface SendPasswordResetEmailInput {
    email: string;
    firstName: string;
    resetUrl: string;
    expiresInMinutes: number;
}

// Sends a password reset email to a customer.
export const sendCustomerPasswordResetEmail = async (input: SendPasswordResetEmailInput): Promise<void> => {
    await transporter.sendMail({
        from: {
            name: emailFromName,
            address: emailFromAddress,
        },
        to: input.email,
        subject: "Reset your salon account password",
        text: `
Hello ${input.firstName},

We received a request to reset your password.

Use this link: ${input.resetUrl}

This link expires in ${input.expiresInMinutes} minutes.

If you did not request this reset, you can ignore this email.
    `.trim(),
        html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Password reset request</h2>

        <p>Hello ${input.firstName},</p>

        <p>We received a request to reset your password.</p>

        <p>
          <a href="${input.resetUrl}">
            Reset your password
          </a>
        </p>

        <p>
          This link expires in
          ${input.expiresInMinutes} minutes.
        </p>

        <p>
          If you did not request this reset, you can ignore
          this email.
        </p>
      </div>
    `,
    });
};

export const sendAdminPasswordResetEmail = async (input: SendPasswordResetEmailInput): Promise<void> => {
    await transporter.sendMail({
        from: { name: emailFromName, address: emailFromAddress },
        to: input.email,
        subject: "Reset your salon admin password",
        text: `Hello ${input.firstName},
        \n\nReset your admin password using this link: ${input.resetUrl}
        \n\nThis link expires in ${input.expiresInMinutes} minutes.`,
        html: `<div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>
        Admin password reset
        </h2>
        <p>Hello ${input.firstName},</p>
        <p>We received a request to reset your admin password.</p>
        <p>
        <a href="${input.resetUrl}">Reset your password</a>
        </p>
        <p>This link expires in ${input.expiresInMinutes} minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
        </div>`,
    });
};
