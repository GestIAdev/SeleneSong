# 🎸 DISEÑO DE TESTS DE INTEGRACIÓN - SSE-5.3
**Ejecutor:** PunkClaude  
**Fecha:** 22 Octubre 2025  
**Fase:** SSE-5.3 - Tests de Integración del Synergy Engine  

---

## 🎯 OBJETIVO

Validar el **flujo completo end-to-end** del Selene Synergy Engine integrando:
- ✅ Core evolutivo (FibonacciPatternEngine, EvolutionaryDecisionGenerator)
- ✅ Sistema de seguridad (7 componentes)
- ✅ Integración con AutoOptimizationEngine
- ✅ Comunicación con Redis REAL (no mock)
- ✅ Validación con Veritas (mocked para control)

---

## 🧪 ESCENARIOS DE INTEGRACIÓN

### **1. FLUJO FELIZ COMPLETO** 🌟
**Objetivo:** Validar ciclo end-to-end exitoso

**Setup:**
- SystemVitals: health=0.9, stress=0.2, harmony=0.8
- Veritas: respuesta `verified=true, confidence=0.9`
- Redis: vacío al inicio

**Flujo:**
1. `executeEvolutionCycle()` →
2. `buildEvolutionContext()` → SystemVitals OK
3. `SanityCheckEngine.assessEvolutionSanity()` → sanityLevel > 0.6 ✅
4. `EvolutionaryDecisionGenerator.generateEvolutionCycle()` → 2 tipos generados
5. `PatternSanityChecker.checkPatternSanity()` → ambos patrones sanos ✅
6. `validateWithVeritas()` → ambos verificados ✅
7. `EvolutionarySafetyValidator.validateEvolutionaryDecision()` → ambos seguros ✅
8. `convertToSuggestions()` → 2 sugerencias creadas
9. `DecisionContainmentSystem.containEvolutionaryDecision()` → contención aplicada
10. `EvolutionaryRollbackEngine.registerForRollback()` → registradas para rollback
11. `BehavioralAnomalyDetector.analyzeBehavioralAnomalies()` → sin anomalías
12. `addToEvolutionHistory()` → guardado en Redis

**Verificaciones:**
- ✅ Retorna 2 sugerencias
- ✅ Redis key `selene:evolution:history` contiene 2 entradas
- ✅ Cada sugerencia tiene `containment` y `containment.contained = true`
- ✅ EvolutionaryRollbackEngine tiene 2 entradas registradas
- ✅ No hay anomalías detectadas

---

### **2. ESCENARIO SANITY CHECK - ABORT** 🚨
**Objetivo:** Sistema inestable debe abortar ciclo evolutivo

**Setup:**
- SystemVitals: health=0.4, stress=0.9, harmony=0.3 (INESTABLE)
- Veritas: N/A (no se llega a validar)
- Redis: vacío

**Flujo:**
1. `executeEvolutionCycle()` →
2. `buildEvolutionContext()` → SystemVitals MALO
3. `SanityCheckEngine.assessEvolutionSanity()` → sanityLevel = 0.4 < 0.6 ❌
4. `SanityCheckEngine.executeSanityIntervention()` → intervención ejecutada
5. **CICLO ABORTADO** → retorna `[]`

**Verificaciones:**
- ✅ Retorna array vacío `[]`
- ✅ No se genera ningún tipo de decisión
- ✅ Redis `selene:evolution:history` permanece vacío
- ✅ Console.warn contiene "Sanity check fallido"

---

### **3. ESCENARIO PATTERN SANITY - REJECTION** 🎭
**Objetivo:** Patrones no sanos deben ser descartados

**Setup:**
- SystemVitals: OK
- Generar patrón con Fibonacci extremo (>1M)
- Veritas: N/A (no se llega a validar patrones descartados)

**Flujo:**
1. `executeEvolutionCycle()` →
2. Context OK, Sanity OK
3. `EvolutionaryDecisionGenerator` genera 1 patrón con fibonacci=[1, 1, 2, 3, 5, 1597, 2584, 4181, 6765, 10946, **1000000**]
4. `PatternSanityChecker.checkPatternSanity()` → `isSane = false` (extremo > 1M) ❌
5. Patrón descartado
6. `saneTypes.length === 0` → **CICLO ABORTADO**

**Verificaciones:**
- ✅ Retorna array vacío `[]`
- ✅ Console.warn contiene "Patrón no sano descartado"
- ✅ Console.warn contiene "No se generaron patrones sanos, abortando"
- ✅ Redis permanece vacío

---

### **4. ESCENARIO SAFETY VALIDATION - CONTAINMENT** 🛡️
**Objetivo:** Decisiones de alto riesgo deben ser contenidas

**Setup:**
- SystemVitals: OK
- Generar decisión con `riskLevel = 0.85` (HIGH RISK)
- Veritas: verified=true

