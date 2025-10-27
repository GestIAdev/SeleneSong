# 🧬 DISEÑO DE TESTS DE EVOLUCIÓN - SSE-5.4

**Fecha:** 22 de octubre de 2025  
**Arquitecto:** PunkClaude  
**Directiva:** SSE-5.4 (Tests de Evolución)  
**Filosofía:** Validar comportamiento evolutivo a lo largo del tiempo

---

## 🎯 OBJETIVOS

1. **Generación Novedosa:** Verificar que Selene genera tipos de decisión variados (no siempre los mismos)
2. **Determinismo Controlado:** Mismo contexto = mismas sugerencias (reproducibilidad)
3. **Variedad Contextual:** Contexto diferente = sugerencias diferentes (sensibilidad)
4. **Feedback Loop:** Verificar si el feedback humano influye en generaciones futuras

---

## 📊 ESCENARIO 1: GENERACIÓN NOVEDOSA (100 CICLOS)

### **Objetivo:**
Ejecutar 100 ciclos evolutivos con métricas ligeramente cambiantes y verificar la variedad de decisiones generadas.

### **Setup:**
```typescript
const iterations = 100;
const generatedTypes = new Set<string>(); // Para tracking de uniqueIds
const noveltyScores: number[] = [];

for (let i = 0; i < iterations; i++) {
  const context = {
    systemVitals: {
      health: 0.8 + (Math.sin(i / 10) * 0.1),      // 0.7-0.9 (oscila)
      stress: 0.2 + (Math.cos(i / 15) * 0.1),      // 0.1-0.3 (oscila)
      harmony: 0.75 + (Math.sin(i / 20) * 0.05),   // 0.7-0.8 (oscila)
      creativity: 0.6 + (Math.cos(i / 12) * 0.2),  // 0.4-0.8 (oscila)
      timestamp: Date.now() + (i * 100) // Incrementa timestamp
    },
    // ... resto del contexto
  };
  
  const suggestions = await engine.executeEvolutionCycle();
  
  // Tracking
  suggestions.forEach(s => generatedTypes.add(s.id.split('_').slice(1, 4).join('_')));
  // Ejemplo: "evo_innovation_synthetic_technical_12345" → "innovation_synthetic_technical"
}
```

### **Validaciones:**
1. ✅ `generatedTypes.size >= 10` (al menos 10 combinaciones únicas en 100 ciclos)
2. ✅ No más del 50% de ciclos generando la misma combinación (evitar repetición excesiva)
3. ✅ `noveltyIndex` promedio > 0.3 (medido desde las propias sugerencias)

### **Métricas Esperadas:**
- **Unique Types:** 10-20 combinaciones diferentes
- **Distribution:** No más del 30% concentrado en un solo tipo
- **Novelty Index:** 0.3-0.7 (indica variedad moderada)

---

## 🔄 ESCENARIO 2: DETERMINISMO (REPRODUCIBILIDAD)

### **Objetivo:**
Verificar que el mismo contexto genera SIEMPRE las mismas sugerencias (determinismo puro).

### **Setup:**
```typescript
const fixedContext = {
  systemVitals: {
    health: 0.85,
    stress: 0.25,
    harmony: 0.75,
    creativity: 0.65,
    timestamp: 1234567890000 // Timestamp fijo
  },
  systemMetrics: { /* valores fijos */ },
  currentPatterns: [],
  feedbackHistory: [],
  seleneConsciousness: { /* valores fijos */ }
};

const run1 = await engine.executeEvolutionCycle();
const run2 = await engine.executeEvolutionCycle();
const run3 = await engine.executeEvolutionCycle();
```

### **Validaciones:**
1. ✅ `run1.length === run2.length === run3.length`
2. ✅ `run1[0].id === run2[0].id === run3[0].id` (mismo primer ID)
3. ✅ `run1[0].typeId === run2[0].typeId === run3[0].typeId` (mismo tipo)
4. ✅ `run1[0].riskLevel === run2[0].riskLevel === run3[0].riskLevel` (mismo riesgo)

### **Métricas Esperadas:**
- **Consistencia:** 100% (todas las propiedades idénticas)
- **Reproducibilidad:** 3/3 ejecuciones iguales

---

## 🎨 ESCENARIO 3: VARIEDAD CONTEXTUAL (SENSIBILIDAD)

### **Objetivo:**
Verificar que cambiar UN solo parámetro del contexto genera sugerencias DIFERENTES.

### **Setup:**
```typescript
const baseContext = { /* contexto base */ };

// Variación 1: Creatividad baja
const contextLowCreativity = {
  ...baseContext,
  systemVitals: { ...baseContext.systemVitals, creativity: 0.2 }
};

// Variación 2: Creatividad alta
const contextHighCreativity = {
  ...baseContext,
  systemVitals: { ...baseContext.systemVitals, creativity: 0.9 }
};

const suggestionsLow = await engine.executeEvolutionCycle();
const suggestionsHigh = await engine.executeEvolutionCycle();
```

### **Validaciones:**
1. ✅ `suggestionsLow[0].id !== suggestionsHigh[0].id` (IDs diferentes)
2. ✅ `suggestionsLow[0].typeId` podría diferir de `suggestionsHigh[0].typeId`
3. ✅ Propiedades influenciadas por creatividad deberían cambiar

