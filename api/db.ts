import { neon } from '@neondatabase/serverless';

const dbUrl = process.env['DATABASE_URL'] || process.env['POSTGRES_URL'] || '';

export const sql = neon(dbUrl);
