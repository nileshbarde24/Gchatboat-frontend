import express from 'express';
import cors from 'cors';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
// @ts-ignore
import axios from "axios";
import { connectToDatabase } from "./config/db.js"
// @ts-ignore
import userRoutes from './routes/userRoutes.js'
dotenv.config();

const app = express();
app.use(cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const port = 3000;
const PORT = 443;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const buildPath = join(__dirname, 'build');
const uploadsPath = join(__dirname, 'uploads');

// Serve react app build
app.use(express.static(buildPath));
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(uploadsPath));

// @ts-ignore
app.get('/api/health', async (req, res) => {
    res.send('Server is running!');
});


app.use('/api', userRoutes);
// @ts-ignore
app.get('/*', (req, res) => {
    res.sendFile(join(__dirname, 'build', 'index.html'));
});

async function startApp() {
    try {
        await connectToDatabase();
    } catch (error) {
        console.log(error);
        console.error('Error starting the application:', error);
        process.exit(1);
    }
}


const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/ai.generativegeniuses.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/ai.generativegeniuses.com/fullchain.pem')
};

// @ts-ignore
const httpsServer = https.createServer(options, app);

httpsServer.listen(PORT, () => {
    console.log('HTTPS Server running on port 443');
    startApp();
});