import type { Config } from 'drizzle-kit';
import { config } from './lib/config';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: config.database.url,
  },
} satisfies Config;

