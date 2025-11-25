-- ⚡ MIGRATION: FIX PATIENT REGISTRATION CONSTRAINT
-- ISSUE: check_staff_clinic_id prevents PATIENT registration (clinic_id NULL)
-- SOLUTION: Allow NULL clinic_id for PATIENT role
-- AUTHOR: PunkClaude
-- DATE: 2025-11-24
-- PRIORITY: CRITICAL (BLOCKER for Golden Thread)

-- ═══════════════════════════════════════════════════════════
-- STEP 1: DROP OLD CONSTRAINT
-- ═══════════════════════════════════════════════════════════

ALTER TABLE users 
DROP CONSTRAINT IF EXISTS check_staff_clinic_id;

-- ═══════════════════════════════════════════════════════════
-- STEP 2: ADD NEW CONSTRAINT WITH PATIENT EXCEPTION
-- ═══════════════════════════════════════════════════════════

ALTER TABLE users 
ADD CONSTRAINT check_staff_clinic_id 
CHECK (
  -- PATIENTS: Can have NULL clinic_id (assigned when they book appointment)
  (role = 'PATIENT') 
  OR
  -- OWNERS: Don't need clinic_id initially
  (is_owner = true)
  OR 
  -- STAFF/ADMIN: MUST have clinic_id assigned
  (clinic_id IS NOT NULL)
);

-- ═══════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════

-- Test 1: Verify constraint exists
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'check_staff_clinic_id';

-- Test 2: Count users by role and clinic_id status
SELECT 
  role,
  COUNT(*) AS total,
  SUM(CASE WHEN clinic_id IS NULL THEN 1 ELSE 0 END) AS null_clinic_id,
  SUM(CASE WHEN clinic_id IS NOT NULL THEN 1 ELSE 0 END) AS has_clinic_id
FROM users
GROUP BY role;

-- ═══════════════════════════════════════════════════════════
-- ROLLBACK (if needed)
-- ═══════════════════════════════════════════════════════════

-- To rollback this migration:
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS check_staff_clinic_id;
-- ALTER TABLE users ADD CONSTRAINT check_staff_clinic_id CHECK (((is_owner = true) OR (clinic_id IS NOT NULL)));
