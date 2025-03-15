import express from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import authRouter from './src/routes/auth.routes.js';
import userRouter from './src/routes/user.routes.js';
import projectRouter from './src/routes/project.routes.js';
import visualisationRouter from './src/routes/visualisation.routes.js';
import cors from 'cors';
import connectDB from './src/config/connectDB.js';

dotenv.config();
connectDB(); // Connect to MongoDB

const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 60*60 * 1000, // 1-hour session expiry
        },
    })
);

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/projects', projectRouter);
app.use('/api/visualisation', visualisationRouter);

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
