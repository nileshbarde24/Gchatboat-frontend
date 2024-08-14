import { Request, Response } from "express";
declare function deleteDataOfSingleFile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function deleteDataOfMultipleFile(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function fileUpload(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export { deleteDataOfSingleFile, deleteDataOfMultipleFile, fileUpload };
