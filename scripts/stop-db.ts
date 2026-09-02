import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';

const dbDir = path.resolve(process.cwd(), 'data', 'db');

async function stop() {
  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    user: 'postgres',
    password: 'password',
    port: 5432,
    persistent: true,
  });

  try {
    console.log('Stopping PostgreSQL on port 5432...');
    await pg.stop();
    console.log('PostgreSQL stopped.');
  } catch (err) {
    console.error('Error stopping PostgreSQL:', err);
  }
}

stop();
