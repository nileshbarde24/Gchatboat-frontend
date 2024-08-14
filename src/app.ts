import express from 'express';
import cors from 'cors'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as path from 'path';
import dotenv from 'dotenv';
import { MongoClient } from "mongodb";
// @ts-ignore
import axios from "axios";
import { connectToDatabase } from "./config/db.js"
// @ts-ignore
import userRoutes from './routes/userRoutes.js'


const client = new MongoClient(process.env.MONGODB_ATLAS_URI || "");
const dbName = "sample_db";

dotenv.config();

const app = express();
app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const buildPath = join(__dirname, 'build');
const uploadsPath = join(__dirname, 'uploads');

const frontendFolderPath: string = path.join(__dirname, '..', 'frontend', 'dist');
console.log("frontendFolderPath: ", frontendFolderPath)


// Serve react app build
app.use(express.static(buildPath));
app.use(express.static(frontendFolderPath));
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadsPath));

// @ts-ignore
app.get('/api/health', async (req, res) => {
    res.send('Server is running!');
});

// @ts-ignore
app.post('/delete-documents', async (req, res) => {
    const collection = client.db(dbName).collection('documents');
    // @ts-ignore
    try {
        const result = await collection.deleteMany({});
        res.status(200).json({ msg: `Deleted ${result.deletedCount} documents from the collection.` });
    } catch (error) {
        res.status(400).json({ error });
    }
})

// @ts-ignore
app.post('/delete-chat-logs', async (req, res) => {
    const collection = client.db(dbName).collection('chat_logs');
    try {
        const result = await collection.deleteMany({});
        res.status(200).json({ msg: `Deleted ${result.deletedCount} chat_logs from the collection.` });
    } catch (error) {
        res.status(400).json({ error });
    }
})

// @ts-ignore
app.post('/delete-search-history', async (req, res) => {
    const collection = client.db(dbName).collection('search_history');
    try {
        const result = await collection.deleteMany({});
        res.status(200).json({ msg: `Deleted ${result.deletedCount} search_history from the collection.` });
    } catch (error) {
        res.status(400).json({ error });
    }
})


app.use('/api', userRoutes);
// @ts-ignore
app.get('/*', (req, res) => {
    // res.sendFile(join(__dirname, 'build', 'index.html'));
    res.sendFile(join(frontendFolderPath, 'index.html'));
});

async function startApp() {
    try {
        await connectToDatabase();
        // The database is now connected and globally accessible
        // Start your main application logic here
    } catch (error) {
        console.error('Error starting the application:', error);
        process.exit(1);
    }
}


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    startApp()
});
