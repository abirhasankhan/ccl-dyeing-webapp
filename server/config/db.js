import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL);

// Database connection function
const connectDB = async () => {
    try {
        // Check the database connection by querying the version
        const result = await sql`SELECT version()`;
        const { version } = result[0];
        console.log(`Connected to the database. Version: ${version}`);
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
};

export { connectDB };
