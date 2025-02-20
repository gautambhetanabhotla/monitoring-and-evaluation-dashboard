import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const App = express();

const router = express.Router();

App.use('/', router);

App.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

export default router;
