// vitest.config.ts
// 🧪 CONFIGURACIÓN DE VITEST PARA SELENE SONG CORE
// 🎯 "Los tests son el fuego que forja la certeza del código"
// ⚡ Ejecutor: PunkClaude | Arquitecto: Radwulf

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Nombre del test runner
    name: 'Selene Song Core Tests',
    
    // Globals para tests (describe, it, expect)
    globals: true,
    
    // Entorno de ejecución
    environment: 'node',
    
    // Cobertura de código
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/interfaces/',
        '**/*.d.ts',
        'test/',
        'apollo-crisol-launcher.js',
        'disciplina-romana.js',
        'ecosystem.config.cjs',
        '*.config.ts',
        '*.config.js'
      ],
      include: ['src/**/*.ts'],
      all: true,
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70
    },
    
    // Timeout para tests (10 segundos)
    testTimeout: 10000,
    
    // Reporters
    reporters: ['verbose'],
    
    // Include pattern para archivos de test
    include: ['**/*.{test,spec}.ts'],
    
    // Exclude pattern
    exclude: [
      'node_modules',
      'dist',
      '.git',
      'coverage',
      '**/tests/dashboard-apollo-integration.test.ts' // Test de integración - excluir en tests unitarios
    ],
    
    // Mock Redis para tests unitarios
    setupFiles: ['./test/setup.ts'],
    
    // Threads para paralelización
    threads: true,
    
    // Isolate para evitar side effects entre tests
    isolate: true,
    
    // Watch mode config
    watch: false,
    
    // Bail on first failure (útil para CI/CD)
    bail: 0,
    
    // Retry failed tests
    retry: 0
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@evolutionary': path.resolve(__dirname, './src/evolutionary'),
      '@consciousness': path.resolve(__dirname, './src/consciousness'),
      '@swarm': path.resolve(__dirname, './src/swarm'),
      '@core': path.resolve(__dirname, './src/core')
    }
  }
});
