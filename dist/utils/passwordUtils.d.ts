export declare function hashPassword(password: string): Promise<string>;
export declare function comparePassword(password: string, hash: string): Promise<boolean>;
export declare function encryptDbPassword(password: any): string;
export declare function decryptDbPassword(ciphertext: any): string;
