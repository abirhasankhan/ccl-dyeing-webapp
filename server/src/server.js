import express from 'express';
import helmet from 'helmet'; // Security middleware to set various HTTP headers
import morgan from 'morgan'; // Logging middleware
import cookieParser from 'cookie-parser'; // Middleware for parsing cookies
import cors from 'cors'; // Middleware for enabling Cross-Origin Resource Sharing (CORS)
import dotenv from 'dotenv'; // Loads environment variables from .env file
import { connectDB } from './config/db.js'; // Function to connect to the database
import { ApiError } from './utils/apiError.js'; // Custom error handler class
import path from 'path'; // Built-in Node.js module for working with file paths

// Importing route handlers
import {
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

// Load environment variables from .env file
dotenv.config();

// Create an instance of an Express application
const app = express();


// =====================
// Security Middlewares
// =====================
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'", "https://res.cloudinary.com"],
                imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"]
            }
        }
    })
);


// Logging setup - Different formats for production and development
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined')); // Detailed logging format for production
} else {
    app.use(morgan('dev')); // Simpler logging format for development
}


// =====================
// CORS Configuration
// =====================
const corsOptions = {
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Define allowed frontend URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allowed headers
    credentials: true, // Allow cookies and authentication headers
    optionsSuccessStatus: 200
};


const __dirname = path.resolve(); // Get absolute directory path

app.use(cors(corsOptions)); // Enable CORS
app.use(cookieParser()); // Enable cookie parsing


// =====================
// Body Parsing
// =====================
app.use(express.json({ limit: '50kb' })); // Parse incoming JSON requests, limit size
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data


// =====================
// API Routes
// =====================
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
app.use('/api/machines', machinesRoutes);
app.use('/api/dyeing-processes', dyeingProcessRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/payments', paymentRoutes);


// Serve client-side files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/client/dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
    });
}


// =====================
// Error Handling
// =====================
// Handle 404 (Not Found) errors
app.all('*', (req, res, next) => {
    next(new ApiError(404, `Can't find ${req.originalUrl} on this server`));
});


// Global error handler middleware
app.use((err, req, res, next) => {
    console.error("Error occurred:", {
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode || 500,
        additionalInfo: err.errors || [],
    });

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors || [],
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }

    return res.status(err.statusCode || 500).json({
        success: false,
        message: "An unexpected error occurred.",
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});


// =====================
// Database Connection
// =====================
const getDatabaseName = (url) => {
    if (!url) return null;
    const match = url.match(/\/(?!.*\/)([^/?#:@]+)/);
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
// Server Initialization
// =====================
const PORT = process.env.PORT || 5001;
const startServer = async () => {
    initializeDB(); // Connect to the database
    app.listen(PORT, () => {
        console.log(`🟢 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`🔗 API: ${process.env.CLIENT_URL || `http://localhost:${PORT}`}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
        console.log('🛑 SIGTERM received. Closing database connection...');
        await pool.end(); // Close the database connection
        console.log('🟢 Database connection closed');
        process.exit(0);
    });
};


// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('💥 UNHANDLED REJECTION! Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});


startServer(); // Start the server


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

