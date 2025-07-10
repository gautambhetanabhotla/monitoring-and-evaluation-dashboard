import dotenv from 'dotenv';
dotenv.config();

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Optionally exit: process.exit(1);
});
  
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Optionally exit: process.exit(1);
});

// import https from 'https';
// import fs from 'fs';
import express from 'express';
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

connectDB();

const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(
    session({
        secret: process.env.SESSION_SECRET || "supersecretkey",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/session_db',
            collectionName: 'sessions',
        }),
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

// const sslOptions = {
//     key: fs.readFileSync('./certs/key.pem'),
//     cert: fs.readFileSync('./certs/cert.pem'),
// };

// https.createServer(sslOptions, app).listen(PORT, () => {
//     console.log(`HTTPS Server is running on https://0.0.0.0:${PORT}`);
// });

app.listen(PORT, () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
