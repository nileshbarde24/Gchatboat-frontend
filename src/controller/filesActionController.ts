import { ObjectId } from 'mongodb';
import { getDatabase } from '../config/db.js';
import { Request, Response } from "express"
import { loadAndSplitFile } from "../lib/contextManager.js"
import { storeFileToDB, getVectorStore } from "../lib/dbVectorStore.js"
// import * as fs from 'fs';

import { fileURLToPath } from 'url';
import fs from 'fs';
import path, { dirname, join } from 'path';


// @ts-ignore
async function deleteDataOfSingleFile(req: Request, res: Response) {
    try {
        const db = getDatabase();
        const uploadedFileId = req.params.id;

        if (!uploadedFileId) {
            return res.status(400).json({ message: 'uploadedFileId is required in params', status: false });
        }

        // check file exists or not in db:
        const resp = await getFileById(uploadedFileId);
        if (resp.status === false) {
            return res.status(404).json({ message: 'File not found', status: false });
        }

        //    New
        const deletePromises = [
            db.collection('chat_history_topic').deleteMany({ uploadedFileId }),
            db.collection('file_storage').deleteMany({ _id: new ObjectId(uploadedFileId) }),
            db.collection('search_history').deleteMany({ uploadedFileIds: { $in: [uploadedFileId] } }),
            db.collection('documents').deleteMany({ uploadedFileId })
        ];

        const [deleteTopicResult, deleteFileResult, deleteSearchResult, deleteDocumentsResult] = await Promise.all(deletePromises);

        if (
            deleteTopicResult.deletedCount > 0 ||
            deleteFileResult.deletedCount > 0 ||
            deleteSearchResult.deletedCount > 0 ||
            deleteDocumentsResult.deletedCount > 0) {
            return res.status(200).json({ message: 'Data deleted successfully', status: true });
        } else {
            return res.status(400).json({ message: 'Data not found or something went wrong', status: false });
        }

    } catch (error) {
        return res.status(400).json({ message: 'Data not found or something went wrong', status: false });
    }
}


// @ts-ignore
async function deleteDataOfMultipleFile(req: Request, res: Response) {
    try {
        const db = getDatabase();
        const { uploadedFileIds } = req.body;

        if (!Array.isArray(uploadedFileIds) || uploadedFileIds.length === 0) {
            return res.status(400).json({ message: 'uploadedFileId is required in params', status: false });
        }

        const filesResp = await getAllFilesById(uploadedFileIds);
        // console.log("filesResp *** ", filesResp);

        if (filesResp.status === false) {
            return res.status(404).json({ message: 'File not found', status: false });
        }

        const deletePromises = [
            db.collection('chat_history_topic').deleteMany({ uploadedFileId: { $in: uploadedFileIds } }),
            // @ts-ignore
            db.collection('file_storage').deleteMany({ _id: { $in: uploadedFileIds.map(id => new ObjectId(id)) } }),
            db.collection('search_history').deleteMany({ uploadedFileIds: { $in: uploadedFileIds } }),
            db.collection('documents').deleteMany({ uploadedFileId: { $in: uploadedFileIds } }),
        ];

        const [deleteTopicResult, deleteFileResult, deleteSearchResult, deleteDocumentsResult] = await Promise.all(deletePromises);

        if (deleteTopicResult.deletedCount > 0 || deleteFileResult.deletedCount > 0 || deleteSearchResult.deletedCount > 0 || deleteDocumentsResult?.deletedCount > 0) {
            return res.status(200).json({ message: 'Data deleted successfully', status: true });
        } else {
            return res.status(400).json({ message: 'Data not found or something went wrong', status: false });
        }
    } catch (error) {
        res.json({ error: error });
    }
}

