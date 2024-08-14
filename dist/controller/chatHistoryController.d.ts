import { Request, Response } from "express";
declare function addTopicForChatHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function addTopicForMultipleFileChatHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function getGlobalChatHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function getPerticularPdfFileHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function getTopicChatHistoryById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function getTopicMultipleChatHistoryByIds(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function getMultiplePdfFileHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function getHistoryTopicByUserId(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export { addTopicForChatHistory, getGlobalChatHistory, getPerticularPdfFileHistory, getTopicChatHistoryById, addTopicForMultipleFileChatHistory, getTopicMultipleChatHistoryByIds, getMultiplePdfFileHistory, getHistoryTopicByUserId };
