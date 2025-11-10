// ============================================================================
// 📄 DOCUMENT FIELD RESOLVERS - CRITICAL @veritas Protection (Biblioteca Prohibida)
// ============================================================================

import { GraphQLContext } from "../../types.js";


export const DocumentV3 = {
  // Basic field resolvers for non-veritas fields
  id: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: id called for document ${parent.id}`);
    return parent.id;
  },

  patientId: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: patientId called for document ${parent.id}`,
    );
    return parent.patientId;
  },

  uploaderId: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: uploaderId called for document ${parent.id}`,
    );
    return parent.uploaderId;
  },

  // CRITICAL @veritas protected fields - individual field resolvers
  fileName: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(
      `🔐 FIELD RESOLVER: fileName called for document ${parent.id} - CRITICAL VERIFICATION`,
    );
    try {
      const verification = await _context.veritas.verifyDataIntegrity(
        parent.fileName,
        "document",
        parent.id,
      );
      if (verification.verified) {
        return parent.fileName;
      } else {
        console.error(
          `❌ CRITICAL VERIFICATION FAILED: fileName for document ${parent.id}`,
        );
        throw new Error(
          "CRITICAL_VERIFICATION_FAILED: fileName integrity compromised",
        );
      }
    } catch (error) {
      console.error(`❌ FIELD RESOLVER: fileName verification error:`, error as Error);
      throw new Error(
        "CRITICAL_VERIFICATION_ERROR: fileName verification failed",
      );
    }
  },

  filePath: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(
      `🔐 FIELD RESOLVER: filePath called for document ${parent.id} - CRITICAL VERIFICATION`,
    );
    try {
      const verification = await _context.veritas.verifyDataIntegrity(
        parent.filePath,
        "document",
        parent.id,
      );
      if (verification.verified) {
        return parent.filePath;
      } else {
        console.error(
          `❌ CRITICAL VERIFICATION FAILED: filePath for document ${parent.id}`,
        );
        throw new Error(
          "CRITICAL_VERIFICATION_FAILED: filePath integrity compromised",
        );
      }
    } catch (error) {
      console.error(`❌ FIELD RESOLVER: filePath verification error:`, error as Error);
      throw new Error(
        "CRITICAL_VERIFICATION_ERROR: filePath verification failed",
      );
    }
  },

  fileSize: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: fileSize called for document ${parent.id}`);
    return parent.fileSize;
  },

  mimeType: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: mimeType called for document ${parent.id}`);
    return parent.mimeType;
  },

  documentType: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: documentType called for document ${parent.id}`,
    );
    return parent.documentType;
  },

  category: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: category called for document ${parent.id}`);
    return parent.category;
  },

  tags: async (parent: any, _: any, _context: GraphQLContext, _info: any) => {
    console.log(`🔐 FIELD RESOLVER: tags called for document ${parent.id}`);
    return parent.tags || [];
  },

  description: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: description called for document ${parent.id}`,
    );
    return parent.description;
  },

  isEncrypted: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: isEncrypted called for document ${parent.id}`,
    );
    return parent.isEncrypted;
  },

  encryptionKey: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: encryptionKey called for document ${parent.id}`,
    );
    return parent.encryptionKey;
  },

  accessLevel: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: accessLevel called for document ${parent.id}`,
    );
    return parent.accessLevel;
  },

  expiresAt: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: expiresAt called for document ${parent.id}`,
    );
    return parent.expiresAt;
  },

  downloadCount: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: downloadCount called for document ${parent.id}`,
    );
    return parent.downloadCount;
  },

  lastAccessedAt: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: lastAccessedAt called for document ${parent.id}`,
    );
    return parent.lastAccessedAt;
  },

  createdAt: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: createdAt called for document ${parent.id}`,
    );
    return parent.createdAt;
  },

  updatedAt: async (
    parent: any,
    _: any,
    _context: GraphQLContext,
    _info: any,
  ) => {
    console.log(
      `🔐 FIELD RESOLVER: updatedAt called for document ${parent.id}`,
    );
    return parent.updatedAt;
  },
};


