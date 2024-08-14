import { getDatabase } from '../config/db.js';
import dotenv from 'dotenv';
import { ObjectId } from 'bson';
// @ts-ignore
import speakeasy from "speakeasy";
import { comparePassword } from '../utils/passwordUtils.js';
import { otpForSetupEmailAuthenticationMail } from '../utils/mailer/sendMails.js';
//twilo credential
// @ts-ignore
import twilio from 'twilio';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_SERVICE_SID = process.env.TWILIO_SERVICE_SID;
// @ts-ignore
const client = new twilio.Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
// @ts-ignore
dotenv.config();
// @ts-ignore
let secret;
// @ts-ignore
async function getTwoFactorSetup(req, res) {
    try {
        // @ts-ignore
        secret = speakeasy.generateSecret();
        if (secret) {
            res.status(200).json({ secret });
        }
        else {
            return res.status(400).json({ message: 'Secret not found' });
        }
    }
    catch (error) {
        res.json({ error: error });
    }
}
// @ts-ignore
async function verifyTwoFactorSetup(req, res) {
    const { token } = req.body;
    const verified = speakeasy.totp.verify({
        // @ts-ignore
        secret: secret.base32,
        encoding: 'base32',
        token,
        window: 2, // Allowing a time window of 2 intervals in case the clocks are out of sync
    });
    if (verified) {
        res.status(200).json({ success: true });
    }
    else {
        res.status(400).json({ success: false, message: 'Invalid token' });
    }
}
// @ts-ignore
async function verifyTwoFactorCode(req, res) {
    const { token, baseToFa } = req.body;
    const verified = speakeasy.totp.verify({
        // @ts-ignore
        secret: baseToFa,
        encoding: 'base32',
        token,
        window: 2, // Allowing a time window of 2 intervals in case the clocks are out of sync
    });
    if (verified) {
        res.status(200).json({ success: true });
    }
    else {
        res.status(400).json({ success: false, message: 'Invalid token' });
    }
}
// @ts-ignore
async function updateToFaUserById(req, res) {
    try {
        const db = await getDatabase();
        const userId = req.params.id; // Get the user ID from the URL parameter
        const { isTwoFaAuthinticated, secretTwoFaAuthinticate, baseToFa } = req.body;
        let updatedData = {
            isTwoFaAuthinticated: isTwoFaAuthinticated,
            baseToFa: baseToFa,
            secretTwoFaAuthinticate: secretTwoFaAuthinticate
        };
        const filter = { _id: new ObjectId(userId) };
        const updateResult = await db.collection('users').updateOne(filter, { $set: updatedData });
        if (updateResult.modifiedCount === 1) {
            return res.status(200).json({ data: { ...updateResult }, status: true });
        }
        else {
            return res.status(404).json({ data: 'User not found', status: false });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Something went wrong', status: false });
    }
}
// @ts-ignore
async function getUserByEmailPassword(req, res) {
    try {
        const db = await getDatabase();
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json({ data: 'Email  are required', status: false });
        }
        if (!password) {
            return res.status(400).json({ data: 'Password  are required', status: false });
        }
        const user = await db.collection('users').findOne({ email });
        if (user) {
            // Generate a random 4-digit OTP
            const otp = Math.floor(1000 + Math.random() * 9000);
            const otpDetails = {
                emailAuthOtp: otp
            };
            const passwordsMatch = await comparePassword(password, user?.password);
            if (passwordsMatch) {
                const filter = { _id: new ObjectId(user?._id) };
                const otpRes = await db.collection('users').updateOne(filter, { $set: otpDetails });
                if (otpRes) {
                    console.log(">>>Mail send");
                    otpForSetupEmailAuthenticationMail(email, otp);
                    return res.status(200).json({ data: "OTP send successfully", status: 200 });
                }
                else {
                    return res.status(400).json({ data: "Something went wrong", status: 400 });
                }
            }
        }
        else {
            return res.status(400).json({ data: "Email is not registered", status: false });
        }
    }
    catch (error) {
        res.json({ error: error });
    }
}
// @ts-ignore
async function updateMFAUserByEmail(req, res) {
    try {
        const db = await getDatabase();
        const userEmail = req.body.email; // Get the user email from the request body
        const filter = { email: userEmail }; // Use email as the filter criteria
        const updateResult = await db.collection('users').updateOne(filter, { $set: req.body });
        if (updateResult.modifiedCount === 1) {
            return res.status(200).json({ data: { ...updateResult }, status: 200 });
        }
        else {
            return res.status(404).json({ data: 'User not found', status: 404 });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Something went wrong', status: false });
    }
}
// @ts-ignore
async function sendOtpForAuthMobile(req, res) {
    const { countryCode, phoneNumber } = req.body;
    try {
        const otpResponse = await client.verify.v2
            // @ts-ignore
            .services(TWILIO_SERVICE_SID)
            .verifications.create({
            to: `+${countryCode}${phoneNumber}`,
            channel: "sms",
        });
        // console.log(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID);
        res.status(200).send(`Otp sent successfully!: ${JSON.stringify(otpResponse)}`);
    }
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
}
// @ts-ignore
async function verifyOtpForAuthMobile(req, res) {
    const { countryCode, phoneNumber, otp } = req.body;
    try {
        const verifyOtpResponse = await client.verify.v2
            // @ts-ignore
            .services(TWILIO_SERVICE_SID)
            .verificationChecks.create({
            to: `+${countryCode}${phoneNumber}`,
            code: otp,
        });
        // console.log(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID);
        res.status(200).send(`Otp Verified successfully!: ${JSON.stringify(verifyOtpResponse)}`);
    }
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
}
// @ts-ignore
async function removeMFA(req, res) {
    try {
        const db = await getDatabase();
        const { email, password, isEmailAuthinticated, isTwoFaAuthinticated, isPhoneSmsAuthinticated, baseToFa, secretTwoFaAuthinticate } = req.body;
        if (!email) {
            return res.status(400).json({ data: 'Email  are required', status: false });
        }
        if (!password) {
            return res.status(400).json({ data: 'Password  are required', status: false });
        }
        const user = await db.collection('users').findOne({ email });
        const passwordsMatch = await comparePassword(password, user?.password);
        if (passwordsMatch) {
            const filter = { _id: user?._id };
            if (isTwoFaAuthinticated !== undefined) {
                // @ts-ignore
                const updatedData = {
                    isTwoFaAuthinticated: isTwoFaAuthinticated,
                    baseToFa: baseToFa,
                    secretTwoFaAuthinticate: secretTwoFaAuthinticate
                };
                const updateResult = await db.collection('users').updateOne(filter, { $set: updatedData });
                if (updateResult.modifiedCount === 1) {
                    return res.status(200).json({ data: { ...updateResult }, status: 200 });
                }
                else {
                    return res.status(404).json({ data: 'User not found', status: 404 });
                }
            }
            if (isEmailAuthinticated !== undefined) {
                // @ts-ignore
                const updatedData = {
                    isEmailAuthinticated: isEmailAuthinticated,
                };
                const updateResult = await db.collection('users').updateOne(filter, { $set: updatedData });
                if (updateResult.modifiedCount === 1) {
                    return res.status(200).json({ data: { ...updateResult }, status: 200 });
                }
                else {
                    return res.status(404).json({ data: 'User not found', status: 404 });
                }
            }
            if (isPhoneSmsAuthinticated !== undefined) {
                // @ts-ignore
                const updatedData = {
                    isPhoneSmsAuthinticated: isPhoneSmsAuthinticated,
                };
                const updateResult = await db.collection('users').updateOne(filter, { $set: updatedData });
                if (updateResult.modifiedCount === 1) {
                    return res.status(200).json({ data: { ...updateResult }, status: 200 });
                }
                else {
                    return res.status(404).json({ data: 'User not found', status: 404 });
                }
            }
        }
        else {
            res.status(400).json({ error: 'Password does not matched', status: false });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Something went wrong', status: false });
    }
}
export { getTwoFactorSetup, verifyTwoFactorSetup, updateToFaUserById, verifyTwoFactorCode, getUserByEmailPassword, updateMFAUserByEmail, sendOtpForAuthMobile, verifyOtpForAuthMobile, removeMFA };
//# sourceMappingURL=faAuthenticationController.js.map