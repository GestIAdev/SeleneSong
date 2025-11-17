/**
 * 🔥 INTEGRATION TESTS: Document XOR Owner Validation
 * Tests real database with createDocumentV3 mutation
 * 
 * ENDER-D1-002: Document Hub Deterministic Redesign
 * 
 * XOR LOGIC TESTED:
 * 1. Orphan Rejection: NO owner → Error
 * 2. Multiple Owners Rejection: 2+ owners → Error
 * 3. Single Owner Success (Patient): patientId only → Success
 * 4. Single Owner Success (Virtual): isVirtual only → Success
 * 
 * Gate 1 Validation: Exactly ONE owner (patientId XOR appointmentId XOR treatmentId XOR isVirtual)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';
import { createDocumentV3 } from '../../graphql/resolvers/Mutation/document.js';
import type { GraphQLContext } from '../../graphql/types.js';

interface TestContext {
  pool: Pool;
  context: GraphQLContext;
  testPatientId: string;
  testAppointmentId: string;
  createdDocumentIds: string[];
}

const ctx: TestContext = {
  pool: null!,
  context: null!,
  testPatientId: '',
  testAppointmentId: '',
  createdDocumentIds: []
};

// ============================================================================
// SETUP & TEARDOWN
// ============================================================================

beforeAll(async () => {
  console.log('\n🔥 [SETUP] Document XOR Test - Connecting to database...');

  // Connect to real database
  const dbUrl = 'postgresql://postgres:11111111@localhost:5432/dentiagest';

  ctx.pool = new Pool({
    connectionString: dbUrl,
    application_name: 'dentiagest-xor-test'
  });

  console.log('✅ [SETUP] Database connected');

  // Create test patient
  const patientResult = await ctx.pool.query(
    `INSERT INTO patients (id, first_name, last_name, email, phone_primary, date_of_birth, is_active, created_at, updated_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, NOW(), NOW())
     RETURNING id`,
    ['TEST_XOR', 'PATIENT_' + Date.now(), 'test_xor@test.com', '1234567890', '1990-01-01']
  );

  ctx.testPatientId = patientResult.rows[0].id;
  console.log(`✅ [SETUP] Test patient created: ${ctx.testPatientId}`);

  // Ensure test dentist exists in users table (use PROFESSIONAL role)
  const dentistResult = await ctx.pool.query(
    `INSERT INTO users (
      id, username, email, password_hash, role, 
      first_name, last_name, 
      is_active, is_admin, is_mfa_enabled, 
      created_at, updated_at
    ) VALUES (
      gen_random_uuid(), 
      'test-dentist-xor', 
      'test-dentist-xor@dentiagest.com', 
      'DUMMY_HASH', 
      'PROFESSIONAL', 
      'TEST', 
      'DENTIST_XOR', 
      true, 
      false, 
      false, 
      NOW(), 
      NOW()
    )
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id`
  );

  const testDentistId = dentistResult.rows[0].id;

  // Create test appointment with explicit dentist_id
  const appointmentResult = await ctx.pool.query(
    `INSERT INTO appointments (
      id, patient_id, dentist_id, scheduled_date, duration_minutes, appointment_type, priority, status, title, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), 
      $1, 
      $2,
      NOW() + INTERVAL '1 day', 
      30, 
      'CONSULTATION', 
      'NORMAL', 
      $3::appointmentstatus, 
      $4, 
      NOW(), 
      NOW()
    ) RETURNING id`,
    [ctx.testPatientId, testDentistId, 'SCHEDULED', 'TEST_XOR_APPOINTMENT']
  );

  ctx.testAppointmentId = appointmentResult.rows[0].id;
  console.log(`✅ [SETUP] Test appointment created: ${ctx.testAppointmentId}\n`);

  // Create mock GraphQL context
  ctx.context = {
    database: {
      createDocumentV3: async (input: any) => {
        const result = await ctx.pool.query(
          `INSERT INTO documents (
            filename, original_filename, file_type, file_path, file_size,
            patient_id, document_type, tags,
            created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
          RETURNING *`,
          [
            input.fileName,
            input.fileName, // original_filename = same as filename for test
            input.documentType,
            input.filePath,
            input.fileSize || 1024,
            input.patientId || null,
            input.category || 'medical',
            input.tags || []
          ]
        );
        return result.rows[0];
      }
    },
    user: { id: 'test-user-id', email: 'test@test.com' },
    ip: '127.0.0.1',
    auditLogger: null
  } as any;
});

afterAll(async () => {
  console.log('\n🔥 [TEARDOWN] Cleaning up test data...');

  // Delete created documents
  if (ctx.createdDocumentIds.length > 0) {
    await ctx.pool.query(
      'DELETE FROM documents WHERE id = ANY($1)',
      [ctx.createdDocumentIds]
    );
    console.log(`✅ [TEARDOWN] Deleted ${ctx.createdDocumentIds.length} test documents`);
  }

  // Delete test appointment
  if (ctx.testAppointmentId) {
    await ctx.pool.query('DELETE FROM appointments WHERE id = $1', [ctx.testAppointmentId]);
    console.log('✅ [TEARDOWN] Test appointment deleted');
  }

  // Delete test patient
  if (ctx.testPatientId) {
    await ctx.pool.query('DELETE FROM patients WHERE id = $1', [ctx.testPatientId]);
    console.log('✅ [TEARDOWN] Test patient deleted');
  }

  // Delete test dentist
  await ctx.pool.query("DELETE FROM users WHERE email = 'test-dentist-xor@dentiagest.com'");
  console.log('✅ [TEARDOWN] Test dentist deleted');

  // Close pool
  await ctx.pool.end();
  console.log('✅ [TEARDOWN] Database connection closed\n');
});

// ============================================================================
// TEST SUITE: XOR OWNER VALIDATION
// ============================================================================

describe('🔥 Document XOR Owner Validation (ENDER-D1-002)', () => {
  
  // ==========================================================================
  // TEST 1: ORPHAN REJECTION
  // ==========================================================================
  it('❌ Should REJECT orphan document (no owner)', async () => {
    console.log('\n🧪 [TEST 1] Testing orphan rejection...');

    const input = {
      fileName: 'orphan-test.pdf',
      documentType: 'application/pdf',
      filePath: '/test/orphan.pdf',
      fileSize: 1024,
      category: 'medical',
      tags: ['test']
      // NO owner fields (patientId, appointmentId, treatmentId, isVirtual)
    };

    try {
      await createDocumentV3(null, { input }, ctx.context);
      
      // If we reach here, test FAILED (should have thrown error)
      expect.fail('Expected error for orphan document, but mutation succeeded');
    } catch (error: any) {
      console.log(`✅ [TEST 1] Correctly rejected: ${error.message}`);
      
      // Verify error message contains orphan rejection text
      expect(error.message).toMatch(/orphan/i);
      expect(error.message).toMatch(/exactly ONE owner/i);
    }
  });

  // ==========================================================================
  // TEST 2: MULTIPLE OWNERS REJECTION
  // ==========================================================================
  it('❌ Should REJECT document with multiple owners', async () => {
    console.log('\n🧪 [TEST 2] Testing multiple owners rejection...');

    const input = {
      fileName: 'polygamy-test.pdf',
      documentType: 'application/pdf',
      filePath: '/test/polygamy.pdf',
      fileSize: 1024,
      category: 'medical',
      tags: ['test'],
      patientId: ctx.testPatientId,        // Owner 1
      appointmentId: ctx.testAppointmentId, // Owner 2 (FORBIDDEN!)
    };

    try {
      await createDocumentV3(null, { input }, ctx.context);
      
      // If we reach here, test FAILED
      expect.fail('Expected error for multiple owners, but mutation succeeded');
    } catch (error: any) {
      console.log(`✅ [TEST 2] Correctly rejected: ${error.message}`);
      
      // Verify error message contains multiple owners rejection text
      expect(error.message).toMatch(/multiple owners/i);
      expect(error.message).toMatch(/simultaneously/i);
    }
  });

  // ==========================================================================
  // TEST 3: SUCCESS - PATIENT OWNER
  // ==========================================================================
  it('✅ Should ACCEPT document with patient owner only', async () => {
    console.log('\n🧪 [TEST 3] Testing patient owner success...');

    const input = {
      fileName: 'patient-test.pdf',
      documentType: 'application/pdf',
      filePath: '/test/patient.pdf',
      fileSize: 1024,
      category: 'medical',
      tags: ['test', 'patient'],
      patientId: ctx.testPatientId // ONLY owner
    };

    const document = await createDocumentV3(null, { input }, ctx.context);

    console.log(`✅ [TEST 3] Document created: ${document.id}`);
    ctx.createdDocumentIds.push(document.id);

    // Verify document in database
    const dbResult = await ctx.pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [document.id]
    );

    const dbDoc = dbResult.rows[0];

    // Assert document exists with patient_id
    expect(dbDoc).toBeDefined();
    expect(dbDoc.patient_id).toBe(ctx.testPatientId);
    expect(dbDoc.filename).toBe('patient-test.pdf');

    console.log('✅ [TEST 3] Database validation passed: patient_id correct');
  });

  // ==========================================================================
  // TEST 4: SUCCESS - VIRTUAL OWNER
  // ==========================================================================
  it('✅ Should ACCEPT document with isVirtual=true only', async () => {
    console.log('\n🧪 [TEST 4] Testing virtual owner success...');

    const input = {
      fileName: 'virtual-test.pdf',
      documentType: 'application/pdf',
      filePath: '/test/virtual.pdf',
      fileSize: 1024,
      category: 'administrative',
      tags: ['test', 'clinic'],
      isVirtual: true // ONLY owner (clinic document)
    };

    const document = await createDocumentV3(null, { input }, ctx.context);

    console.log(`✅ [TEST 4] Document created: ${document.id}`);
    ctx.createdDocumentIds.push(document.id);

    // Verify document in database
    const dbResult = await ctx.pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [document.id]
    );

    const dbDoc = dbResult.rows[0];

    // Assert document exists as virtual (no patient_id)
    expect(dbDoc).toBeDefined();
    expect(dbDoc.patient_id).toBeNull();
    expect(dbDoc.filename).toBe('virtual-test.pdf');

    console.log('✅ [TEST 4] Database validation passed: virtual document (no patient_id)');
  });

  // ==========================================================================
  // TEST 5: SUCCESS - APPOINTMENT OWNER
  // ==========================================================================
  it('✅ Should ACCEPT document with appointment owner only', async () => {
    console.log('\n🧪 [TEST 5] Testing appointment owner success...');

    const input = {
      fileName: 'appointment-test.pdf',
      documentType: 'application/pdf',
      filePath: '/test/appointment.pdf',
      fileSize: 1024,
      category: 'medical',
      tags: ['test', 'appointment'],
      appointmentId: ctx.testAppointmentId // ONLY owner
    };

    const document = await createDocumentV3(null, { input }, ctx.context);

    console.log(`✅ [TEST 5] Document created: ${document.id}`);
    ctx.createdDocumentIds.push(document.id);

    // Verify document in database
    const dbResult = await ctx.pool.query(
      'SELECT * FROM documents WHERE id = $1',
      [document.id]
    );

    const dbDoc = dbResult.rows[0];

    // Assert document exists (appointment relationship validated by XOR logic at Gate 1)
    expect(dbDoc).toBeDefined();
    expect(dbDoc.filename).toBe('appointment-test.pdf');

    console.log('✅ [TEST 5] Database validation passed: appointment document created');
  });
});

// ============================================================================
// TEST SUMMARY
// ============================================================================

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🔥 DOCUMENT XOR VALIDATION TEST SUITE (ENDER-D1-002)         ║
╠════════════════════════════════════════════════════════════════╣
║  Test 1: ❌ Orphan Rejection (NO owner)                       ║
║  Test 2: ❌ Multiple Owners Rejection (2+ owners)             ║
║  Test 3: ✅ Patient Owner Success (patientId only)            ║
║  Test 4: ✅ Virtual Owner Success (isVirtual only)            ║
║  Test 5: ✅ Appointment Owner Success (appointmentId only)    ║
╚════════════════════════════════════════════════════════════════╝
`);
