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
  SELECT column_name, data_type, is_nullable, column_default 
  FROM information_schema.columns 
  WHERE table_name='appointments' AND is_nullable='NO'
  ORDER BY ordinal_position
`);

console.log('=== APPOINTMENTS NOT NULL FIELDS ===');
result.rows.forEach(c => {
  console.log(`${c.column_name.padEnd(30)} | ${c.data_type.padEnd(30)} | default=${c.column_default || 'NONE'}`);
});

await pool.end();
