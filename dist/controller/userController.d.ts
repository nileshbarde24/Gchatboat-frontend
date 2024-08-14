import { Request, Response } from "express";
declare function registerUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function verifyEmail(req: any, res: any): Promise<any>;
declare function loginUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function getUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function getUserById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function getUserByEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function updateUserById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function ownProfileUpdate(req: any, res: any): Promise<any>;
declare function getCompany(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function getCompanyByUserId(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function updateCompanyByUserId(req: any, res: any): Promise<any>;
declare function addCompany(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function socialLogin(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function sendOtpForForgotPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function matchOtpVerify(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function resetPassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
declare function getAllFilesWithUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare function getFiles(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export { registerUser, loginUser, getUsers, socialLogin, getCompany, addCompany, updateUserById, ownProfileUpdate, getUserById, getUserByEmail, getCompanyByUserId, updateCompanyByUserId, verifyEmail, sendOtpForForgotPassword, matchOtpVerify, resetPassword, getAllFilesWithUsers, getFiles };
