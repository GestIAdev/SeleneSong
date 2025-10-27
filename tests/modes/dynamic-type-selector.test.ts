/**
 * 🧪 DYNAMIC TYPE SELECTOR TESTS
 * 
 * Tests para DynamicTypeSelector (risk filtering, punk boosting, weighted selection)
 * 
 * @author PunkClaude + Radwulf
 * @date 2025-10-23
 */

import { describe, it, expect } from 'vitest';
import { DynamicTypeSelector, type EvolutionaryType } from '../../src/evolutionary/modes/dynamic-type-selector.js';

describe('DynamicTypeSelector', () => {
  const selector = new DynamicTypeSelector();

  const allTypes: EvolutionaryType[] = [
    { name: 'analysis_deep', category: 'analysis', riskScore: 20, weight: 1 },
    { name: 'harmony_balanced', category: 'harmony', riskScore: 10, weight: 1 },
    { name: 'chaos_explosive', category: 'chaos', riskScore: 80, weight: 1 },
    { name: 'destruction_radical', category: 'destruction', riskScore: 90, weight: 1 },
    { name: 'exploration_novel', category: 'exploration', riskScore: 50, weight: 1 },
  ];

  it('✅ DETERMINISTIC: Should filter high-risk types', () => {
    const mode = { 
      entropyFactor: 0, 
      riskThreshold: 30, 
      punkProbability: 0, 
      feedbackInfluence: 0 
    };

    const selected = selector.selectTypes(50, mode, allTypes);

    // Solo tipos con riskScore <= 30
    expect(selected.length).toBeLessThanOrEqual(3);
    expect(selected.every(t => (t.riskScore || 0) <= 30)).toBe(true);
  });

  it('✅ PUNK: Should include high-risk types', () => {
    const mode = { 
      entropyFactor: 100, 
      riskThreshold: 90, 
      punkProbability: 80, 
      feedbackInfluence: 100 
    };

    const selected = selector.selectTypes(50, mode, allTypes);

    // Todos los tipos pasan (threshold 90)
    expect(selected.length).toBe(allTypes.length);
  });

  it('✅ PUNK: Should boost punk type probabilities', () => {
    const mode = { 
      entropyFactor: 100, 
      riskThreshold: 90, 
      punkProbability: 100, 
      feedbackInfluence: 0 
    };

    const selected = selector.selectTypes(50, mode, allTypes);

    // Tipos punk deberían estar en top positions
    const topThree = selected.slice(0, 3);
    const punkCategories = ['chaos', 'destruction', 'rebellion'];
    
    const punkInTop = topThree.filter(t => 
      punkCategories.includes(t.category)
    ).length;

    expect(punkInTop).toBeGreaterThanOrEqual(1); // Al menos 1 punk en top 3
  });

  it('✅ Should be deterministic with same seed', () => {
    const mode = { 
      entropyFactor: 0, 
      riskThreshold: 90, 
      punkProbability: 50, 
      feedbackInfluence: 0 
    };

    const selected1 = selector.selectTypes(42, mode, allTypes);
    const selected2 = selector.selectTypes(42, mode, allTypes);

    // Mismo seed = mismo orden
    expect(selected1.map(t => t.name)).toEqual(selected2.map(t => t.name));
  });

  it('✅ Should produce consistent sorting with same seed', () => {
    const mode = { 
      entropyFactor: 0, 
      riskThreshold: 90, 
      punkProbability: 0, // Sin punk boost para más variación
      feedbackInfluence: 0 
    };

    const selected1 = selector.selectTypes(42, mode, allTypes);
    const selected2 = selector.selectTypes(42, mode, allTypes);

    // Mismo seed = completamente idéntico
    expect(selected1).toEqual(selected2);
    expect(selected1.map(t => t.name)).toEqual(selected2.map(t => t.name));
  });
});
