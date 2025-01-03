import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import { 
    authRoutes, 
    clientRoutes, 
    dyeingFinishingPricesRoutes 
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

