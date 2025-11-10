# 🔥 INTEGRATION TESTS: Four-Gate Pattern

## Overview

This directory contains integration tests that verify the **Four-Gate Pattern** implementation against a **real PostgreSQL database**.

### What Gets Tested

- ✅ **GATE 1:** Verification Engine (input validation)
- ✅ **GATE 2:** Business Logic (stock checks, rules)
- ✅ **GATE 3:** Database Transaction (atomic updates)
- ✅ **GATE 4:** Audit Logging (complete trail)

---

## Prerequisites

### 1. PostgreSQL Running
```bash
# Start PostgreSQL (Docker example)
docker run --name postgres-test -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

### 2. Test Database Created
```bash
createdb dentiagest_test -U postgres
```

### 3. Database Schema Initialized
Run the migration scripts to create:
- `inventory` table
- `data_audit_logs` table
- `integrity_checks` table

```bash
# From selene root
psql -U postgres -d dentiagest_test -f migrations/001_initial_schema.sql
psql -U postgres -d dentiagest_test -f migrations/003_audit_infrastructure.sql
```

### 4. Environment Variables Set
```bash
# .env.test (or set in your CI/CD)
TEST_DB_URL=postgresql://postgres:postgres@localhost:5432/dentiagest_test
```

---

## Running Tests

### Run All Integration Tests
```bash
npm run test:integration
```

### Run in Watch Mode
```bash
npm run test:integration:watch
```

### Run Specific Test File
```bash
npx vitest run src/__tests__/integration/inventory.integration.test.ts
```

### Run with Coverage
```bash
npx vitest run --config vitest.integration.config.ts --coverage
```

---

## Test Structure

### inventory.integration.test.ts

**Setup Phase:**
1. Connect to test database
2. Initialize VerificationEngine with 31 rules
3. Initialize AuditLogger
4. Create test inventory item
5. Build GraphQL context

**Tests:**
1. **GATE 1 Verification** - Reject invalid input
2. **GATE 3 DB Transaction** - Successful update
3. **GATE 4 Audit Logging** - Log creation
4. **FULL FLOW** - All four gates
5. **AUDIT TRAIL** - History maintenance
6. **ERROR HANDLING** - Violation logging

**Teardown Phase:**
1. Delete test data
2. Close database connections

---

## Expected Output

### ✅ Successful Test Run
```
✅ GATE 1: Should reject invalid input (verification fails)
✅ GATE 3: Should update database transaction successfully
✅ GATE 4: Should create audit log entry
✅ FULL FLOW: All four gates (Verify -> DB -> Audit) execute successfully
✅ AUDIT TRAIL: Should maintain complete history of updates
✅ ERROR HANDLING: Should log integrity violations

═════════════════════════════════════════════════════════════════
🔥 INTEGRATION TEST RESULTS - FOUR-GATE PATTERN
═════════════════════════════════════════════════════════════════

✅ GATE 1 (VERIFICATION):      Data validation confirmed
✅ GATE 2 (BUSINESS LOGIC):    Business rules applied
✅ GATE 3 (DB TRANSACTION):    Database changes persisted
✅ GATE 4 (AUDIT LOGGING):     Complete audit trail created

📈 RESULTS:
   - All mutations execute successfully
   - All audit logs created with user/IP tracking
   - Before/After values captured
   - Integrity status verified
   - Complete audit history maintained
```

---

## Key Assertions

### GATE 1: Verification
- ❌ Rejects negative quantities
- ❌ Rejects invalid data types
- ❌ Validates required fields
- ✅ Error messages are descriptive

### GATE 3: Database
- ✅ Updates persist to database
- ✅ Correct values stored
- ✅ Timestamps updated
- ✅ No data corruption

### GATE 4: Audit Log
- ✅ `operation` = 'UPDATE'
- ✅ `entity_type` = 'InventoryV3'
- ✅ `entity_id` matches
- ✅ `user_id` is recorded
- ✅ `user_email` is recorded
- ✅ `ip_address` is recorded
- ✅ `old_values` contains before state
- ✅ `new_values` contains after state
- ✅ `changed_fields` lists modified columns
- ✅ `integrity_status` = 'PASSED'
- ✅ `created_at` timestamp is valid

### Full Flow
- ✅ All gates execute without errors
- ✅ Database state is consistent
- ✅ Audit trail is complete
- ✅ No data loss

---

## Troubleshooting

### Database Connection Failed
```
Error: Cannot connect to PostgreSQL

Solution:
1. Check PostgreSQL is running: psql -U postgres
2. Check TEST_DB_URL is correct
3. Check database exists: psql -l | grep dentiagest_test
4. Check schema is initialized
```

### Tests Timeout
```
Error: test timeout (default 30s)

Solution:
1. Increase testTimeout in vitest.integration.config.ts
2. Check database performance
3. Check for network issues
```

### Verification Rules Not Found
```
Error: loadRules() failed - no rules in integrity_checks

Solution:
1. Check 003_audit_infrastructure.sql was applied
2. Verify integrity_checks table exists: \d integrity_checks
3. Check rules are inserted: SELECT COUNT(*) FROM integrity_checks
```

### Audit Log Not Created
```
Error: logResult.rowCount is 0

Solution:
1. Check data_audit_logs table exists
2. Check auditLogger is properly initialized
3. Check GraphQL context has auditLogger injected
4. Enable debug logging: `console.log(log)`
```

---

## Performance Benchmarks

Expected execution time for full test suite:

| Operation | Expected Time |
|-----------|----------------|
| Setup | 500ms |
| Single Mutation | 50-100ms |
| Full Test Suite | 5-10 seconds |

If tests take longer, check database performance.

---

## Continuous Integration

### GitHub Actions Example
```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run test:integration
        env:
          TEST_DB_URL: postgresql://postgres:postgres@localhost/dentiagest_test
```

---

## Notes

- Tests use real database (not mocked)
- Each test creates and cleans its own data
- Tests run in serial mode by default (can enable parallel)
- No external API calls (isolated to database)
- Full audit trail captured for each operation

---

## Contributing

When adding new integration tests:

1. ✅ Follow the Four-Gate Pattern structure
2. ✅ Create test-specific data
3. ✅ Clean up after tests (teardown)
4. ✅ Verify audit logs are created
5. ✅ Document expectations in comments
6. ✅ Use descriptive test names
7. ✅ Log progress with console.log for debugging

---

**Status:** 🔥 Tests Ready for Execution

*Run: `npm run test:integration`*
