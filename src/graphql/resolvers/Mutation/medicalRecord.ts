// ============================================================================
// 🩺 MEDICAL RECORDS DOMAIN - MUTATION RESOLVERS WITH FOUR-GATE PATTERN
// ============================================================================

import type { GraphQLContext } from '../../types.js';

// 🔥 CREATE MEDICAL RECORD V3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4)
export const createMedicalRecordV3 = async (
  _: any,
  { input }: any,
  context: any
) => {
  console.log("🎯 [MEDICAL_RECORDS] createMedicalRecordV3 - Creating with FOUR-GATE protection");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: must be a non-null object');
    }
    if (!input.patientId) {
      throw new Error('Validation failed: patientId is required');
    }
    if (!input.visitDate) {
      throw new Error('Validation failed: visitDate is required');
    }
    console.log("✅ GATE 1 (Verificación) - Input validated");

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
    const medicalRecord = await context.database.createMedicalRecord(input);
    console.log("✅ GATE 3 (Transacción DB) - Created:", medicalRecord.id);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'MedicalRecordV3',
        entityId: medicalRecord.id,
        operationType: 'CREATE',
        userId: context.user?.id,
        userEmail: context.user?.email,
        ipAddress: context.ip,
        newValues: medicalRecord,
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged");
    }

    // 📡 Publish WebSocket event for real-time subscriptions
    if (context.pubsub) {
      context.pubsub.publish("MEDICAL_RECORD_V3_CREATED", {
        medicalRecordV3Created: medicalRecord,
      });
    }

    return medicalRecord;
  } catch (error) {
    console.error("❌ createMedicalRecordV3 error:", error);
    throw new Error(`Failed to create medical record: ${(error as Error).message}`);
  }
};

// 🔥 UPDATE MEDICAL RECORD V3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4)
export const updateMedicalRecordV3 = async (
  _: any,
  { id, input }: any,
  context: any
) => {
  console.log("🎯 [MEDICAL_RECORDS] updateMedicalRecordV3 - Updating with FOUR-GATE protection");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!id) {
      throw new Error('Validation failed: id is required');
    }
    if (!input || typeof input !== 'object') {
      throw new Error('Invalid input: must be a non-null object');
    }
    console.log("✅ GATE 1 (Verificación) - Input validated");

    // Capture old values for audit trail
    const oldMedicalRecord = await context.database.getMedicalRecord(id);
    if (!oldMedicalRecord) {
      throw new Error(`Medical record ${id} not found`);
    }

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
    const medicalRecord = await context.database.updateMedicalRecord(id, input);
    console.log("✅ GATE 3 (Transacción DB) - Updated:", medicalRecord.id);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'MedicalRecordV3',
        entityId: id,
        operationType: 'UPDATE',
        userId: context.user?.id,
        userEmail: context.user?.email,
        ipAddress: context.ip,
        oldValues: oldMedicalRecord,
        newValues: medicalRecord,
        changedFields: Object.keys(input),
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged");
    }

    // 📡 Publish WebSocket event for real-time subscriptions
    if (context.pubsub) {
      context.pubsub.publish("MEDICAL_RECORD_V3_UPDATED", {
        medicalRecordV3Updated: medicalRecord,
      });
    }

    return medicalRecord;
  } catch (error) {
    console.error("❌ updateMedicalRecordV3 error:", error);
    throw new Error(`Failed to update medical record: ${(error as Error).message}`);
  }
};

// 🔥 DELETE MEDICAL RECORD V3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4)
export const deleteMedicalRecordV3 = async (
  _: any,
  { id }: any,
  context: any
) => {
  console.log("🎯 [MEDICAL_RECORDS] deleteMedicalRecordV3 - Deleting with FOUR-GATE protection");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!id) {
      throw new Error('Validation failed: id is required');
    }
    console.log("✅ GATE 1 (Verificación) - Input validated");

    // Capture old values for audit trail
    const oldMedicalRecord = await context.database.getMedicalRecord(id);
    if (!oldMedicalRecord) {
      throw new Error(`Medical record ${id} not found`);
    }

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation (soft delete)
    await context.database.deleteMedicalRecord(id);
    console.log("✅ GATE 3 (Transacción DB) - Deleted (soft delete):", id);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'MedicalRecordV3',
        entityId: id,
        operationType: 'DELETE',
        userId: context.user?.id,
        userEmail: context.user?.email,
        ipAddress: context.ip,
        oldValues: oldMedicalRecord,
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged");
    }

    // 📡 Publish WebSocket event for real-time subscriptions
    if (context.pubsub) {
      context.pubsub.publish("MEDICAL_RECORD_V3_DELETED", {
        medicalRecordV3Deleted: id,
      });
    }

    return { success: true, message: "Medical record deleted successfully", id };
  } catch (error) {
    console.error("❌ deleteMedicalRecordV3 error:", error);
    throw new Error(`Failed to delete medical record: ${(error as Error).message}`);
  }
};