**Flujo:**
1. `executeEvolutionCycle()` →
2. Context OK, Sanity OK, Pattern OK, Veritas OK
3. `EvolutionarySafetyValidator.validateEvolutionaryDecision()` →
   - `riskLevel = 0.85` → `isSafe = true` (pero con concerns)
4. `convertToSuggestions()` →
5. `DecisionContainmentSystem.containEvolutionaryDecision()` →
   - containmentLevel = `'high'` (basado en riskLevel 0.85)
   - Acciones aplicadas según componente
6. `EvolutionaryRollbackEngine.registerForRollback()` → registrado
7. Sugerencia retornada con `containment.containmentLevel = 'high'`

**Verificaciones:**
- ✅ Retorna 1 sugerencia
- ✅ `suggestion.containment.containmentLevel === 'high'`
- ✅ `suggestion.containment.contained === true`
- ✅ `EvolutionaryRollbackEngine.getStats().totalRegistered === 1`
- ✅ Console.log contiene "Sugerencia ... contenida con nivel: high"

---

### **5. ESCENARIO QUARANTINE - HIGH RISK PATTERN** ⚠️
**Objetivo:** Patrones de riesgo crítico deben ir a cuarentena

**Setup:**
- SystemVitals: OK
- Generar decisión con `riskLevel = 0.9` (CRITICAL)
- Veritas: verified=true
- Redis: vacío

**Flujo:**
1. `executeEvolutionCycle()` →
2. Pattern OK, Veritas OK
3. `EvolutionarySafetyValidator.validateEvolutionaryDecision()` →
   - `riskLevel = 0.9` → `isSafe = false` (riesgo crítico) ❌
4. `PatternQuarantineSystem.quarantinePattern()` llamado
5. Patrón guardado en Redis `selene:evolution:quarantine`
6. Decisión descartada (no se convierte a sugerencia)

**Verificaciones:**
- ✅ Retorna array vacío o sin este patrón específico
- ✅ Redis key `selene:evolution:quarantine` contiene 1 entrada
- ✅ `PatternQuarantineSystem.getQuarantineStats()` → totalQuarantined = 1
- ✅ Console.warn contiene "Decisión no segura descartada"

---

### **6. ESCENARIO ANOMALY DETECTION** 🔍
**Objetivo:** Detectar y registrar anomalías comportamentales

**Setup:**
- SystemVitals: OK
- Generar 5 decisiones con mismo `fibonacciSignature` (REPETICIÓN ANÓMALA)
- Veritas: verified=true
- Redis: vacío

**Flujo:**
1. `executeEvolutionCycle()` ejecutado 5 veces consecutivas
2. Todas las decisiones tienen idéntico patrón fibonacci
3. `BehavioralAnomalyDetector.analyzeBehavioralAnomalies()` →
   - Detecta anomalía de tipo `'repetition'`
   - Severidad `'critical'` (>80% repetición)
4. Anomalía registrada en Redis `selene:evolution:anomalies`

**Verificaciones:**
- ✅ `BehavioralAnomalyDetector.getAnomalyStats()` → anomalyCount > 0
- ✅ Redis key `selene:evolution:anomalies` existe
- ✅ Anomalía tiene `type = 'repetition'` y `severity = 'critical'`
- ✅ Console.warn contiene "Anomalías detectadas"

---

### **7. ESCENARIO INTEGRACIÓN AutoOptimizationEngine** 🔄
**Objetivo:** Validar flujo completo con EvolutionaryAutoOptimizationEngine

**Setup:**
- SystemVitals: OK
- Veritas: verified=true
- Redis: vacío
- SafetyContext mock

**Flujo:**
1. `EvolutionaryAutoOptimizationEngine.generateEvolutionarySuggestions(context)` →
2. Llama a `evolutionEngine.executeEvolutionCycle()` →
3. Ciclo retorna 2 EvolutionarySuggestion
4. Conversión a formato Optimization:
   ```typescript
   {
     optimizationId: evoSugg.id,
     targetComponent: evoSugg.targetComponent,
     changeType: evoSugg.changeType,
     expectedImprovement: evoSugg.expectedImprovement,
     riskLevel: evoSugg.riskLevel,
     status: 'pending_human',
     poeticDescription: evoSugg.poeticDescription,
     technicalDescription: evoSugg.technicalDescription
   }
   ```
5. Retorna 2 Optimization[]

**Verificaciones:**
- ✅ Retorna 2 optimizations
- ✅ Cada optimization tiene `optimizationId` que comienza con `'evo_'`
- ✅ `status === 'pending_human'`
- ✅ `poeticDescription` está presente
- ✅ `technicalDescription` está presente
- ✅ Console.log contiene "Generated 2 evolutionary suggestions"

---

### **8. ESCENARIO REDIS REAL - COMUNICACIÓN COMPLETA** 💾
**Objetivo:** Validar persistencia y lectura desde Redis REAL

