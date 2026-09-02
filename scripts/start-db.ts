import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';
import fs from 'fs';

const dbDir = path.resolve(process.cwd(), 'data', 'db');

async function start() {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    user: 'postgres',
    password: 'password',
    port: 5432,
    persistent: true,
  });

  try {
    const isInit = fs.existsSync(path.join(dbDir, 'PG_VERSION'));
    if (!isInit) {
      console.log('Initializing PostgreSQL cluster in', dbDir);
      await pg.initialise();
    }
    console.log('Starting PostgreSQL on port 5432...');
    await pg.start();
    console.log('PostgreSQL started successfully on port 5432.');

    // Ensure viewing_coordinator database exists
    const client = pg.getPgClient();
    await client.connect();
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'viewing_coordinator'");
    if (res.rows.length === 0) {
      console.log("Creating database 'viewing_coordinator'...");
      await client.query('CREATE DATABASE viewing_coordinator');
      console.log("Database 'viewing_coordinator' created.");
    } else {
      console.log("Database 'viewing_coordinator' already exists.");
    }
    await client.end();
  } catch (err: any) {
    if (err.message && err.message.includes('already running') || err.message.includes('lock file')) {
      console.log('PostgreSQL is already running.');
    } else {
      console.error('Failed to start PostgreSQL:', err);
      process.exit(1);
    }
  }
}

start();
