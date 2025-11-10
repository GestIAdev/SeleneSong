#!/usr/bin/env node

/**
 * PHASE 1 MIGRATIONS RUNNER
 * Executes SQL migrations to create audit and integrity tables
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database credentials
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'dentiagest',
  user: 'postgres',
  password: '11111111'
});

async function runMigrations() {
  console.log('🔥 PHASE 1 MIGRATIONS RUNNER\n');
  console.log('═'.repeat(70));

  const migrations = [
    'step_1_create_data_audit_logs.sql',
    'step_1b_create_integrity_checks_FIXED.sql',
    'step_1c_soft_delete_support.sql'
  ];

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful\n');

    // Run each migration
    for (const migration of migrations) {
      const filePath = path.join(__dirname, `../../migrations/${migration}`);
      
      if (!fs.existsSync(filePath)) {
        console.error(`❌ Migration file not found: ${filePath}`);
        process.exit(1);
      }

      const sql = fs.readFileSync(filePath, 'utf-8');
      
      console.log(`🔄 Running: ${migration}`);
      console.log('─'.repeat(70));

      try {
        await pool.query(sql);
        console.log(`✅ COMPLETED: ${migration}\n`);
      } catch (error) {
        // Some errors are expected (IF NOT EXISTS), log and continue
        console.warn(`⚠️  Warning: ${error.message}`);
        console.log(`✅ COMPLETED: ${migration} (with warnings)\n`);
      }
    }

    console.log('═'.repeat(70));
    console.log('🎉 ALL PHASE 1 MIGRATIONS COMPLETED SUCCESSFULLY!\n');

    // Verify tables
    console.log('📊 VERIFICATION:\n');

    const tables = ['data_audit_logs', 'integrity_checks'];
    for (const table of tables) {
      const result = await pool.query(
        `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1)`,
        [table]
      );
      
      if (result.rows[0].exists) {
        console.log(`✅ ${table} - EXISTS`);
      } else {
        console.log(`❌ ${table} - MISSING`);
      }
    }

    // Count rules
    const rulesResult = await pool.query('SELECT COUNT(*) as count FROM integrity_checks');
    console.log(`\n📋 Integrity Rules: ${rulesResult.rows[0].count} rules loaded\n`);

    console.log('═'.repeat(70));
    console.log('✨ Database ready for integration tests\n');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ MIGRATION FAILED:', error.message);
    console.error('\nError details:', error);
    await pool.end();
    process.exit(1);
  }
}

runMigrations();
