import { deterministicRandom } from "../../../../shared/deterministic-utils.js";
import { GraphQLContext } from "../../types.js";


// ============================================================================
// 🩺 TREATMENT V3 MUTATIONS - VERITAS ENHANCED
// ============================================================================

export const createTreatmentV3 = async (
  _: any,
  { input }: any,
) => {
  try {
    console.log("➕ CREATE TREATMENT V3 called with input:", input);

    // 🛡️ VALIDATION: Cost must be positive
    if (input.cost !== undefined && input.cost <= 0) {
      throw new Error("Cost must be positive");
    }

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
  ctx: GraphQLContext,
) => {
  try {
    console.log(`✏️ UPDATE TREATMENT V3 called with id: ${id}, input:`, input);

    const treatment = {
      id,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    // 🔥 DIRECTIVA 2.4.1: DEDUCCIÓN DE INVENTARIO AL COMPLETAR TRATAMIENTO
    if (input.status === 'COMPLETED' && input.materialsUsed && input.materialsUsed.length > 0) {
      console.log('🔥 DEDUCCIÓN DE INVENTARIO: Procesando materiales...');

      for (const material of input.materialsUsed) {
        try {
          // Obtener el item actual del inventario usando el método correcto
          const currentItem = await ctx.database.inventory.getInventoryV3ById(material.inventoryItemId);

          if (!currentItem) {
            console.error(`Item de inventario no encontrado: ${material.inventoryItemId}`);
            continue;
          }

          // Verificar si hay suficiente stock
          if (currentItem.current_stock < material.quantity) {
            console.warn(`⚠️ Stock insuficiente para ${currentItem.name}: solicitado ${material.quantity}, disponible ${currentItem.current_stock}`);
            // Continuar de todos modos (permitir stock negativo si es necesario)
          }

          // Deducir stock usando el método de ajuste (ajuste negativo para deducción)
          const updatedItem = await ctx.database.inventory.adjustInventoryStockV3(
            material.inventoryItemId,
            -material.quantity, // Ajuste negativo para deducción
            `USED_IN_TREATMENT:${id}`
          );

          // Publicar evento de WebSocket
          ctx.pubsub?.publish('INVENTORY_UPDATED_V3', {
            inventoryUpdatedV3: {
              id: updatedItem.id,
              itemName: updatedItem.name,
              previousStock: currentItem.current_stock,
              newStock: updatedItem.current_stock,
              adjustment: -material.quantity,
              reason: 'USED_IN_TREATMENT',
              treatmentId: id,
              timestamp: new Date().toISOString()
            }
          });

          console.log(`✅ Stock deducido para ${material.inventoryItemId}: ${currentItem.current_stock} → ${updatedItem.current_stock}`);

        } catch (error) {
          console.error(`Error al deducir stock para ${material.inventoryItemId}:`, error);
          // No detener la actualización del tratamiento, solo loggear el error de inventario
        }
      }
    }

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
  _context: GraphQLContext,
) => {
  try {
    console.log(`🗑️ DELETE TREATMENT V3 called with id: ${id}`);
    await _context.database.deleteTreatment(id);
    console.log("✅ TreatmentV3 deleted:", id);
    return { success: true, message: "Treatment deleted successfully" };
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


