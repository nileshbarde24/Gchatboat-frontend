import { Request, Response } from "express";
declare function startConversation(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function selectedFilesStartConversation(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function analyzeImage(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function analyzeImageLocalOrUrl(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function webScrap(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export { startConversation, selectedFilesStartConversation, analyzeImage, analyzeImageLocalOrUrl, webScrap, };
