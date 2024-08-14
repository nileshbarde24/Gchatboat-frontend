import { MongoDBAtlasVectorSearch } from "langchain/vectorstores/mongodb_atlas";
declare function getVectorStore(): Promise<MongoDBAtlasVectorSearch>;
declare function getMemoryVectorStore(): Promise<MongoDBAtlasVectorSearch>;
declare function getRelevantDocuments(userId: string, question: string): Promise<string>;
declare function getFilesRelevantDocuments(userId: string, uploadedFileIdz: any, question: string): Promise<string>;
declare function getGlobalHistory(userId: string, topicId: string, question: string): Promise<string>;
declare function getFilesHistory(userId: string, topicId: string, question: string, filesIdzStrArr: any): Promise<string>;
declare function addChatLogs(question: string, answer: string): Promise<void>;
declare function addDocumentsToMemoryVectorStore(documents: Array<{
    content: string;
    metadataType: string;
    qaPairID: string;
    userId: string;
    topicId: string;
    uploadedFileIds: string;
    isGlobal: boolean;
}>): Promise<void>;
declare function storeFileToDB(filename: string, userId: string, isUrl: boolean): Promise<import("mongodb").InsertOneResult<import("bson").Document> | undefined>;
export { getRelevantDocuments, getFilesRelevantDocuments, addDocumentsToMemoryVectorStore, getVectorStore, getMemoryVectorStore, addChatLogs, storeFileToDB, getGlobalHistory, getFilesHistory };
