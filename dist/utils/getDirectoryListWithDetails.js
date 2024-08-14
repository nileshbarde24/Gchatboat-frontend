import fs from 'node:fs/promises';
import path from 'path';
export default async function getDirectoryListWithDetails(directory, contents = {}) {
    const dirents = await fs.readdir(directory, { withFileTypes: true });
    const newContents = { ...contents };
    const files = [];
    const actions = dirents.map(async (dirent) => {
        const res = path.resolve(directory, dirent.name);
        if (dirent.isDirectory()) {
            const subdirContents = await getDirectoryListWithDetails(res, newContents);
            Object.assign(newContents, subdirContents);
        }
        else if (dirent.isFile() && dirent.name !== '.gitignore') {
            const stats = await fs.stat(res);
            files.push({ name: dirent.name, size: Math.ceil(stats.size / 1024) });
        }
    });
    await Promise.all(actions);
    if (files.length) {
        newContents[directory] = files;
    }
    return newContents;
}
//# sourceMappingURL=getDirectoryListWithDetails.js.map