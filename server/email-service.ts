import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "l208shrikara@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  if (!process.env.EMAIL_PASSWORD) {
    console.warn("EMAIL_PASSWORD not set - email sending disabled");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "l208shrikara@gmail.com",
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
