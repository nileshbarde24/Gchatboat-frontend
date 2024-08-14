import express from 'express';
const router = express.Router();
import { fileURLToPath } from 'url';
import multer from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { loginUser, registerUser, getUsers, socialLogin, getCompany, addCompany, updateUserById, getUserById, getCompanyByUserId, updateCompanyByUserId, verifyEmail, sendOtpForForgotPassword, matchOtpVerify, resetPassword, ownProfileUpdate, getAllFilesWithUsers, getFiles, getUserByEmail } from '../controller/userController.js';
import { authenticateToken } from "../middleware/authenticate.js";
import { getTwoFactorSetup, getUserByEmailPassword, removeMFA, sendOtpForAuthMobile, updateMFAUserByEmail, updateToFaUserById, verifyOtpForAuthMobile, verifyTwoFactorCode, verifyTwoFactorSetup } from "../controller/faAuthenticationController.js";
import { addTopicForChatHistory, addTopicForMultipleFileChatHistory, getGlobalChatHistory, getHistoryTopicByUserId, getMultiplePdfFileHistory, getPerticularPdfFileHistory, getTopicChatHistoryById, getTopicMultipleChatHistoryByIds } from '../controller/chatHistoryController.js';
import { deleteDataOfMultipleFile, deleteDataOfSingleFile, fileUpload } from '../controller/filesActionController.js';
import { deleteDataOfMultipleUsers, deleteDataOfSingleUser, updateUserStatusById } from '../controller/userActionController.js';
import { startConversation, selectedFilesStartConversation, analyzeImage, analyzeImageLocalOrUrl, webScrap } from "../controller/chatController.js";
import { DeleteChatTopicByUserId, updateChatTopicByUserId } from '../controller/chatTopicController.js';
import { createDBConnection, chatWithSQL, getAllConnections, deleteConnection, updateDBConnection, getSQLChatHistory } from "../controller/sqlController.js";
// @ts-ignore
router.get('/users', async (req, res) => {
    res.status(200).json("Users Route");
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const parentDir = dirname(__dirname);
const uploadsPath = join(parentDir, 'uploads');
if (!existsSync(uploadsPath)) {
    mkdirSync(uploadsPath);
}
// Configure Multer to store uploaded files in the 'uploads' directory
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        console.log("uploadsPath ==== ", uploadsPath);
        cb(null, uploadsPath);
    },
    filename: (_req, file, cb) => {
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.originalname}`;
        cb(null, filename);
    },
});
const upload = multer({ storage });
// console.log("uploadsPath: ", uploadsPath)
// console.log({
//     __filename,
//     __dirname,
//     parentDir,
//     uploadsPath
// })
//user routes
// @ts-ignore
router.post('/upload', authenticateToken, upload.single('file'), fileUpload);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/users', authenticateToken, getUsers);
router.post('/socialLogin', socialLogin);
router.post('/sendOtpForgotPassword', sendOtpForForgotPassword);
router.post('/matchForgotOtp', matchOtpVerify);
router.post('/resetPassword', resetPassword);
router.get('/verify/email/:token', verifyEmail);
router.put('/updateuser/:id', updateUserById);
router.put('/ownProfileUpdate/:id', ownProfileUpdate);
router.put('/delete-single-user/:id', authenticateToken, deleteDataOfSingleUser);
router.put('/delete-multiple-user', authenticateToken, deleteDataOfMultipleUsers);
router.put('/update-user-status/:id', authenticateToken, updateUserStatusById);
router.get('/getuserby/:id', getUserById);
router.post('/getuserbyemail', getUserByEmail);
//orgnization routes
router.get('/getCompany', getCompany);
router.post('/addCompany', addCompany);
router.get('/getCompanyByUser/:id', getCompanyByUserId);
router.put('/updateCompanyByUser/:id', updateCompanyByUserId);
//Files routes
router.post('/allFiles', authenticateToken, getAllFilesWithUsers);
router.post('/files', authenticateToken, getFiles);
router.put('/delete-single-file/:id', authenticateToken, deleteDataOfSingleFile);
router.put('/delete-multiple-file', authenticateToken, deleteDataOfMultipleFile);
//MFA authenticator api's
router.get('/two-factor/setup', getTwoFactorSetup);
router.post('/two-factor/verify', verifyTwoFactorSetup);
router.post('/two-factor/verifycode', verifyTwoFactorCode);
router.post('/getuserbyemailpassword', getUserByEmailPassword);
router.put('/updatemfauserbyemail', updateMFAUserByEmail);
router.put('/remove-mfa', removeMFA);
router.put('/update-two-factor-user/:id', updateToFaUserById);
//Twilo mobile authentication route
router.post('/send-otp-authmobile', sendOtpForAuthMobile);
router.post('/verify-otp-authmobile', verifyOtpForAuthMobile);
// Chat:
router.post('/analyzeImage', authenticateToken, analyzeImage);
router.post('/analyzeImage/upload', authenticateToken, upload.array('files'), analyzeImageLocalOrUrl);
router.post('/start-conversation', authenticateToken, startConversation);
router.post('/selected-files/start-conversation', authenticateToken, selectedFilesStartConversation);
//chat history route
router.post('/add-topic', authenticateToken, addTopicForChatHistory);
router.post('/add-topic-multiple-file', authenticateToken, addTopicForMultipleFileChatHistory);
router.post('/get-global-chat', authenticateToken, authenticateToken, getGlobalChatHistory);
router.post('/get-perticular-pdf-chat', getPerticularPdfFileHistory);
router.post('/get-multiple-pdf-chat', authenticateToken, getMultiplePdfFileHistory);
router.get('/get-pdf-chat-history/:id', authenticateToken, getTopicChatHistoryById);
router.get('/get-topics-chat-global/:id', authenticateToken, getHistoryTopicByUserId);
router.post('/get-multiple-pdf-chat-history', authenticateToken, getTopicMultipleChatHistoryByIds);
//chat topic route
router.put('/update-topic/:id', authenticateToken, updateChatTopicByUserId);
router.delete('/delete-topic/:id', authenticateToken, DeleteChatTopicByUserId);
router.post('/web-scraping', authenticateToken, webScrap);
router.post('/initiate-db-connection', authenticateToken, createDBConnection);
router.post('/chat-with-sql', authenticateToken, chatWithSQL);
router.post('/connections', authenticateToken, getAllConnections);
router.post('/delete-connection', authenticateToken, deleteConnection);
router.post('/update-connection', authenticateToken, updateDBConnection);
router.post('/sql-history', authenticateToken, getSQLChatHistory);
// @ts-ignore
router.post('/login', async (req, res) => {
    res.status(200).json(req.body);
});
export default router;
//# sourceMappingURL=userRoutes.js.map