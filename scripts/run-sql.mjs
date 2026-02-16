import pg from 'pg';
import fs from 'fs';
import 'dotenv/config';

const { Client } = pg;

// Construct connection string
// Supabase provides: postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.log('No DATABASE_URL found. Creating tables via API fallback...');
  process.exit(0);
}

async function runSql() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    const sql = fs.readFileSync('./AGENT_SCHEMA.sql', 'utf8');
    await client.query(sql);
    console.log('✅ Schema applied successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

runSql();
