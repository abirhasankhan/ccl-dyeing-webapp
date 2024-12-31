import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js'; // Import the database connection

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

// Start the server
const PORT = process.env.PORT || 5001; // Fallback to port 5001 if PORT is not defined
app.listen(PORT, () => {
    // Connect to the database
    connectDB();

    // Start server after database connection
    console.log(`Server is running at http://localhost:${PORT}`);
});
