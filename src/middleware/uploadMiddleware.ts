// ============================================================================
// 📤 FILE UPLOAD MIDDLEWARE - LOCAL STORAGE PUNK EDITION
// ============================================================================
// By PunkClaude - November 8, 2025
// NO CLOUDS, NO BULLSHIT, JUST REAL LOCAL FILES
// ============================================================================

import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// ============================================================================
// 📁 UPLOAD DIRECTORIES CONFIGURATION
// ============================================================================
const UPLOAD_BASE_DIR = path.join(process.cwd(), "uploads");

const UPLOAD_DIRS = {
  XRAY: path.join(UPLOAD_BASE_DIR, "xrays"),
  PHOTO: path.join(UPLOAD_BASE_DIR, "photos"),
  PDF: path.join(UPLOAD_BASE_DIR, "pdfs"),
  DICOM: path.join(UPLOAD_BASE_DIR, "dicom"),
  OTHER: path.join(UPLOAD_BASE_DIR, "other"),
};

// ============================================================================
// 🎯 MIME TYPE MAPPINGS
// ============================================================================
const MIME_TO_DIR: Record<string, string> = {
  // Images - X-rays
  "image/x-dicom": UPLOAD_DIRS.DICOM,
  "application/dicom": UPLOAD_DIRS.DICOM,
  
  // Images - Photos
  "image/jpeg": UPLOAD_DIRS.PHOTO,
  "image/jpg": UPLOAD_DIRS.PHOTO,
  "image/png": UPLOAD_DIRS.PHOTO,
  "image/webp": UPLOAD_DIRS.PHOTO,
  "image/gif": UPLOAD_DIRS.PHOTO,
  
  // PDFs
  "application/pdf": UPLOAD_DIRS.PDF,
  
  // Other documents
  "application/msword": UPLOAD_DIRS.OTHER,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": UPLOAD_DIRS.OTHER,
  "application/vnd.ms-excel": UPLOAD_DIRS.OTHER,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": UPLOAD_DIRS.OTHER,
  "text/plain": UPLOAD_DIRS.OTHER,
  "text/csv": UPLOAD_DIRS.OTHER,
};

// ============================================================================
// 🚀 MULTER STORAGE CONFIGURATION
// ============================================================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine directory based on MIME type
    const uploadDir = MIME_TO_DIR[file.mimetype] || UPLOAD_DIRS.OTHER;
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    console.log(`📁 Upload destination: ${uploadDir} for ${file.mimetype}`);
    cb(null, uploadDir);
  },
  
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    
    // Sanitize basename (remove special chars)
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9_-]/g, "_");
    
    const filename = `${timestamp}-${randomHash}-${sanitizedBasename}${ext}`;
    
    console.log(`📝 Generated filename: ${filename}`);
    cb(null, filename);
  },
});

// ============================================================================
// 🛡️ FILE VALIDATION
// ============================================================================
const fileFilter = (req: any, file: any, cb: any) => {
  // Allowed MIME types
  const allowedMimes = Object.keys(MIME_TO_DIR);
  
  if (allowedMimes.includes(file.mimetype)) {
    console.log(`✅ File accepted: ${file.originalname} (${file.mimetype})`);
    cb(null, true);
  } else {
    console.error(`❌ File rejected: ${file.originalname} (${file.mimetype})`);
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

// ============================================================================
// 🎯 MULTER INSTANCE - LIMITS AND CONFIG
// ============================================================================
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 10, // Max 10 files per upload
  },
});

// ============================================================================
// 🔧 UTILITY FUNCTIONS
// ============================================================================

/**
 * Get relative path from absolute path for DB storage
 */
export function getRelativePath(absolutePath: string): string {
  return absolutePath.replace(UPLOAD_BASE_DIR, "/uploads").replace(/\\/g, "/");
}

/**
 * Get absolute path from relative DB path
 */
export function getAbsolutePath(relativePath: string): string {
  return path.join(UPLOAD_BASE_DIR, relativePath.replace("/uploads/", ""));
}

/**
 * Calculate file hash (SHA-256)
 */
export async function calculateFileHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(`sha256:${hash.digest("hex")}`));
    stream.on("error", reject);
  });
}

/**
 * Delete file from disk
 */
export async function deleteFile(relativePath: string): Promise<boolean> {
  try {
    const absolutePath = getAbsolutePath(relativePath);
    
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log(`🗑️ Deleted file: ${relativePath}`);
      return true;
    }
    
    console.warn(`⚠️ File not found for deletion: ${relativePath}`);
    return false;
  } catch (error) {
    console.error(`❌ Error deleting file ${relativePath}:`, error);
    return false;
  }
}

/**
 * Get file metadata
 */
export function getFileMetadata(filePath: string) {
  const stats = fs.statSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  
  return {
    size: stats.size,
    extension: ext,
    created: stats.birthtime,
    modified: stats.mtime,
  };
}

export { UPLOAD_DIRS, UPLOAD_BASE_DIR };
