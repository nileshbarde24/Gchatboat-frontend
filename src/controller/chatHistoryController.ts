import { getDatabase } from '../config/db.js';
import { Request, Response } from "express"

async function addTopicForChatHistory(req: Request, res: Response) {
    try {
        const { topicName, userId, uploadedFileId, isGlobal } = req.body;
        if (!topicName) {
            return res.status(400).json({ message: 'Topic name is required' })
        }

        const topicDetails = {
            topicName: topicName,
            userId: userId,
            uploadedFileId: uploadedFileId,
            isGlobal: isGlobal,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const chathistoryresp = await getDatabase().collection('chat_history_topic').insertOne(topicDetails);
        if (chathistoryresp.acknowledged) {
            return res.status(200).json({ data: { ...chathistoryresp }, status: true })
        } else {
            return res.status(400).json({ data: "Something went wrong", status: false })
        }

    } catch (error) {
        return res.json({ error: error });
    }
}

async function addTopicForMultipleFileChatHistory(req: Request, res: Response) {
    try {
        const { topicName, userId, uploadedFileId, isGlobal } = req.body;

        // Convert uploadedFileId to an array if it's not already
        const uploadedFileIds = Array.isArray(uploadedFileId) ? uploadedFileId : [uploadedFileId];
        console.log("uploadedFileIds", uploadedFileIds)

        if (!topicName) {
            return res.status(400).json({ message: 'Topic name is required' });
        }

        const topicDetails = {
            topicName: topicName,
            userId: userId,
            uploadedFileIds: uploadedFileIds, // Store uploadedFileIds as an array in the database
            isGlobal: isGlobal,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const chathistoryresp = await getDatabase().collection('chat_history_topic').insertOne(topicDetails);
        if (chathistoryresp.acknowledged) {
            return res.status(200).json({ data: { ...chathistoryresp }, status: true });
        } else {
            return res.status(400).json({ data: "Something went wrong", status: false });
        }

    } catch (error) {
        return res.json({ error: error });
    }
}

async function getGlobalChatHistory(req: Request, res: Response) {
    try {
        const { userId, topicId, isGlobal } = req.body; // Get the user ID from the body
        if (!userId) {
            return res.status(400).json({ error: 'Please provide userId', status: false });
        }
        if (!topicId) {
            return res.status(400).json({ error: 'Please provide topicId', status: false });
        }
        const query: any = {};
        query.$and = [
            { userId: userId },
            { topicId: topicId },
            { isGlobal: isGlobal },
        ];
        const history = await getDatabase().collection('search_history').find(query).toArray();
        return res.status(200).json({ data: { ...history }, status: 200 });

        // if (history) {
        //     return res.status(200).json({ data: { ...history }, status: 200 });
        // } else {
        //     return res.status(404).json({ data: 'History not found', status: false });
        // }
    } catch (error) {
        return res.status(500).json({ error: 'Something went wrong', status: false });
    }
}

async function getPerticularPdfFileHistory(req: Request, res: Response) {
    try {
        const { userId, uploadedFileIds, topicId } = req.body; // Get the user ID from the body
        const query: any = {};
        if (!userId) {
            return res.status(400).json({ error: 'Please provide userId', status: false });
        }
        if (!uploadedFileIds || !Array.isArray(uploadedFileIds)) {
            return res.status(400).json({ error: 'Please provide uploadedFileIds as an array in the request body', status: false });
        }
        if (!topicId) {
            return res.status(400).json({ error: 'Please provide topicId', status: false });
        }
        if (userId && uploadedFileIds) {
            let filesIdzStrArr = uploadedFileIds.toString();
            // Use a regular expression to perform a case-insensitive search
            query.$and = [
                { userId: userId },
                { uploadedFileIds: filesIdzStrArr },
                { topicId: topicId },
                // { uploadedFileIds: { $in: upl oadedFileIds } },
            ];
        }
        const history = await getDatabase().collection('search_history').find(query).toArray();
        return res.status(200).json({ data: { ...history }, status: true });

        // if (history) {
        //     return res.status(200).json({ data: { ...history }, status: true });
        // } else {
        //     return res.status(404).json({ data: 'History not found', status: false });
        // }
    } catch (error) {
        return res.status(500).json({ error: 'Something went wrong', status: false });
    }
}

async function getTopicChatHistoryById(req: Request, res: Response) {
    try {
        const uploadedFileId = req.params.id; // Get the user ID from the body
        if (!uploadedFileId) {
            return res.status(400).json({ error: 'Please provide uploadedFileId', status: false });
        }
        const historyTopic = await getDatabase().collection('chat_history_topic').find({ uploadedFileId: uploadedFileId }).toArray();

        return res.status(200).json({ data: historyTopic, status: 200 });

        // if (historyTopic && historyTopic.length > 0) {
        //     return res.status(200).json({ data: historyTopic, status: 200 });
        // } else {
        //     return res.status(404).json({ data: 'History not found', status: false });
        // }
    } catch (error) {
        return res.status(500).json({ error: 'Something went wrong', status: false });
    }
}

async function getTopicMultipleChatHistoryByIds(req: Request, res: Response) {
    try {
        // const db = await getDatabase();
        const { uploadedFileIds } = req.body // Get the array of uploadedFileIds from the request body

        if (!uploadedFileIds || !Array.isArray(uploadedFileIds)) {
            return res.status(400).json({ error: 'Please provide uploadedFileIds as an array in the request body', status: false });
        }

        const historyTopic = await getDatabase().collection('chat_history_topic').find({ uploadedFileIds: { $in: uploadedFileIds } }).toArray();

        return res.status(200).json({ data: historyTopic, status: 200 });

        // if (historyTopic && historyTopic.length > 0) {
        //     return res.status(200).json({ data: historyTopic, status: 200 });
        // } else {
        //     return res.status(404).json({ data: 'History not found', status: false });
        // }
    } catch (error) {
        return res.status(500).json({ error: 'Something went wrong', status: false });
    }
}

async function getMultiplePdfFileHistory(req: Request, res: Response) {
    try {
        const { uploadedFileIds, userId, topicId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'Please provide userId', status: false });
        }
        if (!topicId) {
            return res.status(400).json({ error: 'Please provide topicId', status: false });
        }
        if (!uploadedFileIds || !Array.isArray(uploadedFileIds)) {
            return res.status(400).json({ error: 'Please provide uploadedFileIds as an array in the request body', status: false });
        }

        let filesIdzStrArr = uploadedFileIds.toString();
        // Build the query using $in for multiple conditions
        const query: any = {
            userId: userId,
            uploadedFileIds: filesIdzStrArr,
            topicId: topicId,
            isGlobal: false
            // uploadedFileIds: { $in: uploadedFileIds },
        };

        const historyTopic = await getDatabase().collection('search_history').find(query).toArray();

        return res.status(200).json({ data: historyTopic, status: 200 });

        // if (historyTopic && historyTopic.length > 0) {
        //     return res.status(200).json({ data: historyTopic, status: 200 });
        // } else {
        //     return res.status(404).json({ error: 'History not found', status: false });
        // }
    } catch (error) {
        console.error(error); // Log the actual error for debugging
        return res.status(500).json({ error: 'Something went wrong', status: false });
    }
}

async function getHistoryTopicByUserId(req: Request, res: Response) {
    try {
        const userId = req?.params?.id; // Get the user ID from the parameters
        if (!userId) {
            return res.status(400).json({ error: 'Please provide userId', status: false });
        }

        // const query = { userId, uploadedFileId: null }; // Updated query to include the condition for uploadedFileId
        const query = { userId, isGlobal: true }; // Updated query to include the condition for uploadedFileId

        const historyTopic = await getDatabase().collection('chat_history_topic').find(query).toArray();

        return res.status(200).json({ data: historyTopic, status: 200 });


        // if (historyTopic && historyTopic.length > 0) {
        //     return res.status(200).json({ data: historyTopic, status: 200 });
        // } else {
        //     return res.status(404).json({ data: 'History not found', status: false });
        // }
    } catch (error) {
        return res.status(500).json({ error: 'Something went wrong', status: false });
    }
}

export {
    addTopicForChatHistory,
    getGlobalChatHistory,
    getPerticularPdfFileHistory,
    getTopicChatHistoryById,
    addTopicForMultipleFileChatHistory,
    getTopicMultipleChatHistoryByIds,
    getMultiplePdfFileHistory,
    getHistoryTopicByUserId

}