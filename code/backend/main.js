import https from 'https';
import fs from 'fs';
import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import authRouter from './src/routes/auth.routes.js';
import userRouter from './src/routes/user.routes.js';
import projectRouter from './src/routes/project.routes.js';
import visualisationRouter from './src/routes/visualisation.routes.js';
import kpiRouter from './src/routes/kpi.routes.js';
import documentRouter from './src/routes/document.routes.js';
import taskRouter from './src/routes/task.routes.js';
import successStoryRouter from './src/routes/successStory.routes.js';
import cors from 'cors';
import connectDB from './src/config/connectDB.js';
import process from 'process';

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session Configuration
app.use(
    session({
        secret: process.env.SESSION_SECRET || "supersecretkey",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/session_db',
            collectionName: 'sessions',
        }),
        cookie: {
            secure: false,
            httpOnly: false
        },
    })
);

app.get('/', (_, res) => {
    res.status(200).sendFile('index.html', { root: './public' });
});

app.get('/:anything', (_, res) => {
    res.status(200).sendFile('index.html', { root: './public' });
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/projects', projectRouter);
app.use('/api/visualisation', visualisationRouter);
app.use('/api/kpi', kpiRouter);
app.use('/api/task', taskRouter);
app.use('/api/document', documentRouter);
app.use('/api/success-story', successStoryRouter);

const PORT = process.env.PORT || 5011;

// Load SSL certificate and private key
const sslOptions = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem'),
};

// Create HTTPS server
https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`HTTPS Server is running on https://0.0.0.0:${PORT}`);
});