import fs from 'node:fs/promises';
export default async function createDirectory(directoryPath) {
    if (await fs.stat(directoryPath).catch(() => false)) {
        return;
    }
    await fs.mkdir(directoryPath, { recursive: true });
}
//# sourceMappingURL=createDirectory.js.map