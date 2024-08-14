import { v4 as uuidv4 } from 'uuid';
import { getRelevantDocuments, getFilesRelevantDocuments, addDocumentsToMemoryVectorStore, getGlobalHistory, getFilesHistory, getVectorStore, storeFileToDB } from "../lib/dbVectorStore.js";
import sanitizeInput from "../utils/sanitizeInput.js";
import { getConfig } from '../config/index.js';
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts';
import dotenv from 'dotenv';
import { getBufferWindowMemory } from "../lib/memoryManager.js";
import { ConversationChain } from "langchain/chains";
import OpenAI from "openai";
import fs from 'fs';
import { CallbackManager } from 'langchain/callbacks';
import { oneLine } from 'common-tags';
import { compile } from "html-to-text";
import { RecursiveUrlLoader } from "langchain/document_loaders/web/recursive_url";
import { RecursiveCharacterTextSplitter, } from 'langchain/text_splitter';
import { storeData } from "../lib/contextManager.js";
dotenv.config();
// chat
const chat = new ChatOpenAI({
    temperature: 0,
    modelName: process.env.MODEL || "gpt-3.5-turbo-16k",
    streaming: true
});
const windowMemory = getBufferWindowMemory();
const systemPrompt = SystemMessagePromptTemplate.fromTemplate(oneLine `
In this conversation, an AI engages with a Human. The AI is informative and bases its answers on provided context.

IMPORTANT:
- The AI should ONLY use information from the chat history (CHATHISTORY/MEMORY) and the context provided by the user (RELEVANTDOCS).
- If the relevant information is not found in these sources, the AI must respond with "I don't know." Do not mention that you didn't find information in the CHATHISTORY/MEMORY and RELEVANTDOCS; simply say "I don't know."
- Responses should prioritize CHATHISTORY/MEMORY, referring to RELEVANTDOCS only when necessary.
- The AI should refrain from generating answers not supported by the given context or chat history.
- Don't justify your answers. Don't refer to yourself in any of the created content.

Guidelines for the AI:
1. Be clear and concise in your responses.
2. Use plain language suitable for a general audience.
3. Structure your responses in an easy-to-read format, such as bullet points or a numbered list, where appropriate.
4. For large pieces of text, break the information into well-organized paragraphs to improve readability.

Provided Information:
- RELEVANTDOCS: {context}
- CHATHISTORY: {history}
- MEMORY: {immediate_history}
`);
const chatPrompt = ChatPromptTemplate.fromMessages([
    systemPrompt,
    HumanMessagePromptTemplate.fromTemplate('QUESTION: """{input}"""'),
]);
const chain = new ConversationChain({
    memory: windowMemory,
    prompt: chatPrompt,
    llm: chat,
});
const openai = new OpenAI();
async function startConversation(req, res) {
    const uniqueId = uuidv4();
    const { query, topicId } = req.body;
    // @ts-ignore
    const userId = req?.userId;
    if (!query || !topicId || !userId) {
        return res.sendStatus(400).json({ message: "Invalid Data" });
    }
    console.log({ query, topicId, userId });
    const question = sanitizeInput(query);
    const config = getConfig();
    // documents and history get relevant docs
    const history = await getGlobalHistory(userId, topicId, question);
    const context = await getRelevantDocuments(userId, question);
    try {
        const response = await chain.call({
            input: question,
            context: context,
            history: history,
            callbacks: CallbackManager.fromHandlers({
                async handleLLMNewToken(token) {
                    res.write(token);
                    console.log({ token });
                },
            }),
            immediate_history: config.useWindowMemory ? windowMemory : '',
        });
        if (response) {
            await addDocumentsToMemoryVectorStore([
                {
                    content: question,
                    metadataType: 'question',
                    qaPairID: uniqueId,
                    userId: userId,
                    topicId: topicId,
                    uploadedFileIds: "",
                    isGlobal: true
                },
                {
                    content: response?.response,
                    metadataType: 'answer',
                    qaPairID: uniqueId,
                    userId: userId,
                    topicId: topicId,
                    uploadedFileIds: "",
                    isGlobal: true
                },
            ]);
            await windowMemory.clear();
        }
        return res.end();
        // res.status(200).json(response);
    }
    catch (error) {
        return res.status(400).json(error);
    }
}
// Chat over one or more selected files:
async function selectedFilesStartConversation(req, res) {
    const uniqueId = uuidv4();
    const { query, uploadedFileIdz, topicId } = req.body;
    // @ts-ignore
    const userId = req?.userId;
    if (!query || !uploadedFileIdz || !topicId || !userId) {
        return res.sendStatus(400).json({ message: "Invalid Data" });
    }
    let filesIdzStrArr = uploadedFileIdz.toString();
    console.log({
        filesIdzStrArr,
        topicId,
        userId
    });
    const question = sanitizeInput(query);
    const config = getConfig();
    // Using MMR in a vector store retrieve
    const context = await getFilesRelevantDocuments(userId, uploadedFileIdz, question);
    const history = await getFilesHistory(userId, topicId, question, filesIdzStrArr);
    try {
        const response = await chain.call({
            input: question,
            context: context,
            history: history,
            callbacks: CallbackManager.fromHandlers({
                async handleLLMNewToken(token) {
                    res.write(token);
                    console.log({ token });
                },
            }),
            immediate_history: config.useWindowMemory ? windowMemory : '',
        });
        if (response) {
            await addDocumentsToMemoryVectorStore([
                {
                    content: question,
                    metadataType: 'question',
                    qaPairID: uniqueId,
                    userId: userId,
                    topicId: topicId,
                    uploadedFileIds: filesIdzStrArr,
                    isGlobal: false
                },
                {
                    content: response?.response,
                    metadataType: 'answer',
                    qaPairID: uniqueId,
                    userId: userId,
                    topicId: topicId,
                    uploadedFileIds: filesIdzStrArr,
                    isGlobal: false
                },
            ]);
        }
        await windowMemory.clear();
        return res.end();
        // res.status(200).json(response);
    }
    catch (error) {
        console.log("Response Generaton Issue : ", error);
        return res.status(400).json(error);
    }
}
// image url
async function analyzeImage(req, res) {
    const { query, url } = req.body;
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: query },
                        {
                            type: "image_url",
                            image_url: {
                                "url": url
                            },
                        },
                    ],
                },
            ],
            max_tokens: 300,
        });
        console.log(response.choices[0]);
        return res.status(200).json({ content: response.choices[0]['message']['content'] });
    }
    catch (error) {
        console.log("error===", error);
        return res.status(400).json(error);
    }
}
// local image
async function analyzeImageLocalOrUrl(req, res) {
    const { query } = req.body;
    // console.log("body", req.body);
    // console.log("req.files: ", req.files)
    let formattedFiles;
    let files;
    if (req.files) {
        // User has uploaded multiple images
        // @ts-ignore
        files = req.files.map((file) => encodeImage(file.path));
        formattedFiles = files.map((fileBase64) => ({
            type: "image_url",
            image_url: {
                url: `data:image/jpeg;base64,${fileBase64}`
            },
        }));
    }
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: query },
                        // {
                        //     type: "image_url",
                        //     image_url: {
                        //         url: `data:image/jpeg;base64,${base64Image}`
                        //     },
                        // },
                        ...formattedFiles
                    ],
                },
            ],
            max_tokens: 300,
        });
        // console.log(response.choices[0]);
        console.log(response);
        return res.status(200).json({ content: response.choices[0]['message']['content'] });
    }
    catch (error) {
        console.log("error===", error);
        return res.status(400).json(error);
    }
}
// Web Scraping:
async function webScrap(req, res) {
    try {
        // @ts-ignore
        const userId = req?.userId;
        const url = req.body.url;
        const filename = url;
        if (!userId || !url) {
            return res.status(404).json({ message: "Invalid params" });
        }
        const fileResp = await storeFileToDB(filename, userId, true);
        const uploadedFileId = fileResp?.insertedId?.toString();
        console.log("Web Url added successfully uploadedFileId: ", uploadedFileId);
        const vectorStore = await getVectorStore();
        const compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;
        const loader = new RecursiveUrlLoader(url, {
            extractor: compiledConvert,
            maxDepth: 3,
            excludeDirs: [''], // list of urls to exclude
        });
        const documents = await loader.loadAndSplit(new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200
        }));
        await storeData(documents);
        const formattedDocs = documents.map((document) => ({
            ...document,
            metadata: {
                ...document.metadata,
                userId: userId,
                uploadedFileId: uploadedFileId
            }
        }));
        const flattenedDocuments = formattedDocs.reduce((acc, val) => acc.concat(val), []);
        await vectorStore.addDocuments(flattenedDocuments);
        console.log("Documents added into successfully vector store");
        return res.status(200).json({ data: { uploadedFileId }, message: 'Web Url added successfully' });
    }
    catch (error) {
        return res.status(500).json(error);
    }
}
// Function to encode the image
function encodeImage(imagePath) {
    return fs.readFileSync(imagePath, { encoding: 'base64' });
}
export { startConversation, selectedFilesStartConversation, analyzeImage, analyzeImageLocalOrUrl, webScrap, };
//# sourceMappingURL=chatController.js.map