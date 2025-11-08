// ============================================================================
// 🩺 MEDICAL RECORDS DOMAIN - QUERY RESOLVERS
// Directiva V185.2 Phase B - Incremental Modular Migration
// ============================================================================

import { GraphQLContext } from "../../types.js";


export const medicalRecords = async (
  _: any,
  { patientId, limit = 50, offset = 0 }: any,
  _context: GraphQLContext,
) => {
  try {
    const allRecords = await _context.database.getMedicalRecords();
    console.log(`🔍 getMedicalRecords returned ${allRecords.length} records`);
    if (allRecords.length > 0) {
      console.log(`🔍 First record sample:`, JSON.stringify(allRecords[0], null, 2));
    }
    
    let filtered = allRecords;

    if (patientId) {
      filtered = allRecords.filter((_r: any) => _r.patientId === patientId);
    }

    const result = filtered.slice(offset, offset + limit);
    console.log(`🔍 Returning ${result.length} records after filter/slice`);
    return result;
  } catch (error) {
    console.error("Medical records query error:", error as Error);
    return [];
  }
};

export const medicalRecord = async (
  _: any,
  { patientId }: any,
  context: GraphQLContext,
  _info: any,
) => {
  try {
    const records = await context.database.getMedicalRecords();
    const record = records.find((_r: any) => _r.patientId === patientId) || null;

    if (record) {
      // Apply Veritas verification for medical records (CRITICAL level)
      return await applyVeritasVerification(
        record,
        "medicalRecord",
        patientId,
        "CRITICAL",
        context,
      );
    }

    return null;
  } catch (error) {
    console.error("Medical record query error:", error as Error);
    return null;
  }
};

export const medicalRecordsV3 = async (
  _: any,
  { patientId, limit = 50, offset = 0 }: any,
  context: GraphQLContext,
) => {
  try {
    const medicalRecords = await context.database.getMedicalRecordsV3({
      patientId,
      limit,
      offset
    });

    console.log(`✅ medicalRecordsV3 query returned ${medicalRecords.length} medical records`);
    return medicalRecords;
  } catch (error) {
    console.error("❌ medicalRecordsV3 query error:", error as Error);
    throw error;
  }
};

export const medicalRecordV3 = async (
  _: any,
  { id }: any,
  context: GraphQLContext,
) => {
  try {
    const medicalRecord = await context.database.getMedicalRecordV3ById(id);
    
    if (!medicalRecord) {
      throw new Error(`Medical record not found: ${id}`);
    }

    console.log(`✅ medicalRecordV3 query returned medical record: ${medicalRecord.title}`);
    return medicalRecord;
  } catch (error) {
    console.error("❌ medicalRecordV3 query error:", error as Error);
    throw error;
  }
};

// Helper function for Veritas verification (imported from main resolvers)
async function applyVeritasVerification(
  obj: any,
  domain: string,
  _id: string,
  level: string,
  _context: GraphQLContext,
): Promise<any> {
  try {
    // Apply Veritas verification based on protection level
    const verification = await _context.veritas.verifyDataIntegrity(
      JSON.stringify(obj),
      domain,
      _id,
    );

    return {
      ...obj,
      _veritas: {
        verified: verification.verified,
        confidence: verification.confidence,
        level: level,
        certificate: verification.certificate?.dataHash,
        verifiedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error(`Veritas verification failed for ${domain}:`, error as Error);
    return {
      ...obj,
      _veritas: {
        verified: false,
        confidence: 0,
        level: level,
        certificate: null,
        error: "Verification failed",
        verifiedAt: new Date().toISOString(),
      },
    };
  }
}


