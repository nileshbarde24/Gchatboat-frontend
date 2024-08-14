import fs from 'fs-extra';
import path from 'path';
const ensureLogDirectory = (logDirectory) => {
    fs.ensureDirSync(logDirectory);
};
const getLogFilename = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}.json`;
};
const logChat = async (logDirectory, question, answer) => {
    const timestamp = new Date().toISOString();
    const chatHistory = { timestamp, question, answer };
    const logFilename = getLogFilename();
    const logFilePath = path.join(logDirectory, logFilename);
    ensureLogDirectory(logDirectory);
    if (!fs.existsSync(logFilePath)) {
        await fs.writeJson(logFilePath, [chatHistory]);
    }
    else {
        const chatHistoryArray = await fs.readJson(logFilePath);
        chatHistoryArray.push(chatHistory);
        await fs.writeJson(logFilePath, chatHistoryArray);
    }
};
export default logChat;
//# sourceMappingURL=chatLogger.js.map