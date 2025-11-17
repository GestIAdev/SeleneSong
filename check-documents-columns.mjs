import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  password: '11111111',
  host: 'localhost',
  port: 5432,
  database: 'dentiagest'
});

const result = await pool.query(`
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name='documents' 
  ORDER BY ordinal_position
`);

console.log('=== DOCUMENTS TABLE COLUMNS ===');
console.log(result.rows.map(r => r.column_name).join(', '));

await pool.end();
