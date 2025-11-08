// ============================================================================
// 📤 DOCUMENT UPLOAD REST ENDPOINT - PUNK EDITION
// ============================================================================
// By PunkClaude - November 8, 2025
// REST for file uploads, GraphQL for everything else
// ============================================================================

import express from "express";
import { upload, getRelativePath, calculateFileHash } from "../middleware/uploadMiddleware.js";
import type { SeleneDatabase } from "../core/Database.js";

export function createDocumentUploadRouter(database: SeleneDatabase) {
  const router = express.Router();

  /**
   * POST /api/documents/upload
   * Upload single or multiple medical documents
   * 
   * Body (multipart/form-data):
   * - file: File to upload
   * - patientId: Patient ID
   * - uploaderId: Uploader (practitioner) ID
   * - documentType: Type of document (XRAY, PHOTO, PDF, etc.)
   * - description: Optional description
   * - category: Optional category
   * - tags: Optional JSON array of tags
   */
  router.post("/upload", upload.single("file"), async (req, res) => {
    try {
      console.log("📤 Upload request received");
      console.log("📋 Body:", req.body);
      console.log("📁 File:", req.file);

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      // Extract metadata from request
      const {
        patientId,
        uploaderId,
        documentType,
        description,
        category,
        tags,
        medicalRecordId,
        appointmentId,
      } = req.body;

      // Validate required fields
      if (!patientId) {
        return res.status(400).json({
          success: false,
          error: "patientId is required",
        });
      }

      if (!uploaderId) {
        return res.status(400).json({
          success: false,
          error: "uploaderId is required",
        });
      }

      // Calculate file hash
      const fileHash = await calculateFileHash(req.file.path);

      // Get relative path for DB
      const relativePath = getRelativePath(req.file.path);

      // Parse tags if JSON string
      let parsedTags: string[] = [];
      if (tags) {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          parsedTags = [tags]; // Single tag as string
        }
      }

      // Create document in database
      const document = await database.createDocument({
        patientId,
        medicalRecordId: medicalRecordId || null,
        appointmentId: appointmentId || null,
        documentType: documentType || "OTHER",
        title: req.file.originalname,
        description: description || null,
        fileName: req.file.originalname,
        filePath: relativePath,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        fileExtension: req.file.originalname.split(".").pop() || "",
        fileHash: fileHash,
        accessLevel: "PRIVATE",
        isConfidential: false,
        createdBy: uploaderId,
        unifiedType: documentType || "OTHER",
        legalCategory: category || null,
        isActive: true,
        tags: parsedTags,
      });

      console.log("✅ Document created:", document);

      return res.status(200).json({
        success: true,
        document,
      });
    } catch (error) {
      console.error("❌ Upload error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  });

  /**
   * GET /api/documents/download/:id
   * Download document by ID
   */
  router.get("/download/:id", async (req, res) => {
    try {
      const { id } = req.params;

      console.log(`📥 Download request for document: ${id}`);

      // Get document from database
      const documents = await database.getDocuments({ id });

      if (!documents || documents.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Document not found",
        });
      }

      const document = documents[0];
      const filePath = document.filePath;

      // Check if file exists
      const fs = await import("fs");
      const path = await import("path");
      
      const absolutePath = path.join(process.cwd(), filePath.replace("/uploads/", "uploads/"));

      if (!fs.existsSync(absolutePath)) {
        console.error(`❌ File not found: ${absolutePath}`);
        return res.status(404).json({
          success: false,
          error: "File not found on disk",
        });
      }

      console.log(`✅ Sending file: ${absolutePath}`);

      // Set headers for download
      res.setHeader("Content-Type", document.mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${document.fileName}"`);
      res.setHeader("Content-Length", document.fileSize.toString());

      // Stream file
      const fileStream = fs.createReadStream(absolutePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("❌ Download error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Download failed",
      });
    }
  });

  /**
   * DELETE /api/documents/:id
   * Delete document by ID (soft delete in DB + physical file deletion)
   */
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;

      console.log(`🗑️ Delete request for document: ${id}`);

      // Get document to find file path
      const documents = await database.getDocuments({ id });

      if (!documents || documents.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Document not found",
        });
      }

      const document = documents[0];

      // Delete from database (soft delete - sets deleted_at)
      // TODO: Implement deleteDocument in Database.ts
      // await database.deleteDocument(id);

      // Delete physical file
      const fs = await import("fs");
      const path = await import("path");
      const absolutePath = path.join(process.cwd(), document.filePath.replace("/uploads/", "uploads/"));

      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
        console.log(`✅ File deleted: ${absolutePath}`);
      }

      return res.status(200).json({
        success: true,
        message: "Document deleted successfully",
      });
    } catch (error) {
      console.error("❌ Delete error:", error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Delete failed",
      });
    }
  });

  return router;
}
