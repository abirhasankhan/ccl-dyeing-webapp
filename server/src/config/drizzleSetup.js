import { drizzle } from 'drizzle-orm/node-postgres';
import { pool } from './db.js';

// Create the Drizzle ORM instance
export const db = drizzle(pool);
