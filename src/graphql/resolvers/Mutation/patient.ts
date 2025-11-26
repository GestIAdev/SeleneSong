// ============================================================================
// 👥 PATIENT MUTATIONS V3 - VERITAS ENHANCED + EMPIRE ARCHITECTURE V2
// ============================================================================

import { GraphQLContext } from "../../types.js";
import { requireClinicAccess } from "../../utils/clinicHelpers.js";

export const patientMutations = {
  // 🔥 CREATE PATIENT (LEGACY ALIAS) - Calls createPatientV3 internally
  createPatient: async (
    _: any,
    { input }: any,
    context: any,
  ) => {
    console.log("🔄 [PATIENT] createPatient (legacy) - Forwarding to createPatientV3");
    return patientMutations.createPatientV3(_, { input }, context);
  },

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
        await auditLogger.logCreate(
          'PatientV3',           // entityType
          patient.id,            // entityId
          { ...patient, clinicId }, // newValues
          user?.id,              // userId
          user?.email,           // userEmail
          ip                     // ipAddress
        );
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

  // � BLOCKCHAIN: Update patient wallet address
  // Este resolver es especial: el paciente puede actualizar SU PROPIA wallet
  // sin necesidad de pasar por validación de clínica (EMPIRE V2)
  updatePatientWallet: async (
    _: any,
    { walletAddress }: { walletAddress: string },
    { database, user, auditLogger, ip }: any,
  ) => {
    console.log("🔗 [PATIENT] updatePatientWallet - Persisting wallet to DB");
    
    try {
      // ✅ GATE 1: VERIFICACIÓN - User must be authenticated
      if (!user || !user.id) {
        throw new Error('Authentication required');
      }
      
      // Validate wallet address format (0x + 40 hex chars)
      const walletRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!walletRegex.test(walletAddress)) {
        throw new Error('Invalid wallet address format');
      }
      
      // 🎯 Get patient ID from user (patient portal user = patient)
      // El user.patientId viene del token JWT del patient-portal
      const patientId = user.patientId || user.id;
      console.log(`🔗 Updating wallet for patient ${patientId}: ${walletAddress}`);
      
      // ✅ GATE 3: TRANSACCIÓN DB - Direct update
      const result = await database.executeQuery(
        `UPDATE patients 
         SET wallet_address = $1, updated_at = NOW() 
         WHERE id = $2 AND deleted_at IS NULL
         RETURNING *`,
        [walletAddress, patientId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Patient not found');
      }
      
      const patient = result.rows[0];
      console.log(`✅ Wallet updated: ${patient.wallet_address}`);
      
      // ✅ GATE 4: AUDITORÍA
      if (auditLogger) {
        await auditLogger.logUpdate(
          'Patient',
          patientId,
          { walletAddress: null },
          { walletAddress },
          ['walletAddress'],
          user?.id,
          user?.email,
          ip
        );
      }
      
      // Return mapped patient
      return {
        id: patient.id,
        name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unknown',
        firstName: patient.first_name,
        lastName: patient.last_name,
        email: patient.email,
        phone: patient.phone_primary,
        dateOfBirth: patient.date_of_birth,
        walletAddress: patient.wallet_address,
        createdAt: patient.created_at,
        updatedAt: patient.updated_at,
      };
    } catch (error) {
      console.error("❌ updatePatientWallet error:", error);
      throw new Error(`Failed to update wallet: ${(error as Error).message}`);
    }
  },

  // �🔥 UPDATE PATIENT (LEGACY ALIAS) - Calls updatePatientV3 internally
  updatePatient: async (
    _: any,
    { id, input }: any,
    context: any,
  ) => {
    console.log("🔄 [PATIENT] updatePatient (legacy) - Forwarding to updatePatientV3");
    return patientMutations.updatePatientV3(_, { id, input }, context);
  },

  // 🔥 DELETE PATIENT (LEGACY ALIAS) - Returns Boolean per schema definition
  deletePatient: async (
    _: any,
    { id }: any,
    context: any,
  ) => {
    console.log("🔄 [PATIENT] deletePatient (legacy) - Forwarding to deletePatientV3");
    const result = await patientMutations.deletePatientV3(_, { id }, context);
    // Schema expects Boolean!, deletePatientV3 returns { success, message }
    return result?.success ?? true;
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
        await auditLogger.logUpdate(
          'PatientV3',
          id,
          oldPatient,
          { ...patient, clinicId },
          Object.keys(input),
          user?.id,
          user?.email,
          ip
        );
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
        await auditLogger.logSoftDelete(
          'PatientV3',
          id,
          { 
            patientId: id,
            clinicId: clinicId,
            wasActive: accessRecord.is_active,
            firstVisitDate: accessRecord.first_visit_date,
            action: 'UNLINKED_FROM_CLINIC'
          },
          user?.id,
          user?.email,
          ip
        );
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


