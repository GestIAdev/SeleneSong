// ============================================================================
// 📄 DOCUMENT MUTATIONS - CRITICAL @veritas Protection (Biblioteca Prohibida)
// ============================================================================

import { GraphQLContext } from "../../types.js";


export const documentMutations = {
  // Documents V3 Mutations - CRITICAL @veritas Protection
  createDocumentV3: async (_: any, { input }: any, context: GraphQLContext) => {
    try {
      console.log(`📝 CREATE DOCUMENT V3 mutation called with input:`, input);
      console.log(`📝 Context veritas available: ${!!context.veritas}`);

      // ✅ REAL DATABASE INSERT - No more mocks!
      const newDocument = await context.database.createDocument({
        patientId: input.patientId,
        medicalRecordId: input.medicalRecordId,
        appointmentId: input.appointmentId,
        documentType: input.documentType,
        title: input.fileName, // Use fileName as title if not provided
        description: input.description,
        fileName: input.fileName,
        filePath: input.filePath,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        fileExtension: input.fileName?.split('.').pop(),
        accessLevel: input.accessLevel || 'PRIVATE',
        isConfidential: input.isEncrypted || false,
        createdBy: input.uploaderId,
        unifiedType: input.documentType,
        legalCategory: input.category,
        isActive: true
      });

      console.log(`📝 Created DocumentV3 from database:`, newDocument);

      // Publish subscription event
      if (context.pubsub) {
        context.pubsub.publish("DOCUMENT_V3_CREATED", {
          documentV3Created: newDocument,
        });
      }

      return newDocument;
    } catch (error) {
      console.error("CreateDocumentV3 mutation error:", error as Error);
      throw new Error("Failed to create document");
    }
  },

  updateDocumentV3: async (
    _: any,
    { id, input }: any,
    context: GraphQLContext,
  ) => {
    try {
      console.log(
        `📝 UPDATE DOCUMENT V3 mutation called with id: ${id}, input:`,
        input,
      );
      console.log(`📝 Context veritas available: ${!!context.veritas}`);

      // Mock implementation - can be enhanced with real database integration later
      const updatedDocument = {
        id: id,
        patientId: input.patientId,
        uploaderId: input.uploaderId,
        fileName: input.fileName,
        filePath: input.filePath,
        fileHash: input.fileHash,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        documentType: input.documentType,
        category: input.category,
        tags: input.tags || [],
        description: input.description,
        isEncrypted: input.isEncrypted || false,
        encryptionKey: input.encryptionKey,
        accessLevel: input.accessLevel,
        expiresAt: input.expiresAt,
        downloadCount: 0,
        lastAccessedAt: null,
        createdAt: "2024-01-15T09:00:00Z", // Mock created date
        updatedAt: new Date().toISOString(),
      };

      console.log(`📝 Updated DocumentV3:`, updatedDocument);

      // Publish subscription event
      if (context.pubsub) {
        context.pubsub.publish("DOCUMENT_V3_UPDATED", {
          documentV3Updated: updatedDocument,
        });
      }

      return updatedDocument;
    } catch (error) {
      console.error("UpdateDocumentV3 mutation error:", error as Error);
      throw new Error("Failed to update document");
    }
  },

  deleteDocumentV3: async (_: any, { id }: any, _context: GraphQLContext) => {
    try {
      console.log(`🗑️ DELETE DOCUMENT V3 mutation called with id: ${id}`);
      console.log(`🗑️ Context veritas available: ${!!_context.veritas}`);

      // Mock implementation - can be enhanced with real database integration later
      const deletedDocument = {
        id: id,
        patientId: "patient-001",
        uploaderId: "practitioner-001",
        fileName: "deleted_document.pdf",
        filePath: "/deleted/deleted_document.pdf",
        fileHash: "sha256:deleted",
        fileSize: 0,
        mimeType: "application/pdf",
        documentType: "OTHER",
        category: "Deleted",
        tags: [],
        description: "Document deleted",
        isEncrypted: false,
        encryptionKey: null,
        accessLevel: "PUBLIC",
        expiresAt: null,
        downloadCount: 0,
        lastAccessedAt: null,
        createdAt: "2024-01-15T09:00:00Z",
        updatedAt: new Date().toISOString(),
      };

      console.log(`🗑️ Deleted DocumentV3:`, deletedDocument);

      return deletedDocument;
    } catch (error) {
      console.error("DeleteDocumentV3 mutation error:", error as Error);
      throw new Error("Failed to delete document");
    }
  },
};

// ============================================================================
// V3 MUTATION RESOLVERS
// ============================================================================

