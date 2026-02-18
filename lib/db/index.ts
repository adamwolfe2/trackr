import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || "postgres://user:pass@host:5432/db";

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
