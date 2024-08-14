import nodemailer from "nodemailer";
import dotenv from "dotenv";
// @ts-ignore
import { AddUserVerifyEmail } from "./modules/AddUserVerifyEmail.js"
import { ForgotPasswordOTP } from "./modules/ForgotPasswordOTP.js";
import { SetupMultiFactOfEmailOtp } from "./modules/SetupMultiFactOfEmailOtp.js";


dotenv.config(); // Load environment variables from a .env file

const SENDER_EMAIL = process.env.SMTP_USERNAME;
const SENDER_PASSWORD = process.env.APP_MAIL_PASSWORD;
// const REMOTE_BACKEND_URL = process.env.REMOTE_BACKEND_URL;

// @ts-ignore
async function addUserVerifyMail(email, token,firstName,lastName,password ){
  const mailData = AddUserVerifyEmail(
    SENDER_EMAIL,
    email, token,firstName,lastName,password
  );
  await sendEmail(mailData);
};

// @ts-ignore
async function otpForgotPasswordMail(email, otp){
  const mailData = ForgotPasswordOTP(
    SENDER_EMAIL,
    email, otp
  );
 sendEmail(mailData);
};

// @ts-ignore
async function otpForSetupEmailAuthenticationMail(email, otp){
  const mailData = SetupMultiFactOfEmailOtp(
    SENDER_EMAIL,
    email, otp
  );
 sendEmail(mailData);
};

// @ts-ignore
 async function sendEmail (bodyData) {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: SENDER_EMAIL,
        pass: SENDER_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Use this only for testing, consider using a valid certificate in production
      },
    });

    const info = await transporter.sendMail(bodyData);
    console.log("Email sent: " + info.response);
  } catch (error) {
    // @ts-ignore
    console.error("Error sending email: " + error.message);
  }
};

export {
  addUserVerifyMail,
  otpForgotPasswordMail,
  otpForSetupEmailAuthenticationMail
}

