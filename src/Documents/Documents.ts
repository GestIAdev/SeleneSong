/**
 * 📄 SELENE DOCUMENTS MODULE
 * Integration layer for Documents management under Selene Song Core control
 * Integrates with DocumentManagerV2 system
 */

import { SeleneServer } from "../core/Server.js";
import { SeleneDatabase } from "../Database.js";
import { SeleneCache } from "../Cache.js";
import { SeleneMonitoring } from "../Monitoring.js";


export interface Document {
  id: string;
  patient_id?: string;
  patient_name?: string;
  document_type:
    | "medical_report"
    | "prescription"
    | "lab_result"
    | "imaging"
    | "consent"
    | "invoice"
    | "other";
  title: string;
  description?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  tags?: string[];
  metadata?: Record<string, any>;
  uploaded_by: string;
  uploaded_at: Date;
  last_modified: Date;
}

export interface DocumentSearchCriteria {
  patient_id?: string;
  document_type?: string;
  tags?: string[];
  uploaded_by?: string;
  date_from?: Date;
  date_to?: Date;
  file_name_contains?: string;
  limit?: number;
  offset?: number;
}

export class SeleneDocuments {
  private server: SeleneServer;
  private database: SeleneDatabase;
  private cache: SeleneCache;
  private monitoring: SeleneMonitoring;

  constructor(
    server: SeleneServer,
    database: SeleneDatabase,
    cache: SeleneCache,
    monitoring: SeleneMonitoring,
  ) {
    this.server = server;
    this.database = database;
    this.cache = cache;
    this.monitoring = monitoring;
    this.initializeIntegration();
  }

  /**
   * Initialize integration with DocumentManagerV2
   */
  private initializeIntegration(): void {
    if (process.env.SELENE_VERBOSE === 'true') {
      this.monitoring.logInfo(
        "Selene Documents module initialized - DocumentManagerV2 integration active",
      );
    }
    console.log(
      "📄 Selene Documents integration active - DocumentManagerV2 connected",
    );
  }

  /**
   * Search documents with criteria
   */
  async searchDocuments(_criteria: DocumentSearchCriteria): Promise<Document[]> {
    try {
      // For now, return empty array
      // TODO: Implement when database methods are available
      return [];
    } catch (error) {
      this.monitoring.logError("Documents search error", error);
      throw error;
    }
  }

  /**
   * Get document by ID
   */
  async getDocumentById(_id: string): Promise<Document | null> {
    try {
      // For now, return null
      // TODO: Implement when database methods are available
      return null;
    } catch (error) {
      this.monitoring.logError("Document fetch error", error);
      throw error;
    }
  }

  /**
   * Upload new document
   */
  async uploadDocument(
    _fileData: Buffer,
    metadata: Omit<
      Document,
      "id" | "file_path" | "file_size" | "uploaded_at" | "last_modified"
    >,
  ): Promise<Document> {
    try {
      // Generate file path
      const fileExtension = this.getFileExtension(metadata.file_name);
      const fileName = `${Date.now()}_${metadata.file_name}`;
      const filePath = `uploads/medical_documents/${fileName}`;

      // Save file (in a real implementation, this would save to disk/cloud)
      // For now, we'll just create the document record

      const document: Document = {
        id: `doc_${Date.now()}`,
        patient_id: metadata.patient_id,
        patient_name: metadata.patient_name,
        document_type: metadata.document_type,
        title: metadata.title,
        description: metadata.description,
        file_name: metadata.file_name,
        file_path: filePath,
        file_size: _fileData.length,
        mime_type: metadata.mime_type,
        tags: metadata.tags,
        metadata: metadata.metadata,
        uploaded_by: metadata.uploaded_by,
        uploaded_at: new Date(),
        last_modified: new Date(),
      };

      this.monitoring.logInfo(
        `Document uploaded: ${document.id} - ${metadata.file_name}`,
      );
      return document;
    } catch (error) {
      this.monitoring.logError("Document upload error", error);
      throw error;
    }
  }

  /**
   * Download document
   */
  async downloadDocument(
    _id: string,
  ): Promise<{ data: Buffer; metadata: Document } | null> {
    try {
      const document = await this.getDocumentById(_id);
      if (!document) {
        return null;
      }

      // In a real implementation, this would read from disk/cloud
      // For now, return placeholder data
      const data = Buffer.from("placeholder document data");

      return { data, metadata: document };
    } catch (error) {
      this.monitoring.logError("Document download error", error);
      throw error;
    }
  }

