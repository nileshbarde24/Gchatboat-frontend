import { ObjectId } from 'mongodb';
import { Request, Response } from "express"
import { getDatabase } from '../config/db.js';

// @ts-ignore
async function updateChatTopicByUserId(req: Request, res: Response) {
    try {
        const db = await getDatabase();
        const topicId = req.params.id
        const { topicName } = req.body;
        if (!topicName) {
            return res.status(400).json({ message: 'Topic name is required' })
        }

        const topicDetails = {
            topicName: topicName,
            updatedAt: new Date(),
        };
        // @ts-ignore
        const chathistoryresp = await db.collection('chat_history_topic').updateOne({ _id:new ObjectId(topicId) },{ $set: topicDetails });
        if (chathistoryresp.acknowledged) {
            return res.status(200).json({ data: { ...chathistoryresp }, status: 200 })
        } else {
            return res.status(400).json({ data: "Something went wrong", status: 400 })
        }

    } catch (error) {
        res.json({ error: error });
    }
}


// @ts-ignore
async function DeleteChatTopicByUserId(req: Request, res: Response) {
    try {
        const db = await getDatabase();
        const topicId = req.params.id
        if (!topicId) {
            return res.status(400).json({ message: 'Topic name is required' })
        }

        
        // @ts-ignore
        const chathistoryresp = await db.collection('chat_history_topic').deleteOne({ _id:new ObjectId(topicId) });
        const chatsearchhistoryresp = await db.collection('search_history').deleteMany({topicId:topicId});
        if (chathistoryresp.acknowledged || chatsearchhistoryresp?.acknowledged) {
            return res.status(200).json({ data: { ...chathistoryresp }, status: 200 })
        } else {
            return res.status(400).json({ data: "Something went wrong", status: 400 })
        }

    } catch (error) {
        res.json({ error: error });
    }
}

export {
    updateChatTopicByUserId,
    DeleteChatTopicByUserId
}