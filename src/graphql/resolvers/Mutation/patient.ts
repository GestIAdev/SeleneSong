// ============================================================================
// 👥 PATIENT MUTATIONS V3 - VERITAS ENHANCED + EMPIRE ARCHITECTURE V2
// ============================================================================

import { GraphQLContext } from "../../types.js";
import { requireClinicAccess } from "../../utils/clinicHelpers.js";

export const patientMutations = {
  // 🔥 CREATE PATIENT V3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4) + EMPIRE V2
  createPatientV3: async (
    _: any,
    { input }: any,
    { pubsub, database, auditLogger, user, ip }: any,
  ) => {
    console.log("🎯 [PATIENT] createPatientV3 - Creating with FOUR-GATE protection + EMPIRE V2");
    
    try {
      // 🏛️ EMPIRE V2: GATE 0 - Require clinic access
      const clinicId = requireClinicAccess({ user }, false);
      console.log(`🏛️ Creating patient for clinic: ${clinicId}`);
      
      // ✅ GATE 1: VERIFICACIÓN - Input validation
      if (!input || typeof input !== 'object') {
        throw new Error('Invalid input: must be a non-null object');
      }
      if (!input.firstName) {
        throw new Error('Validation failed: firstName is required');
      }
      if (!input.lastName) {
        throw new Error('Validation failed: lastName is required');
      }
      if (!input.email) {
        throw new Error('Validation failed: email is required');
      }
      
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        throw new Error('Validation failed: invalid email format');
      }
      
      // Email uniqueness check (GLOBAL - patients table has no clinic_id)
      const existingPatients = await database.getPatients({ search: input.email });
      const exactMatch = existingPatients.find(p => p.email === input.email);
      if (exactMatch) {
        throw new Error('Validation failed: email already exists');
      }
      
      console.log("✅ GATE 1 (Verificación) - Input validated");

      // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
      // Step 1: Create patient in GLOBAL table (patients)
      const patient = await database.createPatient(input);
      console.log("✅ GATE 3.1 (Transacción DB) - Patient created:", patient.id);

      // 🏛️ EMPIRE V2: Step 2: Create relationship in patient_clinic_access
      const accessQuery = `
        INSERT INTO patient_clinic_access (patient_id, clinic_id, first_visit_date, is_active)
        VALUES ($1, $2, CURRENT_DATE, TRUE)
        RETURNING *
      `;
      
      await database.executeQuery(accessQuery, [patient.id, clinicId]);
      console.log(`✅ GATE 3.2 (Transacción DB) - Patient linked to clinic ${clinicId}`);

      // ✅ GATE 4: AUDITORÍA - Log to audit trail
      if (auditLogger) {
        await auditLogger.logMutation({
          entityType: 'PatientV3',
          entityId: patient.id,
          operationType: 'CREATE',
          userId: user?.id,
          userEmail: user?.email,
          ipAddress: ip,
          newValues: { ...patient, clinicId }, // Include clinic context in audit
        });
        console.log("✅ GATE 4 (Auditoría) - Mutation logged");
      }

      // 📡 Publish WebSocket event for real-time subscriptions
      if (pubsub) {
        pubsub.publish("PATIENT_V3_CREATED", {
          patientV3Created: patient,
        });
      }

      return patient;
    } catch (error) {
      console.error("❌ createPatientV3 error:", error);
      throw new Error(`Failed to create patient: ${(error as Error).message}`);
    }
  },

  // 🔥 UPDATE PATIENT V3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4) + EMPIRE V2
  updatePatientV3: async (
    _: any,
    { id, input }: any,
    { pubsub, database, auditLogger, user, ip }: any,
  ) => {
    console.log("🎯 [PATIENT] updatePatientV3 - Updating with FOUR-GATE protection + EMPIRE V2");
    
    try {
      // 🏛️ EMPIRE V2: GATE 0 - Require clinic access
      const clinicId = requireClinicAccess({ user }, false);
      console.log(`🏛️ Verifying patient ${id} belongs to clinic ${clinicId}`);
      
      // ✅ GATE 1: VERIFICACIÓN - Input validation
      if (!id) {
        throw new Error('Validation failed: id is required');
      }
      if (!input || typeof input !== 'object') {
        throw new Error('Invalid input: must be a non-null object');
      }
      
      // 🏛️ EMPIRE V2: Verify patient belongs to this clinic via patient_clinic_access
      const accessCheckQuery = `
        SELECT * FROM patient_clinic_access
        WHERE patient_id = $1 AND clinic_id = $2 AND is_active = TRUE
      `;
      const accessResult = await database.executeQuery(accessCheckQuery, [id, clinicId]);
      
      if (accessResult.rows.length === 0) {
        throw new Error('Patient not accessible in your clinic - cannot update');
      }
      console.log(`✅ EMPIRE V2 - Patient belongs to clinic ${clinicId}`);
      
      // Email format validation (if email is being updated)
      if (input.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
          throw new Error('Validation failed: invalid email format');
        }
        
        // Email uniqueness check (exclude current patient) - GLOBAL check
        const existingPatients = await database.getPatients({ search: input.email });
        const exactMatch = existingPatients.find(p => p.email === input.email && p.id !== id);
        if (exactMatch) {
          throw new Error('Validation failed: email already exists');
        }
      }
      
      console.log("✅ GATE 1 (Verificación) - Input validated");

      // Capture old values for audit trail
      const oldPatient = await database.getPatientById(id);
      if (!oldPatient) {
        throw new Error(`Patient ${id} not found`);
      }

      // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
      const patient = await database.updatePatient(id, input);
      console.log("✅ GATE 3 (Transacción DB) - Updated:", patient.id);

      // ✅ GATE 4: AUDITORÍA - Log to audit trail
      if (auditLogger) {
        await auditLogger.logMutation({
          entityType: 'PatientV3',
          entityId: id,
          operationType: 'UPDATE',
          userId: user?.id,
          userEmail: user?.email,
          ipAddress: ip,
          oldValues: oldPatient,
          newValues: { ...patient, clinicId }, // Include clinic context
          changedFields: Object.keys(input),
        });
        console.log("✅ GATE 4 (Auditoría) - Mutation logged");
      }

      // 📡 Publish WebSocket event for real-time subscriptions
      if (pubsub) {
        pubsub.publish("PATIENT_V3_UPDATED", {
          patientV3Updated: patient,
        });
      }

      return patient;
    } catch (error) {
      console.error("❌ updatePatientV3 error:", error);
      throw new Error(`Failed to update patient: ${(error as Error).message}`);
    }
  },

  // 🔥 DELETE PATIENT V3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4) + EMPIRE V2
  deletePatientV3: async (
    _: any,
    { id }: any,
    { pubsub, database, auditLogger, user, ip }: any,
  ) => {
    console.log("🎯 [PATIENT] deletePatientV3 - Deleting with FOUR-GATE protection + EMPIRE V2");
    
    try {
      // 🏛️ EMPIRE V2: GATE 0 - Require clinic access
      const clinicId = requireClinicAccess({ user }, false);
      console.log(`🏛️ Verifying patient ${id} belongs to clinic ${clinicId}`);
      
      // ✅ GATE 1: VERIFICACIÓN - Input validation
      if (!id) {
        throw new Error('Validation failed: id is required');
      }
      
      // 🏛️ EMPIRE V2: Verify patient belongs to this clinic
      const accessCheckQuery = `
        SELECT * FROM patient_clinic_access
        WHERE patient_id = $1 AND clinic_id = $2 AND is_active = TRUE
      `;
      const accessResult = await database.executeQuery(accessCheckQuery, [id, clinicId]);
      
      if (accessResult.rows.length === 0) {
        throw new Error('Patient not accessible in your clinic - cannot delete');
      }
      console.log(`✅ EMPIRE V2 - Patient belongs to clinic ${clinicId}`);
      console.log("✅ GATE 1 (Verificación) - Input validated");

      // Capture old values for audit trail (before deactivation)
      const accessRecord = accessResult.rows[0];
      
      // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
      // 🏛️ EMPIRE V2 - PORTABLE RECORDS™: 
      // ONLY deactivate patient_clinic_access (unlink from THIS clinic)
      // NEVER touch global patients table (patient may exist in other clinics)
      const deactivateQuery = `
        UPDATE patient_clinic_access
        SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
        WHERE patient_id = $1 AND clinic_id = $2
        RETURNING *
      `;
      const deactivateResult = await database.executeQuery(deactivateQuery, [id, clinicId]);
      console.log(`✅ GATE 3 (Transacción DB) - Patient ${id} UNLINKED from clinic ${clinicId}`);
      console.log(`📋 Portable Records™: Patient still exists globally, just invisible to this clinic`);
      
      // 🚨 GDPR NOTE: To permanently delete patient identity (Art. 17 "Right to be Forgotten"),
      // use forgetPatientGDPR() mutation instead (requires patient consent + legal compliance)

      // ✅ GATE 4: AUDITORÍA - Log to audit trail
      if (auditLogger) {
        await auditLogger.logMutation({
          entityType: 'PatientV3',
          entityId: id,
          operationType: 'DELETE',
          userId: user?.id,
          userEmail: user?.email,
          ipAddress: ip,
          oldValues: { 
            patientId: id,
            clinicId: clinicId,
            wasActive: accessRecord.is_active,
            firstVisitDate: accessRecord.first_visit_date,
            action: 'UNLINKED_FROM_CLINIC'
          },
        });
        console.log("✅ GATE 4 (Auditoría) - Mutation logged");
      }

      // 📡 Publish WebSocket event for real-time subscriptions
      if (pubsub) {
        pubsub.publish("PATIENT_V3_DELETED", {
          patientV3Deleted: { 
            id, 
            clinicId,
            action: 'UNLINKED_FROM_CLINIC' 
          },
        });
      }

      return { 
        success: true, 
        message: `Patient ${id} removed from clinic ${clinicId} (still exists globally)`,
        id,
        action: 'UNLINKED_FROM_CLINIC'
      };
    } catch (error) {
      console.error("❌ deletePatientV3 error:", error);
      throw new Error(`Failed to delete patient: ${(error as Error).message}`);
    }
  },
};


