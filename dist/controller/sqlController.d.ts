import { Request, Response } from "express";
declare function createDBConnection(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function updateDBConnection(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function getSQLChatHistory(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function chatWithSQL(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function getAllConnections(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function deleteConnection(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export { createDBConnection, chatWithSQL, getAllConnections, deleteConnection, updateDBConnection, getSQLChatHistory };
