import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import { createSchema } from "./models/user.model.js";
import { createClientSchema } from './models/client.model.js';

import authRoutes from './routes/auth.route.js';
import clientRoutes from './routes/client.routes.js';
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

app.use('/auth', authRoutes);
app.use('/clients', clientRoutes);

// Connect to the database
(async () => {
    await connectDB();
    await createSchema(); 
    await createClientSchema();

})();

// Start the server
const PORT = process.env.PORT || 5001; // Fallback to port 5001 if PORT is not defined
app.listen(PORT, () => {

    // Start server after database connection
    console.log(`Server is running at http://localhost:${PORT}`);
});

