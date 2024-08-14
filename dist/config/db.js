import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
// MongoDB connection parameters
// const url = 'mongodb+srv://test:test@cluster0.ng1obis.mongodb.net/'; // Change this to your MongoDB server URL
const url = process.env.MONGODB_ATLAS_URI; // Change this to your MongoDB server URL
console.log("CURRENT MongoDB URL ==== ", url);
const dbName = 'sample_db'; // Change this to your database name
// Create a MongoDB client
//@ts-ignore
const client = new MongoClient(url);
let database = null;
// Function to connect to the MongoDB database
async function connectToDatabase() {
    if (!database) {
        try {
            await client.connect();
            console.log('Connected to the database');
            database = client.db(dbName);
            // return client.db(dbName);
        }
        catch (err) {
            console.error('Error connecting to the database:', err);
            throw err;
        }
    }
    return database;
}
// Function to close the MongoDB connection
function closeDatabaseConnection() {
    client.close();
    console.log('Closed the database connection');
}
function getDatabase() {
    if (!database) {
        throw new Error('Database not initialized. Call connectToDatabase first.');
    }
    return database;
}
export { connectToDatabase, closeDatabaseConnection, getDatabase };
//# sourceMappingURL=db.js.map