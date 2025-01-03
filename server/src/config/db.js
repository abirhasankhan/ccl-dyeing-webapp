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
const connectDB = async () => {
    try {
        const result = await pool.query('SELECT version()');
        console.log(`Connected to the database. Version: ${result.rows[0].version}`);
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

export { pool, connectDB };