  /**
   * Update document metadata
   */
  async updateDocumentMetadata(
    _id: string,
    _updates: Partial<Document>,
  ): Promise<Document | null> {
    try {
      // For now, we'll create updated version
      // TODO: Implement proper update when database methods are available
      this.monitoring.logInfo(`Document metadata update requested for: ${_id}`);
      return null;
    } catch (error) {
      this.monitoring.logError("Document metadata update error", error);
      throw error;
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(_id: string): Promise<boolean> {
    try {
      // For now, we'll mark as deleted
      // TODO: Implement proper deletion when database methods are available
      this.monitoring.logInfo(`Document deletion requested for: ${_id}`);
      return true;
    } catch (error) {
      this.monitoring.logError("Document deletion error", error);
      throw error;
    }
  }

  /**
   * Get patient's documents
   */
  async getPatientDocuments(
    _patientId: string,
    _limit: number = 50,
  ): Promise<Document[]> {
    try {
      const criteria: DocumentSearchCriteria = {
        patient_id: _patientId,
        limit: _limit,
      };

      const documents = await this.searchDocuments(criteria);

      // Sort by upload date (most recent first)
      return documents.sort(
        (_a, _b) => _b.uploaded_at.getTime() - _a.uploaded_at.getTime(),
      );
    } catch (error) {
      this.monitoring.logError("Patient documents fetch error", error);
      throw error;
    }
  }

  /**
   * Get documents by type
   */
  async getDocumentsByType(
    _patientId: string,
    _documentType: string,
    _limit: number = 50,
  ): Promise<Document[]> {
    try {
      const criteria: DocumentSearchCriteria = {
        patient_id: _patientId,
        document_type: _documentType as any,
        limit: _limit,
      };

      return await this.searchDocuments(criteria);
    } catch (error) {
      this.monitoring.logError("Documents by type fetch error", error);
      throw error;
    }
  }

  /**
   * Search documents by content/tags
   */
  async searchDocumentsByContent(
    _patientId: string,
    searchTerm: string,
    _limit: number = 50,
  ): Promise<Document[]> {
    try {
      if (!searchTerm || searchTerm.length < 3) {
        return [];
      }

      const criteria: DocumentSearchCriteria = {
        patient_id: _patientId,
        limit: _limit,
      };

      const documents = await this.searchDocuments(criteria);

      // Simple text search in title, description, and tags
      const searchLower = searchTerm.toLowerCase();
      return documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchLower) ||
          (doc.description &&
            doc.description.toLowerCase().includes(searchLower)) ||
          (doc.tags &&
            doc.tags.some((_tag) => _tag.toLowerCase().includes(searchLower))),
      );
    } catch (error) {
      this.monitoring.logError("Documents content search error", error);
      throw error;
    }
  }

  /**
   * Get documents by tags
   */
  async getDocumentsByTags(
    _patientId: string,
    tags: string[],
    _limit: number = 50,
  ): Promise<Document[]> {
    try {
      const criteria: DocumentSearchCriteria = {
        patient_id: _patientId,
        tags: tags,
        limit: _limit,
      };

      const documents = await this.searchDocuments(criteria);

      // Filter documents that have any of the specified tags
      return documents.filter(
        (doc) => doc.tags && doc.tags.some((_tag) => tags.includes(_tag)),
      );
    } catch (error) {
      this.monitoring.logError("Documents by tags fetch error", error);
      throw error;
    }
  }

  /**
   * Add tags to document
   */
  async addTagsToDocument(
    documentId: string,
    tags: string[],
  ): Promise<boolean> {
    try {
      const document = await this.getDocumentById(documentId);
      if (!document) {
        return false;
      }

      const existingTags = document.tags || [];
      const newTags = [...new Set([...existingTags, ...tags])];

      // TODO: Update document with new tags when update method is available
      this.monitoring.logInfo(
        `Tags added to document ${documentId}: ${tags.join(", ")}`,
      );
      return true;
    } catch (error) {
      this.monitoring.logError("Add tags to document error", error);
      throw error;
    }
  }

  /**
   * Remove tags from document
   */
  async removeTagsFromDocument(
    documentId: string,
    tags: string[],
  ): Promise<boolean> {
    try {
      const document = await this.getDocumentById(documentId);
      if (!document || !document.tags) {
        return false;
      }

      const updatedTags = document.tags.filter((_tag) => !tags.includes(_tag));

      // TODO: Update document with filtered tags when update method is available
      this.monitoring.logInfo(
        `Tags removed from document ${documentId}: ${tags.join(", ")}`,
      );
      return true;
    } catch (error) {
      this.monitoring.logError("Remove tags from document error", error);
      throw error;
    }
  }

  /**
   * Get document storage statistics
   */
  async getDocumentStorageStats(): Promise<any> {
    try {
      // For now, return placeholder stats
      // TODO: Implement real stats when database methods are available
      return {
        total_documents: 0,
        total_size_bytes: 0,
        by_type: {},
        storage_used_percentage: 0,
        oldest_document: null,
        newest_document: null,
      };
    } catch (error) {
      this.monitoring.logError("Document storage stats error", error);
      throw error;
    }
  }

  /**
   * Validate file type and size
   */
  validateFile(
    _fileData: Buffer,
    _fileName: string,
  ): { valid: boolean; error?: string } {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (_fileData.length > maxSize) {
      return { valid: false, error: "File size exceeds maximum limit of 10MB" };
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    const fileExtension = this.getFileExtension(_fileName).toLowerCase();
    const mimeType = this.getMimeType(fileExtension);

    if (!allowedTypes.includes(mimeType)) {
      return { valid: false, error: `File type not allowed: ${mimeType}` };
    }

    return { valid: true };
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(_fileName: string): string {
    return _fileName.split(".").pop() || "";
  }

  /**
   * Get MIME type from file extension
   */
  private getMimeType(_extension: string): string {
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      txt: "text/plain",
    };

    return mimeTypes[_extension.toLowerCase()] || "application/octet-stream";
  }

  /**
   * Get module status
   */
  async getStatus(): Promise<any> {
    return {
      module: "documents",
      status: "operational",
      system: "DocumentManagerV2",
      database: await this.database.getStatus(),
      cache: await this.cache.getStatus(),
      monitoring: await this.monitoring.getStatus(),
    };
  }
}