// Upload File:
// @ts-ignore
async function fileUpload(req: Request, res: Response) {
    // @ts-ignore
    const userId = req?.userId;
    console.log("LoggedIn userId === ", userId);

    if (!req.file) {
        return res.status(400).json({ message: 'Invalid Data' });
    }

    try {
        const uploadedFilePath = req.file.path;
        const filename = req.file.filename;
        // @ts-ignore
        const fileResp = await storeFileToDB(filename, userId, false);
        const uploadedFileId = fileResp?.insertedId?.toString();
        console.log("uploadedFileId: ", uploadedFileId);
        const documents = await loadAndSplitFile(uploadedFilePath);

        // attche userId, uploaded file id with each document chunk:
        // If uploaded file is pdf then add page number to it:
        // @ts-ignore
        let updatedDocuments;
        if (req.file?.mimetype === "application/pdf" || req.file?.originalname.toLowerCase().endsWith(".pdf")) {
            updatedDocuments = documents.map((document) => {
                // @ts-ignore
                const pageNumber = document?.metadata?.loc?.pageNumber;
                return {
                    ...document,
                    pageContent: `${document.pageContent} pageNumber ${pageNumber}`,
                    metadata: {
                        ...document.metadata,
                        userId: userId,
                        uploadedFileId: uploadedFileId
                    }
                }
            });
        } else {
            updatedDocuments = documents.map((document) => ({
                ...document,
                metadata: {
                    ...document.metadata,
                    userId: userId,
                    uploadedFileId: uploadedFileId
                }
            }));
        }

        // @ts-ignore
        const flattenedDocuments = updatedDocuments.reduce((acc, val) => acc.concat(val), []);
        const vectorStore = await getVectorStore();
        await vectorStore.addDocuments(flattenedDocuments);
        // @ts-ignore
        res.status(200).json({ data: { uploadedFileId }, message: 'Documents added successfully' });
    } catch (error) {
        console.log("error: ", error)
        res.status(500).json({ error: 'An error occurred while adding documents' });
    }
};


// utils:
async function removeFileFromUploadsDirectory(fileNameToRemove: any) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const parentDir = dirname(__dirname);
    const uploadsPath = join(parentDir, 'uploads');

    // Convert to an array if a single string is provided
    const filesToRemove = Array.isArray(fileNameToRemove) ? fileNameToRemove : [fileNameToRemove];

    const removalResults = [];

    for (const fileNameToRemove of filesToRemove) {
        const filePath = path.join(uploadsPath, fileNameToRemove);

        try {
            await fs.promises.access(filePath, fs.constants.F_OK);

            await fs.promises.unlink(filePath);

            removalResults.push({ fileName: fileNameToRemove, message: 'File removed successfully', status: true });
        } catch (error) {
            removalResults.push({ fileName: fileNameToRemove, message: 'File not found', status: false });
        }
    }

    // Check if all files were successfully removed
    const allFilesRemoved = removalResults.every(result => result.status);

    if (!allFilesRemoved) {
        return { files: removalResults, message: 'File not found', status: false }
    }
    return { files: removalResults, message: 'File removed successfully', status: true }
}


async function getFileById(uploadedFileId: any) {
    const db = getDatabase();
    let fileRemoveResp

    const file = await db.collection('file_storage').findOne({ _id: new ObjectId(uploadedFileId) });

    if (file) {
        if (file?.isUrl) {
            return { status: true }
        } else if (file?.filename) {
            try {
                fileRemoveResp = await removeFileFromUploadsDirectory(file?.filename);
                return {
                    message: fileRemoveResp.status ? 'File removed successfully' : 'File not found',
                    status: fileRemoveResp.status
                }
            } catch (error) {
                return { message: 'File not found', status: false }
            }
        }
    }

    return { message: 'File not found', status: false }
}

async function getAllFilesById(uploadedFileIds: any) {
    const db = getDatabase();
    // @ts-ignore
    const files = await db.collection('file_storage').find({ _id: { $in: uploadedFileIds.map(id => new ObjectId(id)) } }).toArray();
    const fileNames = files.map(file => file.filename);

    if (fileNames && fileNames.length > 0) {
        try {
            // fileRemoveResp = await removeFileFromUploadsDirectory(file?.filename);
            let fileRemoveResp = await removeFileFromUploadsDirectory(fileNames);
            console.log(fileRemoveResp)
            return fileRemoveResp
            // return {
            //     message: fileRemoveResp.status ? 'File removed successfully' : 'File not found',
            //     status: fileRemoveResp.status
            // }
        } catch (error) {
            return { message: 'File not found', status: false }
        }
    } else {
        return { message: 'File not found', status: false }
    }
}


export {
    deleteDataOfSingleFile,
    deleteDataOfMultipleFile,
    fileUpload
}