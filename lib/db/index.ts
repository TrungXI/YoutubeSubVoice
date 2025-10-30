import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '@/lib/config';
import * as schema from './schema';

const client = postgres(config.database.url);
export const db = drizzle(client, { schema });

