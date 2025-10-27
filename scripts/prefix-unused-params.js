/**
 * 🧹 CLEANUP: Prefix Unused Parameters with _
 *
 * Uses ts-morph to find function parameters that are declared but never used,
 * and prefixes them with underscore to indicate intentional non-usage.
 *
 * Part of Phase 2.1: Technical Debt Liquidation
 *
 * Target: 150 errors → 0
 */
import { Project, SyntaxKind } from 'ts-morph';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('🧹 PHASE 2.1.2: Starting unused parameter cleanup...\n');
const project = new Project({
    tsConfigFilePath: path.join(__dirname, '..', 'tsconfig.json'),
    skipAddingFilesFromTsConfig: false
});
let totalFilesProcessed = 0;
let totalParamsRenamed = 0;
let filesWithChanges = 0;
const sourceFiles = project.getSourceFiles();
console.log(`📂 Found ${sourceFiles.length} TypeScript files\n`);
for (const sourceFile of sourceFiles) {
    const filePath = sourceFile.getFilePath();
    // Skip node_modules, dist, and test files (tests often have unused params intentionally)
    if (filePath.includes('node_modules') ||
        filePath.includes('dist') ||
        filePath.includes('.test.') ||
        filePath.includes('.spec.')) {
        continue;
    }
    let fileChanges = 0;
    // Find all function-like declarations
    const functions = [
        ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration),
        ...sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration),
        ...sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction),
        ...sourceFile.getDescendantsOfKind(SyntaxKind.FunctionExpression)
    ];
    for (const func of functions) {
        const params = func.getParameters();
        for (const param of params) {
            const paramName = param.getName();
            // Skip if already prefixed with underscore
            if (paramName.startsWith('_'))
                continue;
            // Skip rest parameters and destructured parameters (complex)
            if (param.isRestParameter() ||
                param.getFirstChildByKind(SyntaxKind.ObjectBindingPattern) ||
                param.getFirstChildByKind(SyntaxKind.ArrayBindingPattern)) {
                continue;
            }
            // Check if parameter is used in function body
            const funcBody = func.getBody();
            if (!funcBody)
                continue;
            const references = param.findReferencesAsNodes();
            // If only 1 reference (the declaration itself), it's unused
            if (references.length <= 1) {
                const newName = `_${paramName}`;
                param.rename(newName);
                fileChanges++;
                totalParamsRenamed++;
            }
        }
    }
    if (fileChanges > 0) {
        console.log(`✅ ${path.basename(filePath)}: Prefixed ${fileChanges} unused parameters`);
        filesWithChanges++;
        sourceFile.saveSync();
    }
    totalFilesProcessed++;
}
console.log('\n' + '='.repeat(60));
console.log('📊 CLEANUP SUMMARY');
console.log('='.repeat(60));
console.log(`Files processed: ${totalFilesProcessed}`);
console.log(`Files modified: ${filesWithChanges}`);
console.log(`Parameters prefixed: ${totalParamsRenamed}`);
console.log('='.repeat(60));
if (totalParamsRenamed > 0) {
    console.log('\n✅ Phase 2.1.2 COMPLETE - Unused parameters prefixed!');
    console.log('⚠️  Please review changes and run tests to verify nothing broke');
}
else {
    console.log('\n✅ No unused parameters found - codebase is clean!');
}
process.exit(0);
//# sourceMappingURL=prefix-unused-params.js.map