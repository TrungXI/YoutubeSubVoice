import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { config } from '@/lib/config';

const runMigrate = async () => {
  console.log('⏳ Running migrations...');

  const connection = postgres(config.database.url, { max: 1 });
  const db = drizzle(connection);

  await migrate(db, { migrationsFolder: './drizzle' });

  await connection.end();

  console.log('✅ Migrations completed!');
  process.exit(0);
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed!');
  console.error(err);
  process.exit(1);
});

