import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/db.js';
// @ts-ignore
async function deleteDataOfSingleUser(req, res) {
    try {
        const db = await getDatabase();
        const userId = req.params.id;
        // Check if userId is provided in the request parameters
        if (userId) {
            // Delete data from chat_history_topic
            // @ts-ignore
            const deleteUserResult = await db.collection('users').deleteMany({ _id: new ObjectId(userId) });
            console.log("deleteUserResult", deleteUserResult);
            // Delete data from chat_history_topic
            const deleteTopicResult = await db.collection('chat_history_topic').deleteMany({ userId: userId });
            console.log("deleteTopicResult", deleteTopicResult);
            // Delete data from file_storage
            // @ts-ignore
            const deleteFileResult = await db.collection('file_storage').deleteMany({ userId: new ObjectId(userId) });
            console.log("deleteFileResult", deleteFileResult);
            // Delete data from search_history
            const deleteSearchResult = await db.collection('search_history').deleteMany({ userId: userId });
            console.log("deleteSearchResult", deleteSearchResult);
            // Delete data from documents
            const deleteDocumentsResult = await db.collection('documents').deleteMany({ userId: userId });
            console.log("deleteDocumentsResult", deleteDocumentsResult);
            // Delete data from the company table
            // @ts-ignore
            const deleteCompanyResult = await db.collection('company').updateOne(
            // Criteria to match documents
            { "members.userId": new ObjectId(userId) }, 
            // @ts-ignore
            { $pull: { "members": { userId: new ObjectId(userId) } } });
            console.log("deleteCompanyResult", deleteCompanyResult);
            // Check if data was successfully deleted from all tables
            // @ts-ignore
            if (deleteUserResult.deletedCount > 0 || deleteTopicResult.deletedCount > 0 || deleteFileResult.deletedCount > 0 || deleteSearchResult.deletedCount > 0 || deleteDocumentsResult.deletedCount > 0 || deleteCompanyResult.acknowledged) {
                return res.status(200).json({ message: 'Data deleted successfully', status: true });
            }
            else {
                return res.status(400).json({ message: 'Data not found or something went wrong', status: false });
            }
        }
        return res.status(400).json({ message: 'userId is required in params', status: false });
    }
    catch (error) {
        res.json({ error: error });
    }
}
// @ts-ignore
async function deleteDataOfMultipleUsers(req, res) {
    try {
        const db = await getDatabase();
        // Check if userIds are provided in the request body
        const { userIds } = req.body;
        if (!userIds || userIds.length === 0) {
            return res.status(400).json({ message: 'userIds are required in the request body', status: false });
        }
        // Delete data from users collection
        // @ts-ignore
        const deleteUserResult = await db.collection('users').deleteMany({ _id: { $in: userIds.map(id => new ObjectId(id)) } });
        // Delete data from chat_history_topic
        const deleteTopicResult = await db.collection('chat_history_topic').deleteMany({ userId: { $in: userIds } });
        // Delete data from file_storage
        // @ts-ignore
        const deleteFileResult = await db.collection('file_storage').deleteMany({ userId: { $in: userIds.map(id => new ObjectId(id)) } });
        // Delete data from search_history
        const deleteSearchResult = await db.collection('search_history').deleteMany({ userId: { $in: userIds } });
        // Delete data from documents
        const deleteDocumentsResult = await db.collection('documents').deleteMany({ userId: { $in: userIds } });
        // Delete data from the company table
        const deleteCompanyResult = await db.collection('company').updateOne(
        // Criteria to match documents
        // @ts-ignore
        { "members.userId": { $in: userIds.map(id => new ObjectId(id)) } }, 
        // Update to remove matching members
        // @ts-ignore
        { $pull: { "members": { userId: { $in: userIds.map(id => new ObjectId(id)) } } } });
        // Check if data was successfully deleted from any table
        if (deleteUserResult.deletedCount > 0 || deleteTopicResult.deletedCount > 0 || deleteFileResult.deletedCount > 0 || deleteSearchResult.deletedCount > 0 || deleteDocumentsResult.deletedCount > 0 || deleteCompanyResult.acknowledged) {
            return res.status(200).json({ message: 'Data deleted successfully', status: true });
        }
        else {
            return res.status(400).json({ message: 'Data not found or something went wrong', status: false });
        }
    }
    catch (error) {
        res.json({ error: error });
    }
}
// @ts-ignore
async function updateUserStatusById(req, res) {
    try {
        const db = await getDatabase();
        // Extract userId and userStatus from request parameters
        const userId = req.params.id;
        const { userStatus } = req.body;
        if (!userId || userStatus === undefined) {
            return res.status(400).json({ message: 'userId and userStatus are required', status: false });
        }
        // Update data in the users collection
        // @ts-ignore
        const updateUserResult = await db.collection('users').updateOne({ _id: new ObjectId(userId) }, { $set: { userStatus: userStatus } });
        // Check if data was successfully updated in the users collection
        if (updateUserResult.modifiedCount > 0) {
            return res.status(200).json({ message: 'User data updated successfully', status: true });
        }
        else {
            return res.status(400).json({ message: 'User not found or something went wrong', status: false });
        }
    }
    catch (error) {
        res.json({ error: error });
    }
}
export { deleteDataOfSingleUser, deleteDataOfMultipleUsers, updateUserStatusById };
//# sourceMappingURL=userActionController.js.map