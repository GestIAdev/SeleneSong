#!/usr/bin/env node

/**
 * SELENE SONG CORE - Initial Codebase Analysis Script
 * Phase 5: Cleanup Preparation
 *
 * Generates comprehensive analysis of Selene Song Core codebase
 * to guide systematic cleanup and restructuring.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 SELENE SONG CORE - Initial Codebase Analysis');
console.log('=============================================\n');

// Configuration
const ROOT_DIR = process.cwd();
const ANALYSIS_FILE = 'codebase-analysis-report.json';
const EXCLUDE_DIRS = ['node_modules', '.git', 'dist', 'dist-esm', 'profiling', 'logs', 'snapshots'];
const FILE_EXTENSIONS = ['.ts', '.js', '.json', '.md'];

let analysis = {
  timestamp: new Date().toISOString(),
  phase: '5-analysis',
  summary: {},
  files: {},
  directories: {},
  duplicates: {},
  dependencies: {},
  issues: []
};

// Utility functions
function shouldExclude(dirPath) {
  return EXCLUDE_DIRS.some(exclude => dirPath.includes(exclude));
}

function getFileType(filename) {
  const ext = path.extname(filename);
  if (ext === '.ts') return 'typescript';
  if (ext === '.js') return 'javascript';
  if (ext === '.json') return 'json';
  if (ext === '.md') return 'markdown';
  return 'other';
}

function calculateFileStats(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    const size = fs.statSync(filePath).size;
    const chars = content.length;

    return { lines, size, chars };
  } catch (error) {
    return { lines: 0, size: 0, chars: 0, error: error.message };
  }
}

function analyzeFile(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const fileName = path.basename(filePath);
  const dirName = path.dirname(relativePath);
  const type = getFileType(fileName);
  const stats = calculateFileStats(filePath);

  return {
    path: relativePath,
    name: fileName,
    directory: dirName,
    type,
    ...stats
  };
}

// Directory analysis
console.log('📁 Analyzing directory structure...\n');

function walkDirectory(dirPath, results = {}) {
  if (shouldExclude(dirPath)) return results;

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        results.directories = results.directories || {};
        results.directories[fullPath] = (results.directories[fullPath] || 0) + 1;
        walkDirectory(fullPath, results);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (FILE_EXTENSIONS.includes(ext)) {
          results.files = results.files || {};
          results.files[ext] = (results.files[ext] || 0) + 1;

          // Detailed file analysis
          const fileAnalysis = analyzeFile(fullPath);
          results.detailed = results.detailed || {};
          results.detailed[ext] = results.detailed[ext] || [];
          results.detailed[ext].push(fileAnalysis);
        }
      }
    }
  } catch (error) {
    analysis.issues.push({
      type: 'directory_error',
      path: dirPath,
      error: error.message
    });
  }

  return results;
}

const dirAnalysis = walkDirectory(ROOT_DIR);
analysis.files = dirAnalysis.files || {};
analysis.directories = dirAnalysis.directories || {};
analysis.detailed = dirAnalysis.detailed || {};

// Duplicate detection
console.log('🔍 Detecting duplicate files...\n');

function findDuplicates() {
  const hashes = {};
  const duplicates = {};

  function processFiles(files) {
    files.forEach(file => {
      if (file.type === 'typescript' || file.type === 'javascript') {
        try {
          const content = fs.readFileSync(path.join(ROOT_DIR, file.path), 'utf8');
          const hash = require('crypto').createHash('md5').update(content).digest('hex');

          if (!hashes[hash]) {
            hashes[hash] = [];
          }
          hashes[hash].push(file.path);

          if (hashes[hash].length > 1) {
            duplicates[hash] = hashes[hash];
          }
        } catch (error) {
          analysis.issues.push({
            type: 'duplicate_check_error',
            file: file.path,
            error: error.message
          });
        }
      }
    });
  }

  Object.values(analysis.detailed).forEach(files => processFiles(files));
  return duplicates;
}

analysis.duplicates = findDuplicates();

// Dependency analysis
console.log('📦 Analyzing dependencies...\n');

try {
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    analysis.dependencies = {
      total: Object.keys(packageJson.dependencies || {}).length +
             Object.keys(packageJson.devDependencies || {}).length,
      runtime: Object.keys(packageJson.dependencies || {}),
      dev: Object.keys(packageJson.devDependencies || {}),
      scripts: Object.keys(packageJson.scripts || {})
    };
  }
} catch (error) {
  analysis.issues.push({
    type: 'dependency_analysis_error',
    error: error.message
  });
}

// Summary generation
console.log('📊 Generating summary...\n');

analysis.summary = {
  totalFiles: Object.values(analysis.files).reduce((a, b) => a + b, 0),
  totalDirectories: Object.keys(analysis.directories).length,
  totalDuplicates: Object.keys(analysis.duplicates).length,
  duplicateFiles: Object.values(analysis.duplicates).flat().length,
  typescriptFiles: analysis.files['.ts'] || 0,
  javascriptFiles: analysis.files['.js'] || 0,
  jsonFiles: analysis.files['.json'] || 0,
  markdownFiles: analysis.files['.md'] || 0,
  totalLines: Object.values(analysis.detailed).flat()
    .reduce((sum, file) => sum + (file.lines || 0), 0),
  totalSize: Object.values(analysis.detailed).flat()
    .reduce((sum, file) => sum + (file.size || 0), 0),
  issues: analysis.issues.length
};

// Save analysis
console.log('💾 Saving analysis report...\n');

try {
  fs.writeFileSync(ANALYSIS_FILE, JSON.stringify(analysis, null, 2));
  console.log(`✅ Analysis saved to: ${ANALYSIS_FILE}\n`);
} catch (error) {
  console.error('❌ Failed to save analysis:', error.message);
  process.exit(1);
}

// Console output
console.log('📈 ANALYSIS SUMMARY');
console.log('==================');
console.log(`Total Files: ${analysis.summary.totalFiles}`);
console.log(`TypeScript: ${analysis.summary.typescriptFiles}`);
console.log(`JavaScript: ${analysis.summary.javascriptFiles}`);
console.log(`Total Lines: ${analysis.summary.totalLines.toLocaleString()}`);
console.log(`Total Size: ${(analysis.summary.totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Duplicates Found: ${analysis.summary.totalDuplicates} groups`);
console.log(`Issues Detected: ${analysis.summary.issues}`);

if (analysis.summary.duplicateFiles > 0) {
  console.log('\n⚠️  DUPLICATE FILES DETECTED:');
  Object.entries(analysis.duplicates).forEach(([hash, files]) => {
    console.log(`  Group (${files.length} files):`);
    files.forEach(file => console.log(`    - ${file}`));
  });
}

if (analysis.issues.length > 0) {
  console.log('\n🚨 ISSUES DETECTED:');
  analysis.issues.forEach(issue => {
    console.log(`  ${issue.type}: ${issue.error}`);
  });
}

console.log('\n📋 RECOMMENDATIONS:');
console.log('1. Review duplicate files for consolidation');
console.log('2. Address analysis issues');
console.log('3. Run ESLint setup: node setup-eslint.js');
console.log('4. Proceed with systematic cleanup');

console.log('\n🏁 Initial analysis complete!');
console.log('Ready for Phase 5 cleanup execution. 🚀\n');