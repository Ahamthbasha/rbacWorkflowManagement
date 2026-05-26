// app.ts
import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import { getSequelize } from "./config/database";

import userRouter from './routes/userRouter'
import adminRouter from './routes/adminRouter'
import managerRouter from './routes/managerRouter'

const app = express();
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

// CORS configuration
const corsOptions = {
    origin: FRONTEND_URL,
    credentials: true, // Allow credentials (cookies)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie', 'Cookie'],
    optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Morgan logging middleware
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/user', userRouter);
app.use('/api/manager', managerRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date(),
        environment: process.env.NODE_ENV || 'development',
        frontendUrl: FRONTEND_URL
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: `Cannot ${req.method} ${req.url}` 
    });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
    console.log(`📝 Logging mode: ${process.env.NODE_ENV === 'production' ? 'Production (combined)' : 'Development (dev)'}`);
    console.log(`🔗 CORS enabled for: ${FRONTEND_URL}`);
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