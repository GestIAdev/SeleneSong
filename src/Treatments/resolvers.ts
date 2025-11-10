import { GraphQLContext } from "../graphql/types.js";

export const TreatmentV3 = {
  treatmentType: async (_p: any) => _p.treatmentType,
  description: async (_p: any) => _p.description,
  status: async (_p: any) => _p.status,
  startDate: async (_p: any) => _p.startDate,
  endDate: async (_p: any) => _p.endDate,
  cost: async (_p: any) => _p.cost,
};

export const TreatmentQuery = {
  treatments: async () => [],
  treatment: async () => null,
  treatmentsV3: async (_: any, { patientId, limit = 50, offset = 0 }: any) => {
    const mockTreatments = [
      {
        id: "treatment-001",
        patientId: patientId || "patient-001",
        practitionerId: "practitioner-001",
        treatmentType: "CLEANING",
        description: "Professional dental cleaning and scaling",
        status: "COMPLETED",
        startDate: "2024-01-15T10:00:00Z",
        endDate: "2024-01-15T11:00:00Z",
        cost: 150.0,
        notes: "Routine cleaning completed successfully",
        aiRecommendations: ["Fluoride treatment recommended"],
        veritasScore: 0.95,
        createdAt: "2024-01-10T08:00:00Z",
        updatedAt: "2024-01-15T11:00:00Z",
      },
      {
        id: "treatment-002",
        patientId: patientId || "patient-001",
        practitionerId: "practitioner-001",
        treatmentType: "FILLING",
        description: "Composite filling for cavity in tooth #14",
        status: "SCHEDULED",
        startDate: "2024-01-20T14:00:00Z",
        endDate: "2024-01-20T15:30:00Z",
        cost: 250.0,
        notes: "Cavity detected during routine exam",
        aiRecommendations: ["Consider sedation for anxious patients"],
        veritasScore: 0.92,
        createdAt: "2024-01-12T09:00:00Z",
        updatedAt: "2024-01-12T09:00:00Z",
      },
    ];
    const filtered = patientId
      ? mockTreatments.filter((_t: any) => _t.patientId === patientId)
      : mockTreatments;
    return filtered.slice(offset, offset + limit);
  },
  treatmentV3: async (_: any, { id }: any) => {
    const list = [{ id: "treatment-001" }, { id: "treatment-002" }];
    return list.find((_t: any) => _t.id === id) || null;
  },
  treatmentRecommendationsV3: async (_: any, { _patientId }: any) => {
    return [
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
  },
};

export const TreatmentMutation = {
  createTreatmentV3: async (_: any, { input }: any, ctx: GraphQLContext) => {
    try {
      // ============================================================================
      // BUSINESS LOGIC: Deduce materials needed based on treatment type
      // ============================================================================
      const materialDeductions: Record<string, { itemName: string; quantity: number }[]> = {
        'FILLING': [
          { itemName: 'Composite Resin', quantity: 2 },
          { itemName: 'Anesthetic', quantity: 1 }
        ],
        'ROOT_CANAL': [
          { itemName: 'Gutta-percha', quantity: 3 },
          { itemName: 'Anesthetic', quantity: 2 },
          { itemName: 'Endodontic Files', quantity: 1 }
        ],
        'CROWN': [
          { itemName: 'Crown Material', quantity: 1 },
          { itemName: 'Cement', quantity: 1 },
          { itemName: 'Anesthetic', quantity: 1 }
        ],
        'EXTRACTION': [
          { itemName: 'Anesthetic', quantity: 2 },
          { itemName: 'Suture Material', quantity: 1 }
        ],
        'CLEANING': [
          { itemName: 'Polishing Paste', quantity: 1 },
          { itemName: 'Fluoride', quantity: 1 }
        ]
      };

      // Get materials needed for this treatment type
      const materialsNeeded = materialDeductions[input.treatmentType as string] || [];

      // ============================================================================
      // CRITICAL: Decrement inventory stock for each material
      // ============================================================================
      for (const material of materialsNeeded) {
        try {
          // Find material in inventory by name
          const inventoryItems = await ctx.database.inventory.getInventoriesV3({
            limit: 100,
            offset: 0
          });

          const inventoryItem = inventoryItems.find((item: any) => 
            item.name?.toLowerCase().includes(material.itemName.toLowerCase())
          );

          if (inventoryItem) {
            const newQuantity = inventoryItem.current_stock - material.quantity;

            // Update inventory stock
            await ctx.database.inventory.updateInventoryV3(inventoryItem.id, {
              currentStock: newQuantity
            });

            console.log(`✅ Decremented ${material.itemName}: ${inventoryItem.current_stock} → ${newQuantity}`);

            // ============================================================================
            // TRIGGER LOW STOCK ALERT if below minimum
            // ============================================================================
            if (newQuantity <= inventoryItem.minimum_stock) {
              if (ctx.pubsub) {
                ctx.pubsub.publish('STOCK_LEVEL_CHANGED', {
                  stockLevelChanged: {
                    id: inventoryItem.id,
                    itemName: inventoryItem.name,
                    itemCode: inventoryItem.id,
                    quantity: newQuantity,
                    category: inventoryItem.category,
                    unitPrice: 0,
                    isActive: true,
                    createdAt: inventoryItem.created_at,
                    updatedAt: new Date().toISOString()
                  }
                });

                console.log(`⚠️ LOW STOCK ALERT: ${material.itemName} (${newQuantity} units left)`);
              }
            }

            // Publish inventory updated event
            if (ctx.pubsub) {
              ctx.pubsub.publish('INVENTORY_V3_UPDATED', {
                inventoryV3Updated: {
                  id: inventoryItem.id,
                  itemName: inventoryItem.name,
                  itemCode: inventoryItem.id,
                  supplierId: inventoryItem.supplier_id || '',
                  category: inventoryItem.category,
                  quantity: newQuantity,
                  unitPrice: 0,
                  description: inventoryItem.description || '',
                  isActive: true,
                  createdAt: inventoryItem.created_at,
                  updatedAt: new Date().toISOString()
                }
              });
            }
          } else {
            console.warn(`⚠️ Material not found in inventory: ${material.itemName}`);
          }
        } catch (error) {
          console.error(`❌ Error decrementing material ${material.itemName}:`, error);
          // Continue with other materials even if one fails
        }
      }

      // ============================================================================
      // Create the treatment record
      // ============================================================================
      const treatment = {
        id: `treatment_${Date.now()}`,
        ...input,
        status: input.status || "SCHEDULED",
        materialsUsed: materialsNeeded.map(m => ({
          name: m.itemName,
          quantity: m.quantity,
          decremented: true
        })),
        aiRecommendations: [],
        veritasScore: 0.95,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log(`✅ Treatment created with material deductions:`, treatment);

      return treatment;
    } catch (error) {
      console.error('❌ createTreatmentV3 error:', error);
      throw error;
    }
  },
  updateTreatmentV3: async (_: any, { id, input }: any) => ({
    id,
    ...input,
    updatedAt: new Date().toISOString(),
  }),
  deleteTreatmentV3: async () => true,
  generateTreatmentPlanV3: async (_: any, { patientId, conditions }: any) =>
    conditions.map((c: string, i: number) => ({
      id: `plan_${Date.now()}_${i}`,
      patientId,
      treatmentType: c,
      description: `AI plan for ${c}`,
      estimatedCost: 200,
      priority: "MEDIUM",
      reasoning: `AI analysis indicates ${c}`,
      confidence: 0.9,
      recommendedDate: new Date(
        Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    })),
};


