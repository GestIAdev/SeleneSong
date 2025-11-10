import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

const res = await pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public']);
console.log('ALL TABLES:', res.rows.map(r => r.table_name).join(', '));

await pool.end();
