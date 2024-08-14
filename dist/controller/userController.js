import dotenv from 'dotenv';
import { getDatabase } from '../config/db.js';
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import jwt from "jsonwebtoken";
import { ObjectId } from 'bson';
// @ts-ignore
import { addUserVerifyMail, otpForgotPasswordMail } from '../utils/mailer/sendMails.js';
dotenv.config();
// @ts-ignore
async function registerUser(req, res) {
    try {
        const db = await getDatabase();
        const { firstName, lastName, email, password, accountType, companyName, role, companyIdUserAddFromAdmin, isTwoFaAuthinticated, secretTwoFaAuthinticate, baseToFa, isEmailAuthinticated, isPhoneSmsAuthinticated } = req.body;
        if (!firstName) {
            return res.status(400).json({ message: 'Name is required' });
        }
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        if (!accountType) {
            return res.status(400).json({ message: 'Account type is required' });
        }
        if (accountType === "Organization") {
            if (!companyName) {
                return res.status(400).json({ message: 'Company name is required' });
            }
        }
        // Hash the user's password before storing it in the database
        const hashedPassword = await hashPassword(password);
        // Check email already exists or not:
        const isEmailExists = await db.collection('users').findOne({ email });
        if (isEmailExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        let companyId; // Initialize a variable to store the company's _id
        // @ts-ignore
        const token = jwt.sign({ data: email }, process.env.JWT_SECRET, { expiresIn: '30d' });
        if (accountType === 'Organization' && companyName) {
            const companyBody = {
                name: companyName,
                adminId: "",
                members: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const company = await db.collection('company').insertOne(companyBody);
            companyId = company.insertedId;
        }
        const userDocument = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType,
            role,
            companyName,
            companyId: new ObjectId(companyId || companyIdUserAddFromAdmin), // Store the company's _id
            isEmailVerified: null,
            emailToken: token,
            secretTwoFaAuthinticate: secretTwoFaAuthinticate,
            baseToFa: baseToFa,
            isTwoFaAuthinticated: isTwoFaAuthinticated,
            isEmailAuthinticated: isEmailAuthinticated,
            isPhoneSmsAuthinticated: isPhoneSmsAuthinticated,
            userStatus: "enabled",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const resp = await db.collection('users').insertOne(userDocument);
        const updatedData = {
            adminId: resp?.insertedId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const filter = { _id: new ObjectId(companyId) };
        await db.collection('company').updateOne(filter, { $set: updatedData });
        if (resp.acknowledged) {
            const user = await db.collection('users').findOne({ email });
            if (user) {
                const access_token = jwt.sign({ _id: user._id, name: user.firstName }, process.env.JWT_SECRET || 'chatbot@123456789', { expiresIn: '7d' });
                const refresh_token = jwt.sign({ _id: user._id, name: user.firstName }, process.env.JWT_SECRET || 'chatbot@123456789', { expiresIn: '7d' });
                if (companyIdUserAddFromAdmin) {
                    console.log("Mail Send For User>>>", {
                        email, token, firstName, password
                    });
                    addUserVerifyMail(email, token, firstName, lastName, password);
                }
                return res.status(200).json({ data: { ...user, access_token, refresh_token }, status: true });
            }
            else {
                return res.status(400).json({ data: "Something went wrong", status: false });
            }
        }
        else {
            return res.status(400).json({ data: "Something went wrong", status: false });
        }
    }
    catch (error) {
        res.json({ error: error });
    }
}
// @ts-ignore
async function verifyEmail(req, res) {
    try {
        const { token } = req.params;
        const db = await getDatabase(); // You need to define the getDatabase function
        const user = await db.collection('users').findOne({
            emailToken: token,
        });
        if (user) {
            try {
                // @ts-ignore
                const decoded = await jwt.verify(token, process.env.JWT_SECRET);
                const updateUserEmail = await db.collection('users').updateOne({ _id: user._id }, { $set: { isEmailVerified: true } });
                if (updateUserEmail.modifiedCount > 0) {
                    return res.send(`
            <html>
                  <head>
                    <style>
                      body {
                            font-family: 'HK Grotesk', sans-serif;
                            text-align: center;
                            background-color: #f0f0f0; /* Set a background color */
                            height: 100vh; /* Make the body at least the height of the viewport */
                            display: flex;
                            flex-direction: column;
                            justify-content: center;
                            align-items: center;
                            margin: 0; /* Remove default body margin */
                          }
                      .content {
                        border: 2px solid #2626EA; /* Add a border around the content */
                        padding: 20px; /* Add padding to the content */
                        box-shadow: 0 0 20px rgba(0, 0, 0, 0.2); /* Add a shadow to the content */
                        background-color: #fff; /* Set a background color for the content */
                      }
                      p {
                        font-size: 24px;
                        color: #2626EA;
                      }
                      a {
                        text-decoration: none;
                        margin-top: 20px;
                        }
                      span {
                        display: inline-block;
                        background-color: #00DDE2;
                        border-radius: 30px;
                        color: #2626EA;
                        font-weight: bold;
                        font-size: 18px;
                        padding: 12px 55px;
                        transition: background-color 0.3s;
                      }
                      span:hover {
                        background-color: #0099AA; /* Change the background color on hover */
                      }
                    </style>
                  </head>
                  <body>
                    <div class="content">
                      <p>Email verified successfully</p>
                      <a target="_blank" href="${process.env.REMOTE_BASE_URL}/reset-password">
                        <span>Reset password</span>
                      </a>
                    </div>
                  </body>
                </html>

            `);
                }
            }
            catch (error) {
                console.error(error);
                return res.redirect(`${process.env.REMOTE_BASE_URL}/emailverifyfail`);
            }
        }
        else {
            return res.redirect(`${process.env.REMOTE_BASE_URL}/emailverifyfail`);
        }
    }
    catch (error) {
        console.error(error);
    }
}
// @ts-ignore
async function loginUser(req, res) {
    try {
        const db = await getDatabase();
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        // get user
        const user = await db.collection('users').findOne({ email });
        if (user) {
            // Compare the user's input password with the stored hashed password
            const passwordsMatch = await comparePassword(password, user?.password);
            if (!passwordsMatch) {
                return res.status(401).json({ message: 'Incorrect username or password' });
            }
            // generate user access token:
            const token = jwt.sign({ _id: user._id, name: user.firstName }, process.env.JWT_SECRET || 'chatbot@123456789', { expiresIn: '30d' });
            res.status(200).json({
                isSuccess: true,
                data: { ...user, access_token: token, refresh_token: token }, status: true
            });
        }
        else {
            return res.status(400).json({ message: 'User not found' });
        }
    }
    catch (error) {
        res.json({ error: error });
    }
}
// @ts-ignore
async function getUsers(req, res) {
    try {
        const db = await getDatabase();
        // @ts-ignore
        const userId = req?.userId;
        // @ts-ignore
        const company = await db.collection('company').findOne({ adminId: new ObjectId(userId) });
        const { searchText } = req.body;
        let query = {};
        if (searchText) {
            // Use a regular expression to perform a case-insensitive search
            query.$or = [
                { firstName: { $regex: searchText, $options: 'i' } },
                { email: { $regex: searchText, $options: 'i' } }
            ];
        }
        // Extract the user IDs from the company's members
        // @ts-ignore
        const memberUserIds = company.members.map(member => new ObjectId(member.userId));
        // Query users whose _id is in the memberUserIds array
        query._id = { $in: memberUserIds };
        const users = await db.collection('users').find(query).toArray();
        if (users) {
            res.status(200).json({
                isSuccess: true,
                users,
            });
        }
        else {
            return res.status(400).json({ message: 'Users not found' });
        }
    }
    catch (error) {
        res.json({ error: error });
    }
}
// @ts-ignore
async function getUserById(req, res) {
    try {
        const db = await getDatabase();
        const userId = req.params.id; // Get the user ID from the URL parameter
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID', status: false });
        }
        const filter = { _id: new ObjectId(userId) };
        const user = await db.collection('users').findOne(filter);
        if (user) {
            return res.status(200).json({ data: { ...user }, status: true });
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
async function getUserByEmail(req, res) {
    try {
        const db = await getDatabase();
        const { email } = req.body;
        const user = await db.collection('users').findOne({ email });
        if (user) {
            return res.status(200).json({ data: { ...user }, status: true });
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
async function updateUserById(req, res) {
    try {
        const db = await getDatabase();
        const userId = req.params.id; // Get the user ID from the URL parameter
        const { accountType, companyName, role, password, companyId, firstName, lastName, email } = req.body;
        // Make sure userId is a valid ObjectId
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID', status: false });
        }
        const hashedPassword = await hashPassword(password);
        let updatedData = {
            accountType: accountType,
            companyName: companyName,
            role: role,
            password: hashedPassword || "",
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        if (companyName && companyId) {
            // @ts-ignore
            updatedData.companyId = new ObjectId(companyId);
        }
        if (firstName) {
            // @ts-ignore
            updatedData.firstName = firstName;
        }
        if (lastName) {
            // @ts-ignore
            updatedData.lastName = lastName;
        }
        if (email) {
            // @ts-ignore
            updatedData.email = email;
        }
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
async function ownProfileUpdate(req, res) {
    try {
        const db = await getDatabase();
        const userId = req.params.id; // Get the user ID from the URL parameter
        const { firstName, lastName, email, oldpassword, password } = req.body;
        // Make sure userId is a valid ObjectId
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID', status: false });
        }
        const filter = { _id: new ObjectId(userId) };
        const user = await db.collection('users').findOne(filter);
        if (!user) {
            return res.status(404).json({ error: 'User not found', status: false });
        }
        // Check if the provided oldpassword matches the user's current password
        const isOldPasswordValid = await comparePassword(oldpassword, user.password);
        if (!isOldPasswordValid) {
            return res.status(400).json({ error: 'Old password is incorrect', status: false });
        }
        const hashedPassword = await hashPassword(password);
        const updatedData = {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            updatedAt: new Date(),
        };
        const updateResult = await db.collection('users').updateOne(filter, { $set: updatedData });
        if (updateResult.modifiedCount === 1) {
            return res.status(200).json({ data: { ...updateResult }, status: true });
        }
        else {
            return res.status(500).json({ error: 'Update failed', status: false });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Something went wrong', status: false });
    }
}
// @ts-ignore
async function getCompany(req, res) {
    try {
        const db = await getDatabase();
        // @ts-ignore
        const company = await db.collection('company').find({}).toArray();
        if (company) {
            res.status(200).json({
                isSuccess: true,
                company
            });
        }
        else {
            return res.status(400).json({ message: 'Users not found' });
        }
    }
    catch (error) {
        res.json({ error: error });
    }
}
// @ts-ignore
async function getCompanyByUserId(req, res) {
    try {
        const db = await getDatabase();
        const adminId = req.params.id; // Get the user ID from the URL parameter
        if (!ObjectId.isValid(adminId)) {
            return res.status(400).json({ error: 'Invalid user ID', status: false });
        }
        const filter = { adminId: new ObjectId(adminId) };
        const company = await db.collection('company').findOne(filter);
        if (company) {
            return res.status(200).json({ data: { ...company }, status: true });
        }
        else {
            return res.status(404).json({ data: 'Comapny not found', status: false });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Something went wrong', status: false });
    }
}
// @ts-ignore
async function updateCompanyByUserId(req, res) {
    try {
        const db = await getDatabase();
        const adminUserId = req.params.id; // Get the user ID from the URL parameter
        const userId = req.body.userId;
        // @ts-ignore
        const role = req.body.role;
        // Make sure userId is a valid ObjectId
        if (!ObjectId.isValid(adminUserId)) {
            return res.status(400).json({ error: 'Invalid user ID', status: false });
        }
        const newMember = {
            userId: userId,
            role: role,
        };
        // Get the new member you want to add
        const filter = { adminId: new ObjectId(adminUserId) };
        const updateData = {
            $push: {
                members: newMember, // Use $push to add a new member to the array
            },
            $set: {
                updatedAt: new Date(),
            },
        };
        const updateResult = await db.collection('company').updateOne(filter, updateData);
        if (updateResult.acknowledged) {
            return res.status(200).json({ data: { ...updateResult }, status: true });
        }
        else {
            return res.status(404).json({ data: 'Company not found', status: false });
        }
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: 'Something went wrong', status: false });
    }
}
// @ts-ignore
async function addCompany(req, res) {
    try {
        const db = await getDatabase();
        const { companyName, adminId } = req.body;
        if (!companyName) {
            return res.status(400).json({ message: 'Company name is required' });
        }
        const companyDetails = {
            name: companyName, // Store the company's _id
            adminId: new ObjectId(adminId),
            members: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const companyresp = await db.collection('company').insertOne(companyDetails);
        if (companyresp.acknowledged) {
            return res.status(200).json({ data: { ...companyresp }, status: true });
        }
        else {
            return res.status(400).json({ data: "Something went wrong", status: false });
        }
    }
    catch (error) {
        res.json({ error: error });
    }
}
// @ts-ignore
async function socialLogin(req, res) {
    try {
        const db = await getDatabase();
        const data = req.body;
        const user = await db.collection('users').findOne({ email: data.email });
        if (user) {
            const access_token = jwt.sign({ _id: user._id, name: user.firstName }, process.env.JWT_SECRET || 'chatbot@123456789', { expiresIn: '7d' });
            const refresh_token = jwt.sign({ _id: user._id, name: user.firstName }, process.env.JWT_SECRET || 'chatbot@123456789', { expiresIn: '7d' });
            return res.status(200).json({ data: { ...user, access_token, refresh_token }, status: true });
        }
        else {
            await db.collection('users').insertOne(data);
            const userDetails = await db.collection('users').findOne({ email: data.email });
            if (userDetails) {
                const access_token = jwt.sign({ _id: userDetails._id, name: userDetails.firstName }, process.env.JWT_SECRET || 'chatbot@123456789', { expiresIn: '7d' });
                const refresh_token = jwt.sign({ _id: userDetails._id, name: userDetails.firstName }, process.env.JWT_SECRET || 'chatbot@123456789', { expiresIn: '7d' });
                return res.status(200).json({ data: { ...userDetails, access_token, refresh_token }, status: true });
            }
            else {
                return res.status(400).json({ message: 'Users not found' });
            }
        }
    }
    catch (error) {
        res.json({ error: error });
    }
}
// @ts-ignore
async function sendOtpForForgotPassword(req, res) {
    try {
        const db = await getDatabase();
        const { email } = req.body;
        const isEmailExists = await db.collection('users').findOne({ email });
        // Generate a random 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000);
        const otpDetails = {
            emailOtp: otp
        };
        if (otp) {
            otpForgotPasswordMail(email, otp);
        }
        if (isEmailExists) {
            const filter = { _id: new ObjectId(isEmailExists?._id) };
            const otpRes = await db.collection('users').updateOne(filter, { $set: otpDetails });
            if (otpRes) {
                return res.status(200).json({ data: "OTP send successfully", status: true });
            }
            else {
                return res.status(400).json({ data: "Something went wrong", status: false });
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
async function matchOtpVerify(req, res) {
    try {
        const db = await getDatabase();
        const { email, otp } = req.body;
        const user = await db.collection('users').findOne({ email });
        // @ts-ignore
        if (user && user.emailOtp === otp || user.emailAuthOtp === otp) {
            // Matched OTP, return user data
            return res.status(200).json({ data: "OTP verified", status: true });
        }
        else {
            return res.status(400).json({ data: "Invalid OTP", status: false });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
// @ts-ignore
async function resetPassword(req, res) {
    try {
        const db = await getDatabase();
        const { email, password } = req.body;
        const user = await db.collection('users').findOne({ email });
        const hashedPassword = await hashPassword(password);
        if (user) {
            const updatedData = {
                email: email,
                password: hashedPassword
            };
            const filter = { _id: new ObjectId(user?._id) };
            const resetPassResult = await db.collection('users').updateOne(filter, { $set: updatedData });
            if (resetPassResult) {
                return res.status(200).json({ data: "Password change successfully", status: true });
            }
        }
        else {
            return res.status(400).json({ data: "Invalid Email or Password ", status: false });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}
//get All Files
// @ts-ignore
async function getAllFilesWithUsers(req, res) {
    try {
        const db = await getDatabase();
        const files = await db.collection('file_storage').aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
        ]).toArray();
        if (files.length > 0) {
            return res.status(200).json({
                isSuccess: true,
                files,
            });
        }
        else {
            return res.status(404).json({ message: 'No files found' });
        }
    }
    catch (error) {
        console.error(error); // Log the error for debugging purposes
        return res.status(500).json({ error: 'Internal server error' });
    }
}
// @ts-ignore
async function getFiles(req, res) {
    try {
        const db = await getDatabase();
        // @ts-ignore
        const userId = req.userId;
        // @ts-ignore
        const accountType = req.user.accountType;
        // console.log("accountType ================ ", accountType)
        // @ts-ignore
        const user = req.user;
        let files;
        if (accountType === "Organization" && user?.companyId) {
            const orgUsers = await db.collection('users').find({
                companyId: new ObjectId(user.companyId),
            }).toArray();
            files = await db.collection('file_storage').aggregate([
                {
                    $match: {
                        userId: {
                            $in: orgUsers.map(user => user._id)
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
            ]).toArray();
        }
        else if (accountType === 'Individual') {
            files = await db.collection('file_storage').aggregate([
                {
                    $match: {
                        userId: new ObjectId(userId)
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
            ]).toArray();
        }
        res.status(200).json({
            isSuccess: true,
            files,
        });
    }
    catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: 'Something went wrong!' });
    }
}
export { registerUser, loginUser, getUsers, socialLogin, getCompany, addCompany, updateUserById, ownProfileUpdate, getUserById, getUserByEmail, getCompanyByUserId, updateCompanyByUserId, verifyEmail, sendOtpForForgotPassword, matchOtpVerify, resetPassword, getAllFilesWithUsers, getFiles };
//# sourceMappingURL=userController.js.map