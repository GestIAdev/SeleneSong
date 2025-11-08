// PUNK SCRIPT - Add deleted_at column to appointments table
// For medical software compliance - soft deletes required
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111'
});

async function addDeletedAtColumn() {
  let client;
  try {
    client = await pool.connect();
    console.log('🔌 Connected to PostgreSQL');
    
    // Check if deleted_at column already exists
    const checkDeletedAt = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
      AND column_name = 'deleted_at';
    `;
    
    const checkDeletedAtResult = await client.query(checkDeletedAt);
    
    if (checkDeletedAtResult.rows.length === 0) {
      const alterDeletedAt = 'ALTER TABLE appointments ADD COLUMN deleted_at TIMESTAMP;';
      await client.query(alterDeletedAt);
      console.log('✅ Successfully added deleted_at column to appointments table');
    } else {
      console.log('✅ Column deleted_at already exists');
    }
    
    // Check if type column already exists
    const checkType = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
      AND column_name = 'type';
    `;
    
    const checkTypeResult = await client.query(checkType);
    
    if (checkTypeResult.rows.length === 0) {
      const alterType = "ALTER TABLE appointments ADD COLUMN type VARCHAR(50) DEFAULT 'CONSULTATION';";
      await client.query(alterType);
      console.log('✅ Successfully added type column to appointments table');
    } else {
      console.log('✅ Column type already exists');
    }
    
    console.log('🔥 Soft-delete + Type columns ready - lawyers can rest easy!');
    
  } catch (error) {
    console.error('💥 Error adding deleted_at column:', error.message);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

addDeletedAtColumn()
  .then(() => {
    console.log('🎸 PUNK MIGRATION COMPLETE');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💀 MIGRATION FAILED:', err);
    process.exit(1);
  });
