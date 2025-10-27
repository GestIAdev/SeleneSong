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
    let filtered = allRecords;

    if (patientId) {
      filtered = allRecords.filter((_r: any) => _r.patientId === patientId);
    }

    return filtered.slice(offset, offset + limit);
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
  _context: GraphQLContext,
) => {
  try {
    console.log(
      `🔍 MEDICAL RECORDS V3 query called with patientId: ${patientId}, limit: ${limit}, offset: ${offset}`,
    );
    console.log(`🔍 Context veritas available: ${!!_context.veritas}`);

    // Mock data for testing - can be enhanced with real database integration later
    const mockMedicalRecords = [
      {
        id: "mr-001",
        patientId: patientId || "patient-001",
        practitionerId: "practitioner-001",
        recordType: "CONSULTATION",
        title: "Initial Dental Consultation",
        diagnosis: "Multiple dental caries with periodontal involvement",
        treatmentPlan:
          "Comprehensive treatment including fillings, scaling, and root planing",
        allergies: ["Penicillin", "Latex"],
        medications: ["Amoxicillin 500mg", "Ibuprofen 400mg"],
        content:
          "Patient presents with severe dental decay and gum disease. Immediate intervention required.",
        vitalSigns: {
          bloodPressure: "120/80",
          heartRate: 72,
          temperature: 98.6,
          oxygenSaturation: 98,
          weight: 70.5,
          height: 170.0,
          bmi: 24.4,
        },
        attachments: [],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "mr-002",
        patientId: patientId || "patient-001",
        practitionerId: "practitioner-001",
        recordType: "PROCEDURE",
        title: "Root Canal Therapy",
        diagnosis: "Acute pulpitis in tooth #14",
        treatmentPlan: "Root canal therapy followed by crown placement",
        allergies: ["Codeine"],
        medications: ["Hydrocodone 5mg", "Amoxicillin 500mg"],
        content:
          "Patient experiencing severe tooth pain. Radiographic evidence of periapical abscess.",
        vitalSigns: {
          bloodPressure: "118/78",
          heartRate: 68,
          temperature: 98.2,
          oxygenSaturation: 99,
          weight: 68.2,
          height: 168.5,
          bmi: 24.0,
        },
        attachments: ["xray_tooth14.jpg"],
        createdAt: "2024-01-20T14:00:00Z",
        updatedAt: "2024-01-20T14:00:00Z",
      },
    ];

    let filtered = mockMedicalRecords;
    if (patientId) {
      filtered = mockMedicalRecords.filter(
        (_r: any) => _r.patientId === patientId,
      );
    }

    return filtered.slice(offset, offset + limit);
  } catch (error) {
    console.error("MedicalRecordsV3 query error:", error as Error);
    return [];
  }
};

export const medicalRecordV3 = async (
  _: any,
  { id }: any,
  _context: GraphQLContext,
  _info: any,
) => {
  try {
    console.log(`🔍 MEDICAL RECORD V3 query called with id: ${id}`);
    console.log(`🔍 Context veritas available: ${!!_context.veritas}`);

    // Mock data for testing - can be enhanced with real database integration later
    const mockMedicalRecords = [
      {
        id: "mr-001",
        patientId: "patient-001",
        practitionerId: "practitioner-001",
        recordType: "CONSULTATION",
        title: "Initial Dental Consultation",
        diagnosis: "Multiple dental caries with periodontal involvement",
        treatmentPlan:
          "Comprehensive treatment including fillings, scaling, and root planing",
        allergies: ["Penicillin", "Latex"],
        medications: ["Amoxicillin 500mg", "Ibuprofen 400mg"],
        content:
          "Patient presents with severe dental decay and gum disease. Immediate intervention required.",
        vitalSigns: {
          bloodPressure: "120/80",
          heartRate: 72,
          temperature: 98.6,
          oxygenSaturation: 98,
          weight: 70.5,
          height: 170.0,
          bmi: 24.4,
        },
        attachments: [],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "mr-002",
        patientId: "patient-001",
        practitionerId: "practitioner-001",
        recordType: "PROCEDURE",
        title: "Root Canal Therapy",
        diagnosis: "Acute pulpitis in tooth #14",
        treatmentPlan: "Root canal therapy followed by crown placement",
        allergies: ["Codeine"],
        medications: ["Hydrocodone 5mg", "Amoxicillin 500mg"],
        content:
          "Patient experiencing severe tooth pain. Radiographic evidence of periapical abscess.",
        vitalSigns: {
          bloodPressure: "118/78",
          heartRate: 68,
          temperature: 98.2,
          oxygenSaturation: 99,
          weight: 68.2,
          height: 168.5,
          bmi: 24.0,
        },
        attachments: ["xray_tooth14.jpg"],
        createdAt: "2024-01-20T14:00:00Z",
        updatedAt: "2024-01-20T14:00:00Z",
      },
    ];

    const medicalRecord =
      mockMedicalRecords.find((_r: any) => _r.id === id) || null;
    console.log(`🔍 MedicalRecordV3 found: ${!!medicalRecord}`);
    if (medicalRecord) {
      console.log(
        `🔍 MedicalRecordV3 data:`,
        JSON.stringify(medicalRecord, null, 2),
      );
      console.log(`🔍 recordType value: ${medicalRecord.recordType}`);
      console.log(`🔍 title value: ${medicalRecord.title}`);
    }

    if (medicalRecord) {
      console.log(`🔍 MedicalRecordV3 data:`, medicalRecord);
      // Return medical record data - field resolvers will handle @veritas CRITICAL verification
      return medicalRecord;
    }

    return null;
  } catch (error) {
    console.error("MedicalRecordV3 query error:", error as Error);
    return null;
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


