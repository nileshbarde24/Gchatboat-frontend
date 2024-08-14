/// <reference types="node" resolution-mode="require"/>
import type { Options } from 'ora';
import type { Writable } from 'stream';
export declare function getProjectRoot(): string;
export declare function getDefaultOraOptions(output: Writable): Options;
export declare function getConfig(): Config;
export declare function setCurrentVectorStoreDatabasePath(currentVectorStoreDatabasePath: string): void;
export declare function setNumContextDocumentsToRetrieve(numContextDocumentsToRetrieve: number): void;
export declare function setNumMemoryDocumentsToRetrieve(numMemoryDocumentsToRetrieve: number): void;
export declare function setUseWindowMemory(useWindowMemory: boolean): void;
