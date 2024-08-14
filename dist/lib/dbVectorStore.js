import { MongoDBAtlasVectorSearch } from "langchain/vectorstores/mongodb_atlas";
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MongoClient, ObjectId } from "mongodb";
import dotenv from 'dotenv';
import { Document } from 'langchain/document';
dotenv.config();
const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
async function getVectorStore() {
    const documentsCollection = client.db("sample_db").collection("documents");
    const vectorStore = new MongoDBAtlasVectorSearch(new OpenAIEmbeddings(), {
        collection: documentsCollection,
        indexName: "default", // The name of the Atlas search index. Defaults to "default"
        textKey: "text", // The name of the collection field containing the raw content. Defaults to "text"
        embeddingKey: "embedding", // The name of the collection field containing the embedded text. Defaults to "embedding"
    });
    return vectorStore;
}
async function getMemoryVectorStore() {
    const historyCollection = client.db("sample_db").collection("search_history");
    const vectorStore = new MongoDBAtlasVectorSearch(new OpenAIEmbeddings(), {
        collection: historyCollection,
        indexName: "history",
        textKey: "text",
        embeddingKey: "embedding",
    });
    return vectorStore;
}
// Global Conversation - Get Relevant Documents:
// Using MMR in a vector store retrieve
async function getRelevantDocuments(userId, question) {
    const contextVectorStore = await getVectorStore();
    const retriever = contextVectorStore.asRetriever({
        searchType: "mmr",
        searchKwargs: {
            fetchK: 7,
            lambda: 0.1,
        },
        filter: {
            preFilter: {
                '$and': [
                    {
                        'userId': {
                            '$eq': userId
                        }
                    }
                ]
            }
        },
        // k: 5
    });
    const retrieverOutput = await retriever.getRelevantDocuments(question);
    console.log("retrieverOutput length", retrieverOutput?.length);
    const newContext = retrieverOutput
        .map((doc) => doc.pageContent)
        .join(', ')
        .trim()
        .replaceAll('\n', ' ');
    return newContext;
}
// Files Conversation - Get Selected Files Related Documents only:
// Using MMR in a vector store retrieve
async function getFilesRelevantDocuments(userId, uploadedFileIdz, question) {
    const contextVectorStore = await getVectorStore();
    const retriever = contextVectorStore.asRetriever({
        searchType: "mmr",
        searchKwargs: {
            fetchK: 11,
            lambda: 0.1,
        },
        filter: {
            preFilter: {
                '$and': [
                    {
                        'userId': {
                            '$eq': userId
                        }
                    }, {
                        'uploadedFileId': {
                            '$in': uploadedFileIdz
                        }
                    }
                ]
            }
        },
        // k: 4
    });
    const retrieverOutput = await retriever.getRelevantDocuments(question);
    console.log("retrieverOutput: ", retrieverOutput.length);
    const newContext = retrieverOutput
        .map((doc) => doc.pageContent)
        .join(', ')
        .trim()
        .replaceAll('\n', ' ');
    return newContext;
}
// Get Relevant History - Global:
async function getGlobalHistory(userId, topicId, question) {
    const historyVectorStore = await getMemoryVectorStore();
    const retrieveHistory = historyVectorStore.asRetriever({
        searchType: "mmr",
        searchKwargs: {
            // fetchK: 20,
            fetchK: 4,
            lambda: 0.1,
        },
        filter: {
            preFilter: {
                '$and': [
                    {
                        'userId': {
                            '$eq': userId
                        }
                    },
                    {
                        'topicId': {
                            '$eq': topicId
                        }
                    },
                    {
                        'isGlobal': {
                            '$eq': true
                        }
                    }
                ]
            }
        },
        // k: 4
    });
    const history = await retrieveHistory.getRelevantDocuments(question);
    const formattedHistory = history.map((item) => {
        let { metadata, pageContent } = item;
        const { type } = metadata;
        if (type === "question") {
            pageContent = `Human: ${pageContent}`;
        }
        else if (type === "answer") {
            pageContent = `AI: ${pageContent}`;
        }
        return { metadata, pageContent };
    });
    const historyRelevantDocs = formattedHistory
        .map((doc) => doc.pageContent)
        .join(', ')
        .trim()
        .replaceAll('\n', ' ');
    return historyRelevantDocs;
}
// Get Relevant History - File Specific:
async function getFilesHistory(userId, topicId, question, filesIdzStrArr) {
    const historyVectorStore = await getMemoryVectorStore();
    const retrieveHistory = historyVectorStore.asRetriever({
        searchType: "mmr",
        searchKwargs: {
            // fetchK: 20,
            fetchK: 4,
            lambda: 0.1,
        },
        filter: {
            preFilter: {
                '$and': [
                    {
                        'userId': {
                            '$eq': userId
                        }
                    }, {
                        'uploadedFileIds': {
                            '$eq': filesIdzStrArr
                        }
                    }, {
                        'topicId': {
                            '$eq': topicId
                        }
                    },
                    {
                        'isGlobal': {
                            '$eq': false
                        }
                    }
                ]
            }
        },
        // k: 4
    });
    const history = await retrieveHistory.getRelevantDocuments(question);
    const formattedHistory = history.map((item) => {
        let { metadata, pageContent } = item;
        const { type } = metadata;
        if (type === "question") {
            pageContent = `Human: ${pageContent}`;
        }
        else if (type === "answer") {
            pageContent = `AI: ${pageContent}`;
        }
        return { metadata, pageContent };
    });
    const historyRelevantDocs = formattedHistory
        .map((doc) => doc.pageContent)
        .join(', ')
        .trim()
        .replaceAll('\n', ' ');
    return historyRelevantDocs;
}
async function addChatLogs(question, answer) {
    const timestamp = new Date().toISOString();
    const collection = client.db("sample_db").collection('chat_logs');
    await collection.insertOne({
        question,
        answer,
        timestamp
    });
}
// embedding based history:
async function addDocumentsToMemoryVectorStore(documents) {
    const formattedDocuments = documents.map((doc) => new Document({
        pageContent: doc.content,
        metadata: {
            type: doc.metadataType,
            qaPairID: doc.qaPairID,
            userId: doc.userId,
            topicId: doc.topicId,
            uploadedFileIds: doc.uploadedFileIds,
            isGlobal: doc.isGlobal
        }
    }));
    const memoryVectorStore = await getMemoryVectorStore();
    await memoryVectorStore.addDocuments(formattedDocuments);
}
// @ts-ignore
async function storeFileToDB(filename, userId, isUrl) {
    const timestamp = new Date().toISOString();
    let serverURL;
    if (isUrl) {
        serverURL = filename;
    }
    else {
        if (process.env.ENVIRONMENT === 'local') {
            console.log("Local ENV");
            serverURL = `http://localhost:3000/uploads/${filename}`;
        }
        else {
            // serverURL = `http://192.168.178.102:3000/uploads/${filename}`;
            serverURL = `https://ai.generativegeniuses.com/uploads/${filename}`;
        }
    }
    console.log({ serverURL });
    // TODO: Save uploadd file on server:
    const collection = client.db("sample_db").collection('file_storage');
    try {
        const resp = await collection.insertOne({
            userId: new ObjectId(userId), // replaced with logged in user id
            filename: filename,
            url: serverURL, // repalced with actual uploaded sercer path
            timestamp,
            isUrl
        });
        return resp;
    }
    catch (error) {
        console.log("File Save Error: ", error);
    }
}
export { getRelevantDocuments, getFilesRelevantDocuments, addDocumentsToMemoryVectorStore, getVectorStore, getMemoryVectorStore, addChatLogs, storeFileToDB, getGlobalHistory, getFilesHistory };
//# sourceMappingURL=dbVectorStore.js.map