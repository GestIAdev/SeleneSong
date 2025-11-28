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
   * Delete document by ID (soft delete in DB + move to deleted/ folder)
   * 
   * ⚖️ SECURITY: RBAC enforced - Only ADMIN/DENTIST can delete
   * 📋 GDPR: Soft delete in DB BEFORE moving physical file
   * 🗂️ LEGAL: Files moved to deleted/ folder for audit trail
   */
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = (req as any).user;

      console.log(`🗑️ Delete request for document: ${id}`);
      console.log(`👤 User requesting delete:`, user?.email, `Role:`, user?.role);

      // ============================================================
      // 🔐 GATE 1: RBAC - Role-Based Access Control
      // ============================================================
      if (!user) {
        console.error("❌ DELETE REJECTED: No authenticated user");
        return res.status(401).json({
          success: false,
          error: "Authentication required",
        });
      }

      const allowedRoles = ['ADMIN', 'DENTIST', 'admin', 'dentist'];
      if (!allowedRoles.includes(user.role)) {
        console.error(`❌ DELETE REJECTED: Role ${user.role} not authorized`);
        return res.status(403).json({
          success: false,
          error: "Forbidden: Only ADMIN or DENTIST can delete documents",
        });
      }
      console.log(`✅ GATE 1 (RBAC) - Role ${user.role} authorized for delete`);

      // ============================================================
      // 🔍 GATE 2: Document Retrieval
      // ============================================================
      const documents = await database.getDocuments({ id });

      if (!documents || documents.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Document not found",
        });
      }

      const document = documents[0];
      console.log(`📄 Document found: ${document.fileName}`);

      // ============================================================
      // 💾 GATE 3: Soft Delete in Database FIRST (GDPR Compliance)
      // ============================================================
      const softDeleted = await database.deleteDocument(id);
      if (!softDeleted) {
        console.error("❌ Soft delete failed in database");
        return res.status(500).json({
          success: false,
          error: "Failed to soft delete document in database",
        });
      }
      console.log(`✅ GATE 3 (Soft Delete) - Document marked as deleted in DB`);

      // ============================================================
      // 🗂️ GATE 4: Move Physical File to deleted/ folder (Legal Archive)
      // ============================================================
      const fs = await import("fs");
      const path = await import("path");
      const absolutePath = path.join(process.cwd(), document.filePath.replace("/uploads/", "uploads/"));

      if (fs.existsSync(absolutePath)) {
        // Create deleted/ folder if it doesn't exist
        const deletedFolder = path.join(process.cwd(), "uploads", "deleted");
        if (!fs.existsSync(deletedFolder)) {
          fs.mkdirSync(deletedFolder, { recursive: true });
        }

        // Generate unique name with timestamp for audit trail
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const deletedFileName = `${timestamp}_${id}_${document.fileName}`;
        const deletedPath = path.join(deletedFolder, deletedFileName);

        // Move file instead of deleting
        fs.renameSync(absolutePath, deletedPath);
        console.log(`✅ GATE 4 (Legal Archive) - File moved to: ${deletedPath}`);
      } else {
        console.warn(`⚠️ Physical file not found at: ${absolutePath} (already deleted?)`);
      }

      console.log(`✅ Document ${id} deleted successfully by ${user.email}`);

      return res.status(200).json({
        success: true,
        message: "Document deleted successfully (soft delete + archived)",
        deletedBy: user.email,
        deletedAt: new Date().toISOString(),
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
