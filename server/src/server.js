import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { ApiError } from './utils/apiError.js';

import { 
    authRoutes, 
    clientRoutes, 
    dyeingFinishingPricesRoutes,
    additionalProcessPricesRoutes,
    clientDealsRoutes,
    dyeingFinishingDealsRoutes,
    additionalProcessDealsRoutes
} from './routes/index.js';

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS (optional, configure as needed)
// app.use(cors());

// Middleware for parsing JSON
app.use(express.json());




// Define a basic route
app.get('/', (req, res) => {
    res.send('Server is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/dyeing-finishing-prices', dyeingFinishingPricesRoutes);
app.use('/api/additional-process-prices', additionalProcessPricesRoutes);
app.use('/api/client-deals', clientDealsRoutes);
app.use('/api/dyeing-finishing-deals', dyeingFinishingDealsRoutes);
app.use('/api/additional-process-deals', additionalProcessDealsRoutes);



// Global error handler middleware
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        // Handle ApiError and send appropriate response
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors || [], // Optionally return additional errors
        });
    }

    // For other errors, send a generic message
    return res.status(500).json({
        success: false,
        message: "An unexpected error occurred.",
    });
});


// Connect to the database
(async () => {

    await connectDB();

})();

// Start the server
const PORT = process.env.PORT || 5001; // Fallback to port 5001 if PORT is not defined

app.listen(PORT, () => {

    // Start server after database connection
    console.log(`Server is running at http://localhost:${PORT}`);
});

