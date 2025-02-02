import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { ApiError } from './utils/apiError.js';
import jwt from 'jsonwebtoken';
import { verifyToken, authorize, isAdmin } from './middleware/authMiddleware.js';


import {
    adminRoutes,
    usersRoutes,
    clientRoutes, 
    dyeingFinishingPricesRoutes,
    additionalProcessPricesRoutes,
    clientDealsRoutes,
    dyeingFinishingDealsRoutes,
    additionalProcessDealsRoutes,
    dealOrderRoutes,
    shipmentsRoutes,
    productDetailsRoutes,
    returnsRoutes,
    machinesRoutes,
    dyeingProcessRoutes,
    storeRoutes,
    invoicesRoutes,
    paymentRoutes
} from './routes/index.js';

// Load environment variables
dotenv.config();


// Create Express app
const app = express();


// =====================
// Security Middlewares
// =====================
app.use(helmet());
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined')); // Logs in Apache combined format, safer for production
} else {
    app.use(morgan('dev')); // For development, use the dev format
}

// =====================
// CORS Configuration
// =====================
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',  // Your client URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200
};




app.use(cors(corsOptions));
app.use(cookieParser());

// =====================
// Body Parsing
// =====================
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// =====================
// Database Connection
// =====================
const getDatabaseName = (url) => {
    if (!url) return null;
    // Match the database name part
    const match = url.match(/\/([^/?#:@]+)/);
    return match ? match[1] : null;
};


const initializeDB = async () => {
    try {
        await connectDB();
        const dbName = getDatabaseName(process.env.DATABASE_URL);
        console.log(`🟢 Connected to ${dbName} database`);
    } catch (err) {
        console.error('🔴 Database connection failed:', err.message);
        process.exit(1);
    }
};


// =====================
// Authorization Setup
// =====================
const ROLES = {
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    Staff: 'staf',
    USER: 'user'
};


// Route permissions configuration
const routePermissions = {
    '/api/users': [ROLES.ADMIN],
    '/api/machines': [ROLES.ADMIN, ROLES.MODERATOR],
    '/api/invoices': [ROLES.ADMIN, ROLES.MODERATOR],
    '/api/payments': [ROLES.ADMIN],
};




// =====================
// Routes
// =====================
app.get('/', (req, res) => {
    res.send('Server is running');
});

app.use('/api/admin', adminRoutes);

// app.use('/api/users', verifyToken, isAdmin, usersRoutes);

app.use('/api/users', usersRoutes);
// app.use('/api/users/login',  usersRoutes);



app.use('/api/client', clientRoutes);
app.use('/api/dyeing-finishing-prices', dyeingFinishingPricesRoutes);
app.use('/api/additional-process-prices', additionalProcessPricesRoutes);
app.use('/api/client-deals', clientDealsRoutes);
app.use('/api/dyeing-finishing-deals', dyeingFinishingDealsRoutes);
app.use('/api/additional-process-deals', additionalProcessDealsRoutes);
app.use('/api/deal-orders', dealOrderRoutes);
app.use('/api/shipments', shipmentsRoutes);
app.use('/api/product-details', productDetailsRoutes);
app.use('/api/returns', returnsRoutes);
app.use('/api/machines', verifyToken, authorize('admin', 'moderator'), machinesRoutes);
app.use('/api/dyeing-processes', dyeingProcessRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/payments', paymentRoutes);




// =====================
// Error Handling
// =====================
// Handle 404 routes
app.all('*', (req, res, next) => {
    next(new ApiError(404, `Can't find ${req.originalUrl} on this server`));
});

// Global error handler middleware
app.use((err, req, res, next) => {
    // Log the full error to the console for debugging
    console.error("Error occurred:", {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode || 500,
        additionalInfo: err.errors || [],
    });

    if (err instanceof ApiError) {
        // Handle ApiError and send appropriate response
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors || [],
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // Only include stack in dev
        });
    }

    // For other errors, send a generic message
    return res.status(err.statusCode || 500).json({
        success: false,
        message: "An unexpected error occurred.",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});


// =====================
// Server Initialization
// =====================
const PORT = process.env.PORT || 5001;
const startServer = async () => {
    await connectDB();

    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
        console.log(`🟢 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`🔗 API: ${process.env.CLIENT_URL || `http://localhost:${PORT}`}`);
    });

    // Graceful shutdown when receiving SIGTERM signal (e.g., for deployments)
    process.on('SIGTERM', async () => {
        console.log('🛑 SIGTERM received. Closing database connection...');
        await pool.end(); // Closes the pool
        console.log('🟢 Database connection closed');
        process.exit(0); // Exit the process
    });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('💥 UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

startServer();

// // =====================
// // Database Connection
// // =====================
// (async () => {

//     await connectDB();

// })();

// // Start the server
// const PORT = process.env.PORT || 5001; // Fallback to port 5001 if PORT is not defined

// app.listen(PORT, () => {

//     // Start server after database connection
//     console.log(`Server is running at http://localhost:${PORT}`);
// });