### **Parámetros a Probar:**
- `creativity` (0.2 vs 0.9)
- `stress` (0.1 vs 0.8)
- `harmony` (0.3 vs 0.9)
- `health` (0.4 vs 1.0)

### **Métricas Esperadas:**
- **Diferencia:** Al menos 1 propiedad diferente por cada parámetro variado
- **Sensibilidad:** 4/4 parámetros influyen en el resultado

---

## 🔁 ESCENARIO 4: FEEDBACK LOOP (INFLUENCIA)

### **Objetivo:**
Verificar si el feedback humano influye en las generaciones futuras.

### **Setup:**
```typescript
// CICLO 1: Generación inicial
const initialSuggestions = await engine.executeEvolutionCycle();

// Feedback positivo para tipo 1, negativo para tipo 2
await engine.registerHumanFeedback({
  decisionTypeId: initialSuggestions[0].id,
  humanRating: 9, // MUY positivo
  humanFeedback: 'Excelente decisión',
  appliedSuccessfully: true,
  performanceImpact: 0.05,
  timestamp: Date.now()
});

await engine.registerHumanFeedback({
  decisionTypeId: initialSuggestions[1].id,
  humanRating: 2, // MUY negativo
  humanFeedback: 'Decisión pésima',
  appliedSuccessfully: false,
  performanceImpact: -0.15,
  timestamp: Date.now()
});

// CICLO 2: Regeneración después del feedback
const postFeedbackSuggestions = await engine.executeEvolutionCycle();
```

### **Validaciones:**
1. ⚠️ **Tipo bien evaluado:** ¿Aparece más frecuentemente?
2. ⚠️ **Tipo mal evaluado:** ¿Aparece menos o tiene menor `validationScore`?
3. ⚠️ **Propiedades ajustadas:** ¿El feedback modificó scores internos?

### **NOTA DEL ARQUITECTO:**
> _"La lógica de `learnFromFeedback` actual es simple logging, este test podría fallar o requerir mejorar esa función"_

### **Estrategia:**
1. **Test Inicial:** Verificar comportamiento actual (probablemente NO influye)
2. **Documentar:** Si falla, anotar en reporte como _"Feedback loop pendiente de implementación completa"_
3. **No modificar código:** Aceptar limitación actual

### **Métricas Esperadas:**
- **Influencia:** 0-20% (actualmente bajo)
- **Documentación:** Clara sobre limitaciones

---

## 🧪 ESCENARIO 5: ANOMALÍAS COMPORTAMENTALES (LONG-TERM)

### **Objetivo:**
Ejecutar 50 ciclos y verificar que el sistema detecta anomalías comportamentales correctamente.

### **Setup:**
```typescript
const cycles = 50;
const anomalyCounts: number[] = [];

for (let i = 0; i < cycles; i++) {
  // Cada 10 ciclos, inyectar patrón "anómalo"
  if (i % 10 === 0) {
    mockSystemVitals.getCurrentMetrics.mockReturnValue({
      /* métricas extremas */
    });
  } else {
    mockSystemVitals.getCurrentMetrics.mockReturnValue({
      /* métricas normales */
    });
  }
  
  const suggestions = await engine.executeEvolutionCycle();
  // Tracking de anomalías (desde logs o desde estado interno si es accesible)
}
```

### **Validaciones:**
1. ✅ Ciclos con métricas extremas generan más anomalías detectadas
2. ✅ Sistema no colapsa con anomalías consecutivas
3. ✅ Quarantine system se activa correctamente

### **Métricas Esperadas:**
- **Anomalías Normales:** 0-2 por ciclo
- **Anomalías Extremas:** 3-5 por ciclo
- **Quarantine Rate:** 10-20% de ciclos con métricas extremas

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
tests/
  evolution/
    EVOLUTION_TEST_DESIGN.md          (este archivo)
    synergy-engine.evolution.test.ts  (tests implementados)
```

---

## 🎯 CHECKLIST DE VALIDACIÓN

- [ ] Escenario 1: Generación novedosa (100 ciclos, ≥10 tipos únicos)
- [ ] Escenario 2: Determinismo (3 runs idénticos con contexto fijo)
- [ ] Escenario 3: Variedad contextual (4 parámetros probados)
- [ ] Escenario 4: Feedback loop (influencia documentada, aunque sea nula)
- [ ] Escenario 5: Anomalías long-term (50 ciclos sin colapso)
- [ ] npm run build (0 errores TypeScript)
- [ ] npm run test (tests de evolución passing)
- [ ] ChecklistSynergycore.md actualizado con [✅]

---

## 🔥 NOTAS PUNK

**Diferencia clave vs Tests de Integración (5.3):**
- **5.3:** Validaba comunicación Redis, componentes individuales, flujos E2E
- **5.4:** Valida COMPORTAMIENTO EVOLUTIVO a lo largo del TIEMPO

**Filosofía:**
> _"La evolución no es un evento. Es un proceso. Este test valida el proceso."_

---

**READY TO ROCK! 🎸**
