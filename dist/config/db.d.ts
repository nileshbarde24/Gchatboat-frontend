import { Db } from 'mongodb';
declare function connectToDatabase(): Promise<Db>;
declare function closeDatabaseConnection(): void;
declare function getDatabase(): Db;
export { connectToDatabase, closeDatabaseConnection, getDatabase };
