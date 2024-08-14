import { Request, Response } from "express";
declare function deleteDataOfSingleUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function deleteDataOfMultipleUsers(req: any, res: any): Promise<any>;
declare function updateUserStatusById(req: any, res: any): Promise<any>;
export { deleteDataOfSingleUser, deleteDataOfMultipleUsers, updateUserStatusById };