**Setup:**
- Redis REAL corriendo en localhost:6379
- beforeEach: `redis.flushdb()` para limpiar
- SystemVitals: OK
- Veritas: verified=true

**Flujo:**
1. `executeEvolutionCycle()` →
2. 2 sugerencias generadas
3. `addToEvolutionHistory()` → guarda en Redis `selene:evolution:history` (ZADD sorted set)
4. Verificar con `redis.zrange('selene:evolution:history', 0, -1)`
5. `registerHumanFeedback()` →
6. Feedback guardado en Redis `selene:evolution:feedback_history` (RPUSH list)
7. Verificar con `redis.lrange('selene:evolution:feedback_history', 0, -1)`

**Verificaciones:**
- ✅ Redis key `selene:evolution:history` existe
- ✅ ZCARD retorna 2 (2 elementos en sorted set)
- ✅ ZRANGE retorna 2 JSON strings parseables
- ✅ Cada entrada tiene `typeId`, `fibonacciSignature`, `generationTimestamp`
- ✅ Redis key `selene:evolution:feedback_history` existe después de feedback
- ✅ LLEN retorna 1 (1 feedback registrado)
- ✅ Feedback tiene `decisionTypeId`, `humanRating`, `timestamp`

**CRÍTICO:** Este test debe pasar al 100% y validar los 2 fallos de ioredis-mock que tuvimos en tests unitarios.

---

## 🎯 ESTRATEGIA DE MOCKING

### **NO MOCKEAR (usar REAL):**
- ✅ Redis (instancia real en localhost:6379)
- ✅ SeleneEvolutionEngine (código real)
- ✅ Todos los componentes de seguridad (código real)
- ✅ FibonacciPatternEngine (código real)
- ✅ EvolutionaryDecisionGenerator (código real)

### **MOCKEAR (para control):**
- 🎭 RealVeritasInterface (controlar verified/confidence)
- 🎭 SystemVitals (simular diferentes estados del sistema)

---

## 📋 CHECKLIST DE VALIDACIÓN

### **Antes de implementar:**
- [✅] Todos los escenarios tienen inputs/outputs claramente definidos
- [✅] Cada escenario tiene verificaciones concretas (no vagas)
- [✅] Redis real será usado (no ioredis-mock)
- [✅] Setup/teardown definido (beforeEach/afterEach con flushdb)

### **Durante implementación:**
- [ ] Archivo de test creado en `tests/integration/synergy-engine.integration.test.ts`
- [ ] vitest.config.ts NO excluye archivos en tests/integration
- [ ] beforeEach limpia Redis con `flushdb()`
- [ ] afterEach desconecta Redis si es necesario
- [ ] Cada test tiene arrange/act/assert claro

### **Después de implementación:**
- [ ] npm run build → 0 errores
- [ ] npm run test → todos los tests de integración pasan
- [ ] Escenario #8 (Redis REAL) pasa al 100%
- [ ] ChecklistSynergycore.md marcado [✅] Subfase 5.3
- [ ] Reporte final generado con métricas

---

## 🔥 NOTAS DE IMPLEMENTACIÓN

### **Configuración Redis:**
```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  db: 0, // Base de datos 0 para tests
  lazyConnect: true
});

beforeEach(async () => {
  await redis.connect();
  await redis.flushdb(); // Limpiar solo DB 0 (tests)
});

afterEach(async () => {
  await redis.disconnect();
});
```

### **Mock de Veritas:**
```typescript
import { vi } from 'vitest';

const mockVeritas = {
  validateEvolutionClaim: vi.fn().mockResolvedValue({
    verified: true,
    confidence: 0.9,
    timestamp: Date.now()
  })
};

// Inyectar en SeleneEvolutionEngine (constructor o setter)
```

### **Mock de SystemVitals:**
```typescript
const mockSystemVitals = {
  getCurrentMetrics: vi.fn().mockReturnValue({
    cpu: { usage: 0.5, loadAverage: [0.5, 0.4, 0.3], cores: 4 },
    memory: { used: 1000000, total: 8000000, usage: 0.125, free: 7000000 },
    // ... resto de métricas
  }),
  getVitals: vi.fn().mockReturnValue({
    health: 0.9,
    stress: 0.2,
    harmony: 0.8,
    creativity: 0.7,
    timestamp: Date.now()
  })
};
```

---

## ⚡ EXPECTATIVAS DE ÉXITO

- ✅ **100% de tests de integración pasando**
- ✅ **Escenario #8 (Redis REAL) valida los 2 fallos de ioredis-mock**
- ✅ **0 errores de build**
- ✅ **Flujo end-to-end funciona correctamente**
- ✅ **Todos los componentes se integran sin fricción**

---

**PunkClaude - Arquitecto de Integración** 🎸🔥
*"No simulamos integración. La ejecutamos con Redis real y validamos cada bit."*
