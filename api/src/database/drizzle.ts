import 'dotenv/config';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

// Database connection string from environment
const connectionString = process.env.DATABASE_URL!;

// Create postgres connection
const queryClient = postgres(connectionString);

// Create drizzle database instance with schema
export const db = drizzlePg(queryClient, { schema });

// Export types for use in repositories
export type Database = typeof db;
export * from './schema/index.js';