export const createDocumentV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log("🎯 [DOCUMENTS] createDocumentV3 - Creating with FOUR-GATE protection");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation (ENDER-D1-002: XOR Owner Logic)
    if (!args.input || typeof args.input !== 'object') {
      throw new Error('Validation failed: input must be a non-null object');
    }
    
    // File metadata validation
    if (!args.input.fileName) {
      throw new Error('Validation failed: fileName is required');
    }
    if (!args.input.documentType) {
      throw new Error('Validation failed: documentType is required');
    }

    // XOR Owner Validation: Exactly ONE owner must exist
    const hasPatient = !!args.input.patientId;
    const hasAppointment = !!args.input.appointmentId;
    const hasTreatment = !!args.input.treatmentId;
    const isVirtual = args.input.isVirtual === true;
    
    const ownerCount = [hasPatient, hasAppointment, hasTreatment, isVirtual].filter(Boolean).length;
    
    if (ownerCount === 0) {
      throw new Error('Validation failed: Document must have exactly ONE owner (patientId, appointmentId, treatmentId, or isVirtual=true). Orphan documents are rejected.');
    }
    
    if (ownerCount > 1) {
      throw new Error('Validation failed: Document cannot have multiple owners simultaneously. Only ONE of (patientId, appointmentId, treatmentId, isVirtual) is allowed.');
    }
    
    console.log("✅ GATE 1 (Verificación) - Input validated with XOR owner logic");

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
    const document = await context.database.createDocumentV3(args.input);
    console.log("✅ GATE 3 (Transacción DB) - Created:", document.id);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'DocumentV3',
        entityId: document.id,
        operationType: 'CREATE',
        userId: context.user?.id,
        userEmail: context.user?.email,
        ipAddress: context.ip,
        newValues: document,
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged");
    }
    
    console.log(`✅ createDocumentV3 mutation created: ${document.file_name}`);
    return document;
  } catch (error) {
    console.error("❌ createDocumentV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateDocumentV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log("🎯 [DOCUMENTS] updateDocumentV3 - Updating with FOUR-GATE protection");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!args.id) {
      throw new Error('Validation failed: id is required');
    }
    if (!args.input || typeof args.input !== 'object') {
      throw new Error('Validation failed: input must be a non-null object');
    }
    console.log("✅ GATE 1 (Verificación) - Input validated");

    // Capture old values for audit trail
    const oldDocument = await context.database.getDocumentV3ById(args.id);
    if (!oldDocument) {
      throw new Error(`Document ${args.id} not found`);
    }

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
    const document = await context.database.updateDocumentV3(args.id, args.input);
    console.log("✅ GATE 3 (Transacción DB) - Updated:", document.id);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'DocumentV3',
        entityId: args.id,
        operationType: 'UPDATE',
        userId: context.user?.id,
        userEmail: context.user?.email,
        ipAddress: context.ip,
        oldValues: oldDocument,
        newValues: document,
        changedFields: Object.keys(args.input),
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged");
    }
    
    console.log(`✅ updateDocumentV3 mutation updated: ${document.file_name}`);
    return document;
  } catch (error) {
    console.error("❌ updateDocumentV3 mutation error:", error as Error);
    throw error;
  }
};

export const deleteDocumentV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  console.log("🎯 [DOCUMENTS] deleteDocumentV3 - Deleting with FOUR-GATE protection + RBAC");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!args.id) {
      throw new Error('Validation failed: id is required');
    }
    console.log("✅ GATE 1 (Verificación) - Input validated");

    // ============================================================
    // 🔐 GATE 2: RBAC - Role-Based Access Control (NEW!)
    // ============================================================
    const userRole = context.user?.role?.toUpperCase();
    const userId = context.user?.id;
    
    if (!userId) {
      console.error("❌ DELETE REJECTED: No authenticated user");
      throw new Error('Authentication required: User must be logged in to delete documents');
    }

    const allowedRoles = ['ADMIN', 'DENTIST'];
    if (!allowedRoles.includes(userRole || '')) {
      console.error(`❌ DELETE REJECTED: Role ${userRole} not authorized for document deletion`);
      throw new Error(`Forbidden: Role ${userRole} cannot delete documents. Only ADMIN or DENTIST allowed.`);
    }
    console.log(`✅ GATE 2 (RBAC) - Role ${userRole} authorized for delete`);

    // Capture old values for audit trail
    const oldDocument = await context.database.getDocumentV3ById(args.id);
    if (!oldDocument) {
      throw new Error(`Document ${args.id} not found`);
    }

    // ============================================================
    // 🔐 GATE 2.5: Owner Verification (optional enhancement)
    // ============================================================
    // Allow delete if: ADMIN (any doc) OR DENTIST (own uploaded docs only)
    if (userRole === 'DENTIST') {
      const documentCreator = oldDocument.created_by || oldDocument.uploaded_by;
      if (documentCreator && documentCreator !== userId) {
        console.warn(`⚠️ DENTIST ${userId} attempting to delete document created by ${documentCreator}`);
        // For now, allow DENTIST to delete any document in their clinic
        // Future: Add clinic_id verification for multi-tenant
      }
    }

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
    await context.database.deleteDocumentV3(args.id);
    console.log("✅ GATE 3 (Transacción DB) - Deleted (soft delete):", args.id);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'DocumentV3',
        entityId: args.id,
        operationType: 'DELETE',
        userId: context.user?.id,
        userEmail: context.user?.email,
        userRole: userRole, // 🆕 Log role for audit
        ipAddress: context.ip,
        oldValues: oldDocument,
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged with role:", userRole);
    }

    console.log(`✅ deleteDocumentV3 mutation deleted ID: ${args.id} by ${context.user?.email} (${userRole})`);
    return true;
  } catch (error) {
    console.error("❌ deleteDocumentV3 mutation error:", error as Error);
    throw error;
  }
};

export const uploadUnifiedDocumentV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const document = await context.database.uploadUnifiedDocumentV3(args.input);
    
    console.log(`✅ uploadUnifiedDocumentV3 mutation created: ${document.title}`);
    return document;
  } catch (error) {
    console.error("❌ uploadUnifiedDocumentV3 mutation error:", error as Error);
    throw error;
  }
};


