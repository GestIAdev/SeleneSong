const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:11111111@localhost:5432/dentiagest'
});

pool.query(`
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('inventory', 'data_audit_logs', 'integrity_checks', 'cart_items')
`, async (err, res) => {
  if (err) {
    console.log('❌ ERROR:', err.message);
    process.exit(1);
  } else {
    const tables = res.rows.map(r => r.table_name);
    console.log('📊 TABLES FOUND:', tables.length > 0 ? tables.join(', ') : 'NONE');
    
    if (tables.length === 0) {
      console.log('❌ MISSING REQUIRED TABLES');
      process.exit(1);
    }
    
    // Check row counts
    for (const table of tables) {
      const countRes = await pool.query(`SELECT COUNT(*) as cnt FROM ${table}`);
      console.log(`   - ${table}: ${countRes.rows[0].cnt} rows`);
    }
    
    process.exit(0);
  }
});
