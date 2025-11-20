import { GraphQLContext } from "../../types.js";
import { getClinicIdFromContext } from "../../utils/clinicHelpers.js";

// ============================================================================
// 🩺 TREATMENT QUERIES - LEGACY (for GraphQL migration compatibility)
// ============================================================================

export const treatments = async (
  _: any,
  { patientId, limit = 50, offset = 0 }: any,
  context: GraphQLContext,
) => {
  try {
    // 🏛️ EMPIRE V2: CERO ABSOLUTO - No clinic_id = MASSIVE REVENUE DATA BREACH
    const clinicId = getClinicIdFromContext(context);
    if (!clinicId) {
      console.warn("⚠️ treatments() called WITHOUT clinic_id - CERO ABSOLUTO enforced - returning []");
      console.warn("💰 FINANCIAL INTEGRITY: Preventing cross-clinic revenue data exposure");
      return [];
    }

    console.log(`🔍 treatments() - Filtering by clinic_id: ${clinicId}`);

    // Use specialized TreatmentsDatabase class WITH clinic filter
    const allTreatments = await context.database.treatments.getTreatments({ 
      patientId, 
      clinicId, // 🔥 CRITICAL: Filter by clinic
      limit, 
      offset 
    });
    
    console.log(`🔍 getTreatments returned ${allTreatments.length} treatments for clinic ${clinicId}`);
    if (allTreatments.length > 0) {
      console.log(`🔍 First treatment sample:`, JSON.stringify(allTreatments[0], null, 2));
    }
    return allTreatments;
  } catch (error) {
    console.error("Treatments query error:", error as Error);
    return [];
  }
};

export const treatment = async (
  _: any,
  { id }: any,
  context: GraphQLContext,
) => {
  try {
    // 🏛️ EMPIRE V2: Ownership verification before returning treatment
    const clinicId = getClinicIdFromContext(context);
    if (!clinicId) {
      console.warn(`⚠️ treatment(${id}) called WITHOUT clinic_id - CERO ABSOLUTO - returning null`);
      return null;
    }

    console.log(`🔍 treatment(${id}) - Verifying ownership for clinic ${clinicId}`);

    // Use specialized TreatmentsDatabase class - filter by ID AND clinic_id
    const treatments = await context.database.treatments.getTreatments({ 
      id, 
      clinicId, // 🔥 CRITICAL: Verify ownership
      limit: 1 
    });
    
    const treatment = treatments.length > 0 ? treatments[0] : null;
    
    if (!treatment) {
      console.warn(`⚠️ Treatment ${id} not found or not accessible in clinic ${clinicId}`);
    } else {
      console.log(`✅ Treatment ${id} ownership verified for clinic ${clinicId}`);
    }
    
    return treatment;
  } catch (error) {
    console.error("Treatment query error:", error as Error);
    return null;
  }
};

// ============================================================================
// 🩺 TREATMENT V3 QUERIES - VERITAS ENHANCED
// ============================================================================

export const treatmentsV3 = async (
  _: any,
  { patientId, limit = 50, offset = 0 }: any,
  _context: GraphQLContext,
) => {
  try {
    // 🏛️ EMPIRE V2: CERO ABSOLUTO - Multi-tenant isolation
    const clinicId = getClinicIdFromContext(_context);
    if (!clinicId) {
      console.warn("⚠️ treatmentsV3() called WITHOUT clinic_id - CERO ABSOLUTO enforced - returning []");
      console.warn("💰 FINANCIAL INTEGRITY: Preventing cross-clinic treatment list exposure");
      return [];
    }

    console.log(
      `🔍 TREATMENTS V3 query called - patientId: ${patientId}, clinic: ${clinicId}, limit: ${limit}, offset: ${offset}`,
    );

    // Use specialized TreatmentsDatabase class WITH clinic filter
    return await _context.database.treatments.getTreatments({ 
      patientId, 
      clinicId, // 🔥 CRITICAL: Filter by clinic
      limit, 
      offset 
    });
  } catch (error) {
    console.error("TreatmentsV3 query error:", error as Error);
    return [];
  }
};

export const treatmentV3 = async (
  _: any,
  { id }: any,
  context: GraphQLContext,
  _info: any,
) => {
  try {
    // 🏛️ EMPIRE V2: Ownership verification before returning treatment
    const clinicId = getClinicIdFromContext(context);
    if (!clinicId) {
      console.warn(`⚠️ treatmentV3(${id}) called WITHOUT clinic_id - CERO ABSOLUTO - returning null`);
      return null;
    }

    console.log(`🔍 TREATMENT V3 query called with id: ${id}, verifying clinic: ${clinicId}`);
    console.log(`🔍 Context veritas available: ${!!context.veritas}`);

    // Use specialized TreatmentsDatabase class WITH ownership verification
    const treatments = await context.database.treatments.getTreatments({ 
      id, 
      clinicId, // 🔥 CRITICAL: Verify ownership
      limit: 1 
    });
    
    const treatment = treatments.length > 0 ? treatments[0] : null;
    
    if (!treatment) {
      console.warn(`⚠️ Treatment ${id} not found or not accessible in clinic ${clinicId}`);
    } else {
      console.log(`✅ Treatment ${id} ownership verified for clinic ${clinicId}`);
    }
    
    return treatment;
  } catch (error) {
    console.error("TreatmentV3 query error:", error as Error);
    return null;
  }
};

export const treatmentRecommendationsV3 = async (
  _: any,
  { patientId }: any,
  _context: GraphQLContext,
) => {
  try {
    console.log(
      `🔍 TREATMENT RECOMMENDATIONS V3 query called with patientId: ${patientId}`,
    );

    // Mock AI-generated recommendations - can be enhanced with real AI integration later
    const mockRecommendations = [
      {
        id: "rec-001",
        treatmentType: "CLEANING",
        description:
          "Professional dental cleaning to remove plaque and tartar buildup",
        estimatedCost: 150.0,
        priority: "HIGH",
        reasoning:
          "Patient has not had a cleaning in 8 months. Regular cleanings prevent gum disease.",
        confidence: 0.95,
        recommendedDate: "2024-02-01T10:00:00Z",
      },
      {
        id: "rec-002",
        treatmentType: "FLUORIDE_TREATMENT",
        description:
          "Fluoride application to strengthen tooth enamel and prevent cavities",
        estimatedCost: 75.0,
        priority: "MEDIUM",
        reasoning:
          "Patient shows early signs of enamel weakening. Fluoride can help prevent future cavities.",
        confidence: 0.87,
        recommendedDate: "2024-02-01T10:30:00Z",
      },
      {
        id: "rec-003",
        treatmentType: "XRAY_BITEWING",
        description: "Bitewing X-rays to check for cavities between teeth",
        estimatedCost: 120.0,
        priority: "MEDIUM",
        reasoning:
          "Last X-rays were taken 18 months ago. Regular monitoring is essential for preventive care.",
        confidence: 0.82,
        recommendedDate: "2024-02-15T09:00:00Z",
      },
    ];

    return mockRecommendations;
  } catch (error) {
    console.error("Treatment recommendations V3 error:", error as Error);
    return [];
  }
};


