#!/usr/bin/env node

/**
 * SELENE SONG CORE - ESLint Setup Script
 * Phase 5: Cleanup Preparation
 *
 * This script configures ESLint for Selene Song Core codebase
 * to enable systematic code quality analysis and fixes.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 SELENE SONG CORE - ESLint Configuration Setup');
console.log('==============================================\n');

// Check if we're in the right directory
const currentDir = process.cwd();
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Run this script from selene root.');
  process.exit(1);
}

console.log('📍 Working directory:', currentDir);
console.log('📦 Checking package.json...\n');

// Check current dependencies
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasEslint = packageJson.devDependencies && (
  packageJson.devDependencies.eslint ||
  packageJson.devDependencies['@typescript-eslint/parser'] ||
  packageJson.devDependencies['@typescript-eslint/eslint-plugin']
);

if (hasEslint) {
  console.log('⚠️  ESLint dependencies already installed. Skipping installation...\n');
} else {
  console.log('📥 Installing ESLint dependencies...\n');

  try {
    execSync('npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier eslint-plugin-prettier', {
      stdio: 'inherit',
      cwd: currentDir
    });
    console.log('✅ ESLint dependencies installed successfully!\n');
  } catch (error) {
    console.error('❌ Failed to install ESLint dependencies:', error.message);
    process.exit(1);
  }
}

// Create .eslintrc.js configuration
const eslintrcConfig = `module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  env: {
    node: true,
    es6: true,
    jest: true
  },
  rules: {
    // Selene Song Core specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'prettier/prettier': 'error',

    // Disable some rules that might be too strict for Selene
    '@typescript-eslint/no-var-requires': 'off',
    'no-console': 'off', // Selene uses console for logging
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'dist-esm/',
    'profiling/',
    '*.js', // Ignore JS files, focus on TS
    '*.d.ts'
  ]
};
`;

console.log('📝 Creating .eslintrc.js configuration...\n');

try {
  fs.writeFileSync('.eslintrc.js', eslintrcConfig);
  console.log('✅ .eslintrc.js created successfully!\n');
} catch (error) {
  console.error('❌ Failed to create .eslintrc.js:', error.message);
  process.exit(1);
}

// Create .eslintignore
const eslintignore = `# Dependencies
node_modules/

# Build outputs
dist/
dist-esm/

# Profiling files
profiling/

# Logs
logs/

# Test results
test-results/

# Config files
*.config.js
*.config.ts

# Generated files
*.generated.ts
*.generated.js
`;

console.log('📝 Creating .eslintignore...\n');

try {
  fs.writeFileSync('.eslintignore', eslintignore);
  console.log('✅ .eslintignore created successfully!\n');
} catch (error) {
  console.error('❌ Failed to create .eslintignore:', error.message);
  process.exit(1);
}

// Test ESLint configuration
console.log('🧪 Testing ESLint configuration...\n');

try {
  execSync('npx eslint --version', { stdio: 'inherit', cwd: currentDir });
  console.log('✅ ESLint is working!\n');
} catch (error) {
  console.error('❌ ESLint test failed:', error.message);
  process.exit(1);
}

// Run initial lint check (dry run)
console.log('🔍 Running initial ESLint analysis (dry run)...\n');

try {
  const result = execSync('npx eslint . --ext .ts --max-warnings 0 --format=compact', {
    encoding: 'utf8',
    cwd: currentDir,
    stdio: 'pipe'
  });
  console.log('✅ No ESLint errors found! Codebase is clean.');
} catch (error) {
  const output = error.stdout || error.stderr || '';
  const errorCount = (output.match(/error/g) || []).length;
  const warningCount = (output.match(/warning/g) || []).length;

  console.log('📊 ESLint Analysis Results:');
  console.log('   Errors:', errorCount);
  console.log('   Warnings:', warningCount);
  console.log('\n🔧 Run the following to see detailed issues:');
  console.log('   npx eslint . --ext .ts --format=verbose');
  console.log('\n🔧 Run the following to auto-fix what can be fixed:');
  console.log('   npx eslint . --ext .ts --fix');
}

// Update package.json scripts
console.log('\n📝 Updating package.json scripts...\n');

const scripts = {
  'lint': 'eslint . --ext .ts,.tsx,.js,.jsx',
  'lint:fix': 'eslint . --ext .ts,.tsx,.js,.jsx --fix',
  'lint:check': 'eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0',
  'audit:eslint': 'eslint . --ext .ts --format=json | jq length',
  'clean:lint': 'eslint . --ext .ts --fix --quiet'
};

if (!packageJson.scripts) {
  packageJson.scripts = {};
}

Object.assign(packageJson.scripts, scripts);

try {
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ package.json scripts updated!\n');
} catch (error) {
  console.error('❌ Failed to update package.json:', error.message);
}

console.log('🎉 ESLint setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Review ESLint errors: npm run lint');
console.log('2. Auto-fix issues: npm run lint:fix');
console.log('3. Check clean status: npm run lint:check');
console.log('\n📊 Progress: Phase 5 Setup - COMPLETE');
console.log('🔄 Ready for systematic Selene Song Core cleanup!\n');

// Create initial audit report
const auditReport = {
  timestamp: new Date().toISOString(),
  phase: '5-setup',
  eslint: {
    configured: true,
    dependencies: hasEslint ? 'existing' : 'installed',
    config: '.eslintrc.js',
    ignore: '.eslintignore'
  },
  next: 'Run npm run audit:eslint for detailed analysis'
};

try {
  fs.writeFileSync('eslint-setup-report.json', JSON.stringify(auditReport, null, 2));
  console.log('📄 Audit report saved: eslint-setup-report.json\n');
} catch (error) {
  console.warn('⚠️  Could not save audit report:', error.message);
}

console.log('🏁 SELENE SONG CORE - ESLint Setup Complete!');
console.log('Ready for systematic codebase cleanup. 🚀\n');