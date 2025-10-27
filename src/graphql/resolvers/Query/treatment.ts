import { GraphQLContext } from "../../types.js";


// ============================================================================
// 🩺 TREATMENT V3 QUERIES - VERITAS ENHANCED
// ============================================================================

export const treatmentsV3 = async (
  _: any,
  { patientId, limit = 50, offset = 0 }: any,
  _context: GraphQLContext,
) => {
  try {
    console.log(
      `🔍 TREATMENTS V3 query called with patientId: ${patientId}, limit: ${limit}, offset: ${offset}`,
    );

    // Query real treatments from medical_records table
    let query = `
      SELECT 
        id,
        patient_id as "patientId",
        created_by as "practitionerId",
        procedure_category as "treatmentType",
        diagnosis as description,
        treatment_status as status,
        visit_date as "startDate",
        follow_up_date as "endDate",
        estimated_cost as cost,
        clinical_notes as notes,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM medical_records 
      WHERE is_active = true AND deleted_at IS NULL
    `;
    const params: any[] = [];

    if (patientId) {
      query += " AND patient_id = $1";
      params.push(patientId);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await _context.database.executeQuery(query, params);
    console.log(`🔍 TREATMENTS V3 found ${result.rows.length} treatments`);

    return result.rows || [];
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
    console.log(`🔍 TREATMENT V3 query called with id: ${id}`);
    console.log(`🔍 Context veritas available: ${!!context.veritas}`);

    const result = await context.database.executeQuery(
      "SELECT * FROM treatments WHERE id = $1 AND deleted_at IS NULL",
      [id],
    );

    const treatment = result.rows?.[0] || null;
    console.log(`🔍 TreatmentV3 found: ${!!treatment}`);

    if (treatment) {
      console.log(`🔍 TreatmentV3 data:`, treatment);
      return treatment;
    }

    return null;
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


