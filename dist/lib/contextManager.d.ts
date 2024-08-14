import { Document } from 'langchain/document';
declare function storeData(documents: any): Promise<void>;
/**
 * This function loads and splits a file based on its extension using different loaders and text
 * splitters.
 * @param {string} filePath - A string representing the path to the file that needs to be loaded and
 * split into documents.
 * @returns The function `loadAndSplitFile` returns a Promise that resolves to an array of `Document`
 * objects, where each `Document` represents a split portion of the input file. The type of the
 * `Document` object is `Document<Record<string, unknown>>`, which means it has a generic type
 * parameter that is an object with string keys and unknown values.
 */
declare function loadAndSplitFile(filePath: string): Promise<Document<Record<string, unknown>>[]>;
/**
 * This function loads or creates a vector store using HNSWLib and OpenAIEmbeddings.
 * @returns The function `loadOrCreateVectorStore` returns a Promise that resolves to an instance of
 * the `HNSWLib` class, which is a vector store used for storing and searching high-dimensional
 * vectors.
 */
/**
 * This function loads or creates a new empty Context Vector Store using HNSWLib and OpenAIEmbeddings.
 * @returns a Promise that resolves to an instance of the HNSWLib class, which represents a
 * hierarchical navigable small world graph used for nearest neighbor search. The instance is either
 * loaded from an existing directory or created as a new empty Context Vector Store with specified
 * parameters.
 */
/**
 * This function adds documents to a context vector store and saves them.
 * @param {string[]} filePaths - The `filePaths` parameter is an array of strings representing the file
 * paths of the documents that need to be added to the Context Vector Store.
 * @returns nothing (`undefined`).
 */
/**
 * The function adds a YouTube video transcript to a Context Vector Store.
 * @param {string} URLOrVideoID - The URLOrVideoID parameter is a string that represents either the URL
 * or the video ID of a YouTube video.
 * @returns Nothing is being returned explicitly in the code, but the function is expected to return
 * undefined after completing its execution.
 */
/**
 * The function crawls a given URL, extracts text from the pages, splits the text into documents,
 * generates embeddings for the documents, and saves them to a vector store.
 * @param {string} URL - The URL of the website to crawl and extract text from.
 * @param {string} selector - The selector parameter is a string that represents a CSS selector used to
 * identify the HTML elements to be crawled on the web page. The WebCrawler will only crawl the
 * elements that match the selector.
 * @param {number} maxPages - The maximum number of pages to crawl for the given URL.
 * @param {number} numberOfCharactersRequired - `numberOfCharactersRequired` is a number that specifies
 * the minimum number of characters required for a document to be considered valid and used for
 * generating embeddings. Any document with less than this number of characters will be discarded.
 * @returns Nothing is being returned explicitly in the function, but it is implied that the function
 * will return undefined if there are no errors.
 */
declare function listContextStores(): Promise<void>;
export { listContextStores, loadAndSplitFile, storeData };
