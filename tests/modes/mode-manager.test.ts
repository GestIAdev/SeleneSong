/**
 * 🧪 MODE MANAGER TESTS
 * 
 * Tests para ModeManager (Singleton, modos predefinidos, custom modes, Opción D)
 * 
 * @author PunkClaude + Radwulf
 * @date 2025-10-23
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ModeManager } from '../../src/evolutionary/modes/mode-manager.js';

describe('ModeManager', () => {
  beforeEach(() => {
    // Reset a modo default
    ModeManager.getInstance().reset();
  });

  it('✅ Should start in BALANCED mode by default', () => {
    const manager = ModeManager.getInstance();
    expect(manager.getCurrentMode()).toBe('balanced');
  });

  it('✅ Should switch to DETERMINISTIC mode', () => {
    const manager = ModeManager.getInstance();
    manager.setMode('deterministic');

    const config = manager.getModeConfig();
    expect(config.entropyFactor).toBe(0);
    expect(config.punkProbability).toBe(0);
    expect(config.riskThreshold).toBe(10);
  });

  it('✅ Should switch to PUNK mode', () => {
    const manager = ModeManager.getInstance();
    manager.setMode('punk');

    const config = manager.getModeConfig();
    expect(config.entropyFactor).toBe(100);
    expect(config.punkProbability).toBe(80);
    expect(config.riskThreshold).toBe(70);
  });

  it('✅ Should accept custom mode', () => {
    const manager = ModeManager.getInstance();
    manager.setCustomMode({
      name: 'ultra-chaos',
      description: 'Maximum chaos for testing',
      entropyFactor: 120,
      riskThreshold: 90,
      punkProbability: 100,
      feedbackInfluence: 100
    });

    const config = manager.getModeConfig();
    expect(config.entropyFactor).toBe(120);
    expect(manager.getCurrentMode()).toBe('custom');
  });

  it('✅ Should adjust mode from positive feedback (Opción D)', () => {
    const manager = ModeManager.getInstance();
    manager.setMode('balanced');

    const beforeConfig = manager.getModeConfig();
    const beforeEntropy = beforeConfig.entropyFactor;

    // Rating alto: aumenta entropy
    manager.adjustModeFromFeedback(8);

    const afterConfig = manager.getModeConfig();
    expect(afterConfig.entropyFactor).toBeGreaterThan(beforeEntropy);
    expect(manager.getCurrentMode()).toBe('custom'); // Auto-ajustado
  });

  it('✅ Should adjust mode from negative feedback (Opción D)', () => {
    const manager = ModeManager.getInstance();
    manager.setMode('balanced');

    const beforeConfig = manager.getModeConfig();
    const beforeEntropy = beforeConfig.entropyFactor;

    // Rating bajo: disminuye entropy
    manager.adjustModeFromFeedback(2);

    const afterConfig = manager.getModeConfig();
    expect(afterConfig.entropyFactor).toBeLessThan(beforeEntropy);
  });

  it('✅ Should NOT adjust extreme modes (deterministic/punk)', () => {
    const manager = ModeManager.getInstance();
    
    // Test deterministic
    manager.setMode('deterministic');
    manager.adjustModeFromFeedback(8); // Rating alto
    expect(manager.getCurrentMode()).toBe('deterministic'); // No cambia

    // Test punk
    manager.setMode('punk');
    manager.adjustModeFromFeedback(2); // Rating bajo
    expect(manager.getCurrentMode()).toBe('punk'); // No cambia
  });
});
