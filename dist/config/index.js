import { fileURLToPath } from 'url';
import path from 'path';
export function getProjectRoot() {
    const currentModulePath = fileURLToPath(import.meta.url);
    const projectRoot = path.resolve(path.dirname(currentModulePath), '..', '..');
    return projectRoot;
}
export function getDefaultOraOptions(output) {
    return {
        text: 'Loading',
        stream: output,
        discardStdin: false,
    };
}
const defaultConfig = {
    currentVectorStoreDatabasePath: path.join(getProjectRoot(), process.env.VECTOR_STORE_DIR || 'db/default'),
    numContextDocumentsToRetrieve: 5,
    numMemoryDocumentsToRetrieve: 2,
    useWindowMemory: false,
};
let config = { ...defaultConfig };
export function getConfig() {
    return config;
}
export function setCurrentVectorStoreDatabasePath(currentVectorStoreDatabasePath) {
    config = { ...config, currentVectorStoreDatabasePath };
}
export function setNumContextDocumentsToRetrieve(numContextDocumentsToRetrieve) {
    config = { ...config, numContextDocumentsToRetrieve };
}
export function setNumMemoryDocumentsToRetrieve(numMemoryDocumentsToRetrieve) {
    config = { ...config, numMemoryDocumentsToRetrieve };
}
export function setUseWindowMemory(useWindowMemory) {
    config = { ...config, useWindowMemory };
}
//# sourceMappingURL=index.js.map