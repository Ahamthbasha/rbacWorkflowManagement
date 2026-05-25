// app.ts
import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cookieParser from 'cookie-parser';
import { getSequelize } from "./config/database";

import userRouter from './routes/userRouter'
import adminRouter from './routes/adminRouter'
import managerRouter from './routes/managerRouter'

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/users',userRouter)
app.use('/managers',managerRouter)
app.use('/admins',adminRouter)

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

// Initialize database in background
(async () => {
    try {
        const sequelize = await getSequelize();
        await sequelize.sync({ alter: false });
        console.log('✅ Models synced with database');
    } catch (error) {
        console.error('❌ Database initialization error:', error);
    }
})();

export default app;