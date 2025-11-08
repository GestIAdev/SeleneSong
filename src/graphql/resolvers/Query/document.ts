/**
 * 📄 DOCUMENT QUERY RESOLVERS V3
 * Mission: Provide document queries with @veritas verification
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// QUERY RESOLVERS
// ============================================================================

export const documentsV3 = async (
  _: unknown,
  args: { patientId?: string; limit?: number; offset?: number },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { patientId, limit = 50, offset = 0 } = args;

    const documents = await context.database.getDocumentsV3({
      patientId,
      limit,
      offset
    });

    console.log(`✅ documentsV3 query returned ${documents.length} documents`);
    return documents;
  } catch (error) {
    console.error("❌ documentsV3 query error:", error as Error);
    throw error;
  }
};

export const documentV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const document = await context.database.getDocumentV3ById(args.id);

    if (!document) {
      throw new Error(`Document not found: ${args.id}`);
    }

    console.log(`✅ documentV3 query returned document: ${document.file_name}`);
    return document;
  } catch (error) {
    console.error("❌ documentV3 query error:", error as Error);
    throw error;
  }
};

export const unifiedDocumentsV3 = async (
  _: unknown,
  args: { patientId?: string; limit?: number; offset?: number },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { patientId, limit = 50, offset = 0 } = args;

    const documents = await context.database.getUnifiedDocumentsV3({
      patientId,
      limit,
      offset
    });

    console.log(`✅ unifiedDocumentsV3 query returned ${documents.length} documents`);
    return documents;
  } catch (error) {
    console.error("❌ unifiedDocumentsV3 query error:", error as Error);
    throw error;
  }
};

export const unifiedDocumentV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const document = await context.database.getUnifiedDocumentV3ById(args.id);

    if (!document) {
      throw new Error(`Unified document not found: ${args.id}`);
    }

    console.log(`✅ unifiedDocumentV3 query returned: ${document.title}`);
    return document;
  } catch (error) {
    console.error("❌ unifiedDocumentV3 query error:", error as Error);
    throw error;
  }
};


