// ============================================================================
// 👥 PATIENT MUTATIONS V3 - VERITAS ENHANCED
// ============================================================================

import { GraphQLContext } from "../../types.js";

export const patientMutations = {
  // 🔥 CREATE PATIENT V3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4)
  createPatientV3: async (
    _: any,
    { input }: any,
    { pubsub, database, auditLogger, user, ip }: any,
  ) => {
    console.log("🎯 [PATIENT] createPatientV3 - Creating with FOUR-GATE protection");
    
    try {
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
      
      // Email uniqueness check
      const existingPatients = await database.getPatients({ search: input.email });
      const exactMatch = existingPatients.find(p => p.email === input.email);
      if (exactMatch) {
        throw new Error('Validation failed: email already exists');
      }
      
      console.log("✅ GATE 1 (Verificación) - Input validated");

      // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
      const patient = await database.createPatient(input);
      console.log("✅ GATE 3 (Transacción DB) - Created:", patient.id);

      // ✅ GATE 4: AUDITORÍA - Log to audit trail
      if (auditLogger) {
        await auditLogger.logMutation({
          entityType: 'PatientV3',
          entityId: patient.id,
          operationType: 'CREATE',
          userId: user?.id,
          userEmail: user?.email,
          ipAddress: ip,
          newValues: patient,
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

  // 🔥 UPDATE PATIENT V3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4)
  updatePatientV3: async (
    _: any,
    { id, input }: any,
    { pubsub, database, auditLogger, user, ip }: any,
  ) => {
    console.log("🎯 [PATIENT] updatePatientV3 - Updating with FOUR-GATE protection");
    
    try {
      // ✅ GATE 1: VERIFICACIÓN - Input validation
      if (!id) {
        throw new Error('Validation failed: id is required');
      }
      if (!input || typeof input !== 'object') {
        throw new Error('Invalid input: must be a non-null object');
      }
      
      // Email format validation (if email is being updated)
      if (input.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
          throw new Error('Validation failed: invalid email format');
        }
        
        // Email uniqueness check (exclude current patient)
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
          newValues: patient,
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

  // 🔥 DELETE PATIENT V3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4)
  deletePatientV3: async (
    _: any,
    { id }: any,
    { pubsub, database, auditLogger, user, ip }: any,
  ) => {
    console.log("🎯 [PATIENT] deletePatientV3 - Deleting with FOUR-GATE protection");
    
    try {
      // ✅ GATE 1: VERIFICACIÓN - Input validation
      if (!id) {
        throw new Error('Validation failed: id is required');
      }
      console.log("✅ GATE 1 (Verificación) - Input validated");

      // Capture old values for audit trail
      const oldPatient = await database.getPatientById(id);
      if (!oldPatient) {
        throw new Error(`Patient ${id} not found`);
      }

      // ✅ GATE 3: TRANSACCIÓN DB - Real database operation (soft delete)
      await database.deletePatient(id);
      console.log("✅ GATE 3 (Transacción DB) - Deleted (soft delete):", id);

      // ✅ GATE 4: AUDITORÍA - Log to audit trail
      if (auditLogger) {
        await auditLogger.logMutation({
          entityType: 'PatientV3',
          entityId: id,
          operationType: 'DELETE',
          userId: user?.id,
          userEmail: user?.email,
          ipAddress: ip,
          oldValues: oldPatient,
        });
        console.log("✅ GATE 4 (Auditoría) - Mutation logged");
      }

      // 📡 Publish WebSocket event for real-time subscriptions
      if (pubsub) {
        pubsub.publish("PATIENT_V3_DELETED", {
          patientV3Deleted: id,
        });
      }

      return { success: true, message: "Patient deleted successfully", id };
    } catch (error) {
      console.error("❌ deletePatientV3 error:", error);
      throw new Error(`Failed to delete patient: ${(error as Error).message}`);
    }
  },
};


