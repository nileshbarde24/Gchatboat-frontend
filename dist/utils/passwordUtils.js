import bcrypt from 'bcrypt';
import CryptoJS from "crypto-js";
// Function to hash a password
export async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}
// Function to compare a password with its hash
export async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "test";
export function encryptDbPassword(password) {
    const ciphertext = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
    return ciphertext;
}
// Decrypt
export function decryptDbPassword(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
}
//# sourceMappingURL=passwordUtils.js.map