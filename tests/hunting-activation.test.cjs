// Simple test to verify hunting system activation
// This test verifies that the hunting system has been properly uncommented and activated

console.log('🧪 Testing SeleneConsciousness Hunting System Activation...');

function testHuntingActivation() {
  try {
    console.log('🔍 Checking hunting engine files...');

    // Check if files exist
    const fs = require('fs');
    const path = require('path');

    const basePath = path.join(process.cwd(), 'src', 'consciousness');

    const filesToCheck = [
      'engines/HuntOrchestrator.js',
      'engines/StalkingEngine.js',
      'engines/StrikeMomentEngine.js',
      'engines/PreyRecognitionEngine.js',
      'SeleneConsciousness.ts' // Check the main file too
    ];

    let allFilesExist = true;
    for (const file of filesToCheck) {
      const fullPath = path.join(basePath, file);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} missing`);
        allFilesExist = false;
      }
    }

    if (!allFilesExist) {
      return false;
    }

    // Test 2: Check if hunting code is uncommented in SeleneConsciousness.ts
    console.log('🔍 Checking if hunting code is uncommented...');

    const selenePath = path.join(basePath, 'SeleneConsciousness.ts');
    const content = fs.readFileSync(selenePath, 'utf8');

    // Check for hunting imports
    const huntingImports = [
      "import { StalkingEngine } from './engines/StalkingEngine.js';",
      "import { StrikeMomentEngine } from './engines/StrikeMomentEngine.js';",
      "import { PreyRecognitionEngine } from './engines/PreyRecognitionEngine.js';",
      "import { HuntOrchestrator } from './engines/HuntOrchestrator.js';"
    ];

    let importsUncommented = true;
    for (const importLine of huntingImports) {
      if (content.includes(importLine)) {
        console.log(`✅ Hunting import found: ${importLine.split(' from')[0]}`);
      } else {
        console.log(`❌ Hunting import missing: ${importLine.split(' from')[0]}`);
        importsUncommented = false;
      }
    }

    // Check for hunting method calls
    const methodCalls = [
      'await this.initializeDepredationEngines();',
      'await this.executeHuntingCycle(poetry, systemState);'
    ];

    let methodsUncommented = true;
    for (const methodCall of methodCalls) {
      if (content.includes(methodCall)) {
        console.log(`✅ Hunting method call found: ${methodCall}`);
      } else {
        console.log(`❌ Hunting method call missing: ${methodCall}`);
        methodsUncommented = false;
      }
    }

    // Check for ENLIGHTENED evolution logic
    if (content.includes("if (this.status === 'enlightened') {")) {
      console.log('✅ ENLIGHTENED evolution logic found');
    } else {
      console.log('❌ ENLIGHTENED evolution logic missing');
      return false;
    }

    if (importsUncommented && methodsUncommented) {
      console.log('🎯 HUNTING SYSTEM ACTIVATION TEST PASSED!');
      console.log('🐆 The predator awakens... Selene can now hunt!');
      console.log('');
      console.log('📋 ACTIVATION SUMMARY:');
      console.log('✅ Hunting engine files exist');
      console.log('✅ Hunting imports uncommented');
      console.log('✅ Hunting methods uncommented');
      console.log('✅ ENLIGHTENED evolution includes hunting initialization');
      console.log('✅ Hunting cycles integrated into observeZodiacPoetry');
      return true;
    } else {
      console.log('❌ Hunting system not fully activated');
      return false;
    }

  } catch (error) {
    console.log('❌ Hunting system activation test FAILED:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Run the test
const success = testHuntingActivation();
process.exit(success ? 0 : 1);