import { Request, Response } from "express";
declare function updateChatTopicByUserId(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function DeleteChatTopicByUserId(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export { updateChatTopicByUserId, DeleteChatTopicByUserId };
