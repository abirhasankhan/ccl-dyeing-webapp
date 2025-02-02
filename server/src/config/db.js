import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

// Initialize PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Required for Neon PostgreSQL with SSL
    },
});

// Test the connection
let retryCount = 0;
const maxRetries = 5;

const connectDB = async () => {
    try {
        const result = await pool.query('SELECT version()');
        console.log(`🟢 Connected to the database. Version: ${result.rows[0].version}`);
    } catch (error) {
        if (retryCount < maxRetries) {
            retryCount++;
            console.error(`🔴 Error connecting to the database. Retrying... (${retryCount}/${maxRetries})`);
            setTimeout(connectDB, 5000); // Retry after 5 seconds
        } else {
            console.error('🔴 Failed to connect to the database after multiple attempts');
            process.exit(1); // Exit the process after multiple failed retries
        }
    }
};


export { pool, connectDB };
