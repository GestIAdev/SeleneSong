/**
 * 🧹 CLEANUP: Remove Unused Imports
 * 
 * Uses ts-morph to automatically remove unused imports from TypeScript files.
 * Part of Phase 2.1: Technical Debt Liquidation
 * 
 * Target: 200 errors → 0
 */

import { Project } from 'ts-morph';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 PHASE 2.1.1: Starting unused import cleanup...\n');

const project = new Project({
  tsConfigFilePath: path.join(__dirname, '..', 'tsconfig.json'),
  skipAddingFilesFromTsConfig: false
});

let totalFilesProcessed = 0;
let totalImportsRemoved = 0;
let filesWithChanges = 0;

const sourceFiles = project.getSourceFiles();
console.log(`📂 Found ${sourceFiles.length} TypeScript files\n`);

for (const sourceFile of sourceFiles) {
  const filePath = sourceFile.getFilePath();
  
  // Skip node_modules and dist
  if (filePath.includes('node_modules') || filePath.includes('dist')) {
    continue;
  }

  const importsBefore = sourceFile.getImportDeclarations().length;
  
  // ts-morph magic: removes unused imports automatically
  sourceFile.fixUnusedIdentifiers();
  
  const importsAfter = sourceFile.getImportDeclarations().length;
  const removed = importsBefore - importsAfter;
  
  if (removed > 0) {
    console.log(`✅ ${path.basename(filePath)}: Removed ${removed} unused imports`);
    filesWithChanges++;
    totalImportsRemoved += removed;
    
    // Save changes
    sourceFile.saveSync();
  }
  
  totalFilesProcessed++;
}

console.log('\n' + '='.repeat(60));
console.log('📊 CLEANUP SUMMARY');
console.log('='.repeat(60));
console.log(`Files processed: ${totalFilesProcessed}`);
console.log(`Files modified: ${filesWithChanges}`);
console.log(`Imports removed: ${totalImportsRemoved}`);
console.log('='.repeat(60));

if (totalImportsRemoved > 0) {
  console.log('\n✅ Phase 2.1.1 COMPLETE - Unused imports cleaned!');
  console.log('⚠️  Please review changes and run tests to verify nothing broke');
} else {
  console.log('\n✅ No unused imports found - codebase is clean!');
}

process.exit(0);
