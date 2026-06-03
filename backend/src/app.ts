import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';
import { getSequelize } from "./config/database";
import errorHandler from './middlewares/errorHandler';

import userRouter from './routes/userRouter';
import adminRouter from './routes/adminRouter';
import managerRouter from './routes/managerRouter';
import AdminAuthController from './controllers/adminControllers/adminAuthController';
import { runMigrations } from './scripts/runMigrations';

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

const corsOptions = {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie', 'Cookie'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

if (NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/user', userRouter);
app.use('/api/manager', managerRouter);
app.use('/api/admin', adminRouter);

app.use(errorHandler)

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date(),
        environment: NODE_ENV,
        frontendUrl: FRONTEND_URL,
        database: 'connected'
    });
});

app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: `Cannot ${req.method} ${req.url}` 
    });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(NODE_ENV === 'development' && { stack: err.stack })
    });
});

const initializeDatabase = async (retries = 5, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Initializing database (attempt ${i + 1}/${retries})...`);
            
            // Get sequelize connection
            const sequelize = await getSequelize();
            
            // Run migrations in production
            if (NODE_ENV === 'production') {
                console.log('Running database migrations in production...');
                await runMigrations();
                console.log('Migrations completed successfully');
            } else if (NODE_ENV === 'development') {
                console.log('Running database migrations in development...');
                await runMigrations();
                console.log('Migrations completed successfully');
            }
            
            console.log('Database connected and ready');
            
            await AdminAuthController.initializeAdmin();
            console.log('Admin user initialized');
            
            return true;
        } catch (error) {
            console.error(`Database initialization attempt ${i + 1} failed:`, error);
            
            if (i < retries - 1) {
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error('All database initialization attempts failed');
                
                return false;
            }
        }
    }
    return false;
};

const startServer = async () => {
    try {
        // Initialize database (don't block server startup)
        initializeDatabase().then(success => {
            if (success) {
                console.log('Database ready for requests');
            } else {
                console.warn('Database initialization failed - some endpoints may not work');
            }
        });
        
        // Start listening immediately
        const server = app.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
            console.log(`Environment: ${NODE_ENV}`);
            console.log(`CORS enabled for: ${FRONTEND_URL}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
        });
        
        // Graceful shutdown
        const gracefulShutdown = async () => {
            console.log('Received shutdown signal, closing gracefully...');
            server.close(async () => {
                console.log('HTTP server closed');
                try {
                    const sequelize = await getSequelize();
                    await sequelize.close();
                    console.log('Database connection closed');
                    process.exit(0);
                } catch (error) {
                    console.error('Error closing database:', error);
                    process.exit(1);
                }
            });
            
            // Force close after 10 seconds
            setTimeout(() => {
                console.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };
        
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;