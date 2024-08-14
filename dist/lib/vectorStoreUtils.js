/**
 * Retrieves relevant context for the given question by performing a similarity search on the provided vector store.
 * @param {HNSWLib} vectorStore - HNSWLib is a library for approximate nearest neighbor search, used to
 * search for similar vectors in a high-dimensional space.
 * @param {string} sanitizedQuestion - The sanitized version of the question that needs to be answered.
 * It is a string input.
 * @param {number} numDocuments - The `numDocuments` parameter is the number of documents that the
 * `getRelevantContext` function should retrieve from the `vectorStore` based on their similarity to
 * the `sanitizedQuestion`.
 * @returns The function `getRelevantContext` is returning a Promise that resolves to a string. The
 * string is the concatenation of the `pageContent` property of the top `numDocuments` documents
 * returned by a similarity search performed on a `vectorStore` using the `sanitizedQuestion` as the
 * query. The resulting string is trimmed and all newline characters are replaced with spaces.
 */
async function getRelevantContext(vectorStore, sanitizedQuestion, numDocuments, userId, filesIdz) {
    const documents = await vectorStore.similaritySearch(sanitizedQuestion, numDocuments, {
        preFilter: {
            "compound": {
                "must": [
                    {
                        "text": {
                            "path": "userId",
                            "query": userId
                        }
                    },
                    {
                        "text": {
                            "path": "uploadedFileIds",
                            "query": filesIdz
                            // "query": "6555a3bd6868a9d3270a3131 6555a44a6868a9d3270a3317 6555a5296868a9d3270a36f0 6555a5a46868a9d3270a387b 6555a4ba6868a9d3270a34fe" // works! file_storage id
                        }
                    },
                ]
            }
        }
    });
    return documents
        .map((doc) => doc.pageContent)
        .join(', ')
        .trim()
        .replaceAll('\n', ' ');
}
// new - with filter:
async function getRelevantContextByUserId(vectorStore, sanitizedQuestion, numDocuments, userId) {
    const documents = await vectorStore.similaritySearch(sanitizedQuestion, numDocuments, {
        preFilter: {
            "compound": {
                "must": [
                    {
                        "text": {
                            "path": "userId",
                            "query": userId
                        }
                    }
                ]
            }
        }
    });
    return documents
        .map((doc) => doc.pageContent)
        .join(', ')
        .trim()
        .replaceAll('\n', ' ');
}
// eslint-disable-next-line import/prefer-default-export
export { getRelevantContext, getRelevantContextByUserId };
//# sourceMappingURL=vectorStoreUtils.js.map