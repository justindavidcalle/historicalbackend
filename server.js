import express from 'express';
import cors from 'cors';
import { json } from 'express';
import { connectToDatabase } from './db.js';
import userRouter from './router/user.js';
import studyDataRouter from './router/studyDatadb.js'
import multiplayerRouter from './router/multiplayer.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(json());

connectToDatabase()
    .then(() => {
        app.use('/users', userRouter)
        
        app.use('/studydatas', studyDataRouter)

        app.use('/multiplayer', multiplayerRouter)

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to start server:", error);
    });
