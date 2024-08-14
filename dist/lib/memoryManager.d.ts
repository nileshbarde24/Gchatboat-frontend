import { HNSWLib } from 'langchain/vectorstores/hnswlib';
import { BufferWindowMemory } from 'langchain/memory';
declare function getMemoryVectorStore(): Promise<HNSWLib>;
declare function getBufferWindowMemory(): BufferWindowMemory;
declare function addDocumentsToMemoryVectorStore(documents: Array<{
    content: string;
    metadataType: string;
}>): Promise<void>;
declare function resetBufferWindowMemory(): void;
declare function resetMemoryVectorStore(onReset: (newMemoryVectorStore: HNSWLib) => void): Promise<void>;
declare function setMemoryVectorStore(newMemoryVectorStore: HNSWLib): void;
export { getMemoryVectorStore, setMemoryVectorStore, addDocumentsToMemoryVectorStore, resetMemoryVectorStore, getBufferWindowMemory, resetBufferWindowMemory, };
