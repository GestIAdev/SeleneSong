// ============================================================================
// 👥 PATIENT QUERIES V3 - VERITAS ENHANCED + EMPIRE ARCHITECTURE V2
// ============================================================================

import { GraphQLContext } from "../../types.js";
import { getClinicIdFromContext } from "../../utils/clinicHelpers.js";


export const patientQueries = {
  // Patients - Standard Query (mapped to V3 implementation)
  patients: async (
    _: any,
    { limit = 50, offset = 0 }: any,
    _context: GraphQLContext,
  ) => {
    try {
      console.log(
        `🔍 PATIENTS query called with limit: ${limit}, offset: ${offset}`,
      );

      // 🏛️ EMPIRE V2: THE GREAT FILTER - CERO ABSOLUTO
      const clinicId = getClinicIdFromContext(_context);
      
      if (!clinicId) {
        console.warn('⚠️ PATIENTS query: No clinic_id in context. Owner in lobby mode or unauthorized access. Returning []');
        return []; // REGLA 1: CERO ABSOLUTO - NEVER return all records
      }

      // 🏛️ EMPIRE V2: Query patients via patient_clinic_access (REGLA 3)
      // patients table = GLOBAL (no clinic_id)
      // patient_clinic_access = FILTER by clinic
      const query = `
        SELECT 
          p.id,
          p.first_name as "firstName",
          p.last_name as "lastName", 
          CONCAT(p.first_name, ' ', p.last_name) as name,
          p.email,
          p.phone_primary as phone,
          p.date_of_birth as "dateOfBirth",
          CONCAT_WS(', ', p.address_street, p.address_city, p.address_state, p.address_postal_code, p.address_country) as address,
          p.emergency_contact_name as "emergencyContact",
          p.insurance_provider as "insuranceProvider",
          p.policy_number as "policyNumber",
          p.medical_conditions as "medicalHistory",
          'active' as "billingStatus",
          p.is_active as "isActive",
          p.created_at as "createdAt",
          p.updated_at as "updatedAt",
          pca.first_visit_date as "firstVisitDate",
          pca.medical_record_number as "medicalRecordNumber"
        FROM patients p
        INNER JOIN patient_clinic_access pca ON pca.patient_id = p.id
        WHERE pca.clinic_id = $1 
          AND pca.is_active = TRUE
          AND p.is_active = true 
          AND p.deleted_at IS NULL
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await _context.database.executeQuery(query, [
        clinicId,
        limit,
        offset,
      ]);
      
      console.log(`✅ PATIENTS (clinic ${clinicId}): Found ${result.rows.length} patients`);

      return result.rows;
    } catch (error) {
      console.error("Patients query error:", error as Error);
      return [];
    }
  },

  // Patient - Single patient query by ID
  patient: async (
    _: any,
    { id }: any,
    _context: GraphQLContext,
  ) => {
    try {
      console.log(`🔍 PATIENT query called with id: ${id}`);

      // 🏛️ EMPIRE V2: THE GREAT FILTER
      const clinicId = getClinicIdFromContext(_context);
      
      if (!clinicId) {
        console.warn(`⚠️ PATIENT query: No clinic_id in context. Denying access to patient ${id}`);
        return null; // REGLA 1: CERO ABSOLUTO
      }

      // 🏛️ EMPIRE V2: Verify patient belongs to this clinic via patient_clinic_access
      const query = `
        SELECT 
          p.id,
          p.first_name as "firstName",
          p.last_name as "lastName", 
          CONCAT(p.first_name, ' ', p.last_name) as name,
          p.email,
          p.phone_primary as phone,
          p.date_of_birth as "dateOfBirth",
          CONCAT_WS(', ', p.address_street, p.address_city, p.address_state, p.address_postal_code, p.address_country) as address,
          p.emergency_contact_name as "emergencyContact",
          p.insurance_provider as "insuranceProvider",
          p.policy_number as "policyNumber",
          p.medical_conditions as "medicalHistory",
          'active' as "billingStatus",
          p.is_active as "isActive",
          p.created_at as "createdAt",
          p.updated_at as "updatedAt",
          pca.first_visit_date as "firstVisitDate",
          pca.medical_record_number as "medicalRecordNumber"
        FROM patients p
        INNER JOIN patient_clinic_access pca ON pca.patient_id = p.id
        WHERE p.id = $1 
          AND pca.clinic_id = $2
          AND pca.is_active = TRUE
          AND p.is_active = true 
          AND p.deleted_at IS NULL
      `;

      const result = await _context.database.executeQuery(query, [id, clinicId]);
      
      if (result.rows.length === 0) {
        console.log(`🔍 PATIENT not found or not accessible in clinic ${clinicId}: ${id}`);
        return null;
      }

      console.log(`✅ PATIENT found in clinic ${clinicId}:`, result.rows[0].name);
      return result.rows[0];
    } catch (error) {
      console.error("Patient query error:", error as Error);
      return null;
    }
  },

  // Patients V3 - Veritas Enhanced
  patientsV3: async (
    _: any,
    { limit = 50, offset = 0 }: any,
    context: GraphQLContext,
  ) => {
    try {
      console.log(
        `🔍 PATIENTS V3 query called with limit: ${limit}, offset: ${offset}`,
      );
      console.log(`🔍 Context veritas available: ${!!context.veritas}`);

      // 🏛️ EMPIRE V2: THE GREAT FILTER
      const clinicId = getClinicIdFromContext(context);
      
      if (!clinicId) {
        console.warn('⚠️ PATIENTS V3 query: No clinic_id in context. Returning []');
        return []; // REGLA 1: CERO ABSOLUTO
      }

      // TODO: Update PatientsDatabase class to accept clinicId parameter
      // For now, use direct query with clinic filtering
      const query = `
        SELECT 
          p.id,
          p.first_name as "firstName",
          p.last_name as "lastName", 
          CONCAT(p.first_name, ' ', p.last_name) as name,
          p.email,
          p.phone_primary as phone,
          p.date_of_birth as "dateOfBirth",
          p.is_active as "isActive",
          p.created_at as "createdAt",
          p.updated_at as "updatedAt"
        FROM patients p
        INNER JOIN patient_clinic_access pca ON pca.patient_id = p.id
        WHERE pca.clinic_id = $1 
          AND pca.is_active = TRUE
          AND p.is_active = true 
          AND p.deleted_at IS NULL
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const result = await context.database.executeQuery(query, [
        clinicId,
        limit,
        offset,
      ]);

      console.log(`✅ PATIENTS V3 (clinic ${clinicId}): Found ${result.rows.length} patients`);
      return result.rows;
    } catch (error) {
      console.error("PatientsV3 query error:", error as Error);
      return [];
    }
  },

  patientV3: async (
    _: any,
    { id }: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    try {
      console.log(`🔍 PATIENT V3 query called with id: ${id}`);
      console.log(`🔍 Context veritas available: ${!!_context.veritas}`);

      // 🏛️ EMPIRE V2: THE GREAT FILTER
      const clinicId = getClinicIdFromContext(_context);
      
      if (!clinicId) {
        console.warn(`⚠️ PATIENT V3 query: No clinic_id in context. Denying access to patient ${id}`);
        return null; // REGLA 1: CERO ABSOLUTO
      }

      // Verify patient belongs to this clinic
      const query = `
        SELECT 
          p.id,
          p.first_name as "firstName",
          p.last_name as "lastName", 
          CONCAT(p.first_name, ' ', p.last_name) as name,
          p.email,
          p.phone_primary as phone,
          p.date_of_birth as "dateOfBirth",
          p.is_active as "isActive",
          p.created_at as "createdAt",
          p.updated_at as "updatedAt"
        FROM patients p
        INNER JOIN patient_clinic_access pca ON pca.patient_id = p.id
        WHERE p.id = $1 
          AND pca.clinic_id = $2
          AND pca.is_active = TRUE
          AND p.is_active = true 
          AND p.deleted_at IS NULL
      `;

      const result = await _context.database.executeQuery(query, [id, clinicId]);
      
      if (result.rows.length === 0) {
        console.log(`🔍 PATIENT V3 not found or not accessible in clinic ${clinicId}: ${id}`);
        return null;
      }

      console.log(`✅ PATIENT V3 found in clinic ${clinicId}`);
      return result.rows[0];
    } catch (error) {
      console.error("PatientV3 query error:", error as Error);
      return null;
    }
  },
};
