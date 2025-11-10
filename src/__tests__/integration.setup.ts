/**
 * Integration Test Setup - Vitest Global Setup
 * Initializes database connection pool for tests
 * 
 * NOTE: Database tables (data_audit_logs, integrity_checks, etc.)
 * are already created by PHASE 1 migrations. This setup only
 * initializes the connection pool.
 */

import { Pool } from 'pg';

console.log('🔥 [SETUP] Integration test environment initialization...');

// Use dentiagest database (tables already exist from PHASE 1)
const TEST_DB_URL = process.env.TEST_DB_URL || 'postgresql://postgres:11111111@localhost:5432/dentiagest';

console.log(`✅ [SETUP] Database URL: ${TEST_DB_URL}`);

// Initialize database pool for tests
const testPool = new Pool({
  connectionString: TEST_DB_URL,
  application_name: 'dentiagest-test'
});

// Store in global for tests to access
globalThis.testPool = testPool;

// Verify database connection
testPool.query('SELECT 1')
  .then(() => {
    console.log('✅ [SETUP] Database connection successful');
    console.log('✅ [SETUP] Tables already exist from PHASE 1');
  })
  .catch((error) => {
    console.error('❌ [SETUP] Database connection failed:', error.message);
    console.error('Make sure PostgreSQL is running and TEST_DB_URL is correct');
    process.exit(1);
  });
