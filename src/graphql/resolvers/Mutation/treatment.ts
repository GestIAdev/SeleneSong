import { deterministicRandom } from "../../../../shared/deterministic-utils.js";


// ============================================================================
// 🩺 TREATMENT V3 MUTATIONS - VERITAS ENHANCED
// ============================================================================

export const createTreatmentV3 = async (
  _: any,
  { input }: any,
) => {
  try {
    console.log("➕ CREATE TREATMENT V3 called with input:", input);

    const treatment = {
      id: `treatment_${Date.now()}`,
      ...input,
      status: input.status || "SCHEDULED",
      aiRecommendations: [],
      veritasScore: 0.95,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("✅ TreatmentV3 created:", treatment.id);
    return treatment;
  } catch (error) {
    console.error("Create treatmentV3 error:", error as Error);
    throw new Error("Failed to create treatmentV3");
  }
};

export const updateTreatmentV3 = async (
  _: any,
  { id, input }: any,
) => {
  try {
    console.log(`✏️ UPDATE TREATMENT V3 called with id: ${id}, input:`, input);

    const treatment = {
      id,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    console.log("✅ TreatmentV3 updated:", treatment.id);
    return treatment;
  } catch (error) {
    console.error("Update treatmentV3 error:", error as Error);
    throw new Error("Failed to update treatmentV3");
  }
};

export const deleteTreatmentV3 = async (
  _: any,
  { id }: any,
) => {
  try {
    console.log(`🗑️ DELETE TREATMENT V3 called with id: ${id}`);

    // In a real implementation, this would delete from database
    console.log("✅ TreatmentV3 deleted:", id);
    return true;
  } catch (error) {
    console.error("Delete treatmentV3 error:", error as Error);
    throw new Error("Failed to delete treatmentV3");
  }
};

export const generateTreatmentPlanV3 = async (
  _: any,
  { patientId, conditions }: any,
) => {
  try {
    console.log(
      `📋 GENERATE TREATMENT PLAN V3 called with patientId: ${patientId}, conditions:`,
      conditions,
    );

    // Helper functions for AI treatment plan generation
    const getTreatmentTypeForCondition = (_condition: string): string => {
      const conditionMap: { [key: string]: string } = {
        cavities: "FILLING",
        gum_disease: "PERIODONTAL_TREATMENT",
        tooth_pain: "ROOT_CANAL",
        missing_tooth: "IMPLANT",
        crooked_teeth: "ORTHODONTICS",
        stains: "WHITENING",
        default: "CLEANING",
      };
      return conditionMap[_condition.toLowerCase()] || conditionMap.default;
    };

    const getDescriptionForCondition = (_condition: string): string => {
      const descriptionMap: { [key: string]: string } = {
        cavities: "Composite filling to restore damaged tooth structure",
        gum_disease: "Deep cleaning and scaling to treat gum inflammation",
        tooth_pain: "Root canal therapy to save infected tooth",
        missing_tooth: "Dental implant to replace missing tooth",
        crooked_teeth: "Orthodontic treatment to align teeth properly",
        stains: "Professional teeth whitening treatment",
        default: "General dental treatment",
      };
      return descriptionMap[_condition.toLowerCase()] || descriptionMap.default;
    };

    const getCostForCondition = (_condition: string): number => {
      const costMap: { [key: string]: number } = {
        cavities: 200,
        gum_disease: 350,
        tooth_pain: 800,
        missing_tooth: 2500,
        crooked_teeth: 3000,
        stains: 400,
        default: 150,
      };
      return costMap[_condition.toLowerCase()] || costMap.default;
    };

    const getPriorityForCondition = (_condition: string): string => {
      const priorityMap: { [key: string]: string } = {
        tooth_pain: "CRITICAL",
        cavities: "HIGH",
        gum_disease: "HIGH",
        missing_tooth: "MEDIUM",
        crooked_teeth: "LOW",
        stains: "LOW",
        default: "MEDIUM",
      };
      return priorityMap[_condition.toLowerCase()] || priorityMap.default;
    };

    // Mock AI-generated treatment plan based on conditions
    const plan = conditions.map((condition: string, index: number) => ({
      id: `plan_${Date.now()}_${index}`,
      patientId,
      treatmentType: getTreatmentTypeForCondition(condition),
      description: getDescriptionForCondition(condition),
      estimatedCost: getCostForCondition(condition),
      priority: getPriorityForCondition(condition),
      reasoning: `AI analysis indicates ${condition} requires immediate attention`,
      confidence: 0.88 + deterministicRandom() * 0.1, // Random confidence between 0.88-0.98
      recommendedDate: new Date(
        Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000,
      ).toISOString(), // Weekly intervals
    }));

    console.log(
      `✅ Treatment plan generated with ${plan.length} recommendations`,
    );
    return plan;
  } catch (error) {
    console.error("Generate treatment plan V3 error:", error as Error);
    throw new Error("Failed to generate treatment plan V3");
  }
};


