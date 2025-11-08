// ============================================================================
// 🩺 MEDICAL RECORDS DOMAIN - MUTATION RESOLVERS
// Directiva V185.2 Phase B - Incremental Modular Migration
// ============================================================================

import type { GraphQLContext } from '../../types.js';

export const createMedicalRecordV3 = async (
  _: any,
  { input }: any,
  context: GraphQLContext,
) => {
  try {
    const medicalRecord = await context.database.createMedicalRecordV3(input);
    
    console.log(`✅ createMedicalRecordV3 mutation created: ${medicalRecord.title}`);
    return medicalRecord;
  } catch (error) {
    console.error("❌ createMedicalRecordV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateMedicalRecordV3 = async (
  _: any,
  { id, input }: any,
  context: GraphQLContext,
) => {
  try {
    const medicalRecord = await context.database.updateMedicalRecordV3(id, input);
    
    console.log(`✅ updateMedicalRecordV3 mutation updated: ${medicalRecord.title}`);
    return medicalRecord;
  } catch (error) {
    console.error("❌ updateMedicalRecordV3 mutation error:", error as Error);
    throw error;
  }
};

export const deleteMedicalRecordV3 = async (
  _: any,
  { id }: any,
  context: GraphQLContext,
) => {
  try {
    await context.database.deleteMedicalRecordV3(id);
    
    console.log(`✅ deleteMedicalRecordV3 mutation deleted ID: ${id}`);
    return true;
  } catch (error) {
    console.error("❌ deleteMedicalRecordV3 mutation error:", error as Error);
    throw error;
  }
};


