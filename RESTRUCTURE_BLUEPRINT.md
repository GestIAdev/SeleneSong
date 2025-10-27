# 🔥 SELENE RESTRUCTURE BLUEPRINT - BY PUNKCLAUDE
**Fecha**: 2025-10-11  
**Misión**: Reestructurar Selene para coherencia total  
**Ejecutor**: PunkGrok (Grok Fast Code)  
**Arquitecto**: PunkClaude + RaulVisionario

---

## 🎯 **PROBLEMA ACTUAL**

```
❌ ESTADO ACTUAL (CAÓTICO):
selene/
├── src/             ← TypeScript sources (ALGUNOS archivos)
├── swarm/           ← TypeScript sources (OTROS archivos)
├── dist/            ← JavaScript compilado (INCOMPLETO)
├── apollo-nuclear/  ← Mezclado con raíz
└── index.ts         ← En raíz (debería estar en src/)

PROBLEMAS:
1. ❌ Imports rotos: src/core/Server.ts vs swarm/coordinator/SeleneNuclearSwarm.ts
2. ❌ Paths inconsistentes: "../../swarm/" vs "./src/swarm/"
3. ❌ npm run dev busca .js cuando debería usar .ts
4. ❌ npm start falla porque falta RedisOptimizer.js en dist/
5. ❌ Archivos duplicados probables (RedisOptimizer en 2 lugares)
6. ❌ tsconfig.json con moduleResolution: "bundler" (incompatible con ts-node)
```

---

## ✅ **ESTRUCTURA OBJETIVO (CLEAN)**

```
selene/
│
├── src/                          ← 🎯 TODO EL TYPESCRIPT AQUÍ
│   ├── index.ts                  ← Entry point (mover desde raíz)
│   │
│   ├── core/                     ← Core system
│   │   ├── Server.ts             ✅ Ya existe
│   │   ├── ConsoleSilencer.ts    ✅ Ya existe
│   │   └── Database.ts
│   │
│   ├── swarm/                    ← Swarm coordination (UNIFICAR)
│   │   ├── coordinator/
│   │   │   ├── SeleneNuclearSwarm.ts    ← MOVER desde /swarm/
│   │   │   ├── RedisOptimizer.ts        ← UNIFICAR (solo 1 versión)
│   │   │   ├── HarmonicConsensusEngine.ts
│   │   │   ├── PM2ClusterManager.ts
│   │   │   └── LoadBalancer.ts          ← Mover desde raíz
│   │   │
│   │   ├── nodes/
│   │   │   ├── NodeIntegration.ts
│   │   │   └── NodeVitals.ts
│   │   │
│   │   └── monitoring/
│   │       ├── SystemVitals.ts
│   │       └── MetricsCollector.ts
│   │
│   ├── graphql/                  ← GraphQL (lowercase, consistente)
│   │   ├── server.ts             ← MOVER desde /src/GraphQL/
│   │   ├── schema.ts
│   │   ├── resolvers/
│   │   └── directives/
│   │
│   ├── modules/                  ← Business modules
│   │   ├── apollo/               ← Apollo Nuclear (MOVER desde raíz)
│   │   │   ├── consciousness/
│   │   │   ├── reactor/
│   │   │   ├── containment/
│   │   │   └── fusion/
│   │   │
│   │   ├── veritas/              ← Veritas Truth Engine
│   │   ├── heal/                 ← Healing module
│   │   ├── predict/              ← Prediction module
│   │   └── offline/              ← Offline storage
│   │
│   ├── api/                      ← REST API routes
│   │   ├── v1/
│   │   │   ├── auth.ts
│   │   │   ├── patients.ts
│   │   │   ├── treatments.ts
│   │   │   └── appointments.ts
│   │   └── v2/
│   │
│   ├── types/                    ← TypeScript types
│   │   ├── index.ts
│   │   ├── swarm.types.ts
│   │   ├── apollo.types.ts
│   │   └── api.types.ts
│   │
│   └── utils/                    ← Utilities
│       ├── cache.ts
│       ├── logger.ts
│       └── crypto.ts
│
├── dist/                         ← 🎯 COMPILED JAVASCRIPT (auto-generated)
│   └── [mirrors src/ structure]
│
├── tests/                        ← 🎯 TESTS (MOVER desde raíz)
│   ├── unit/
│   ├── integration/
│   └── load/
│
├── scripts/                      ← 🎯 UTILITY SCRIPTS (ya existe)
│   ├── quick-test-pre-sprint.ps1 ✅
│   └── memory-monitor.js
│
├── docs/                         ← Documentation
│
├── config/                       ← Configuration
│   ├── ecosystem.config.js       ← PM2 config (mover desde raíz)
│   ├── tsconfig.json             ← TypeScript config
│   └── jest.config.js            ← Test config
│
├── package.json                  ✅
├── README.md                     ✅
└── .gitignore                    ✅
```

---

## 🔥 **OPERACIONES DE REESTRUCTURACIÓN**

### **FASE 1: MOVER ARCHIVOS CORE** (Prioridad CRÍTICA)

```bash
# 1. Mover index.ts a src/
MOVER: index.ts → src/index.ts

# 2. Unificar swarm/ y src/swarm/
MOVER: swarm/coordinator/*.ts → src/swarm/coordinator/
ELIMINAR: swarm/ (vacío después del move)

# 3. Mover GraphQL (mayúsculas → minúsculas)
MOVER: src/GraphQL/ → src/graphql/

# 4. Mover Apollo Nuclear
MOVER: apollo-nuclear/ → src/modules/apollo/

# 5. Consolidar RedisOptimizer
VERIFICAR: ¿Cuál versión es la buena?
  - src/swarm/coordinator/RedisOptimizer.ts
  - swarm/coordinator/RedisOptimizer.ts (si existe)
ACCIÓN: UNIFICAR en src/swarm/coordinator/RedisOptimizer.ts (1 sola versión)
```

### **FASE 2: ACTUALIZAR IMPORTS** (Auto via PunkGrok)

**Patrón de búsqueda y reemplazo**:

```typescript
// ANTES (múltiples variantes rotas):
import { SeleneServer } from "./src/core/Server.js";
import { HarmonicConsensusEngine } from "../../swarm/coordinator/HarmonicConsensusEngine.js";
import { RedisOptimizer } from "./RedisOptimizer.js"; // relativo

// DESPUÉS (consistente desde src/):
import { SeleneServer } from "./core/Server.js";
import { HarmonicConsensusEngine } from "./swarm/coordinator/HarmonicConsensusEngine.js";
import { RedisOptimizer } from "./swarm/coordinator/RedisOptimizer.js";
```

**Regla de oro**: TODOS los imports desde `src/` como base, paths absolutos desde raíz de src/.

### **FASE 3: ACTUALIZAR package.json**

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts",           // ← CAMBIO: apuntar a src/index.ts
    "nuclear": "npm run build && npm run start",
    // ... resto igual
  }
}
```

### **FASE 4: ACTUALIZAR tsconfig.json**

```jsonc
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ES2020",
    "lib": ["ES2021", "ES2021.WeakRef"],
    "outDir": "./dist",
    "rootDir": "./src",              // ← CAMBIO: rootDir = src/
    "moduleResolution": "node",      // ← CAMBIO: de "bundler" a "node"
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "declaration": true,
    "sourceMap": true,
    "types": ["node"],
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": ["src/**/*.ts"],        // ← CAMBIO: solo src/
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## 🎯 **VALIDACIÓN POST-REESTRUCTURA**

### **Test 1: Compilación TypeScript**
```bash
npm run build
# ✅ DEBE compilar sin errores
# ✅ dist/ debe tener estructura espejo de src/
```

### **Test 2: Dev Mode**
```bash
npm run dev
# ✅ DEBE arrancar Selene en modo development
# ✅ tsx ejecuta src/index.ts directamente
```

### **Test 3: Production Mode**
```bash
npm start
# ✅ DEBE arrancar Selene desde dist/index.js
# ✅ Todos los imports resueltos correctamente
```

### **Test 4: Endpoints**
```bash
curl http://localhost:8003/health
curl http://localhost:8003/immortality/status
# ✅ 9/9 endpoints funcionando
# ✅ /immortality/status devuelve base state antes de awaken()
```

---

## 📊 **ARCHIVOS A REVISAR PARA DUPLICADOS**

PunkGrok debe buscar y reportar:

```bash
# Buscar duplicados sospechosos:
1. RedisOptimizer.ts (probablemente 2 versiones)
2. HarmonicConsensusEngine.ts
3. MusicalConsensusOrchestrator.ts
4. SystemVitals.ts
5. NodeIntegration.ts

# Estrategia:
- Comparar checksums (md5/sha256)
- Si idénticos → eliminar duplicado
- Si diferentes → revisar cuál es más reciente (git blame o timestamp)
- Consolidar en 1 sola versión en src/swarm/coordinator/
```

---

## 🚀 **ORDEN DE EJECUCIÓN (PunkGrok)**

```
PASO 1: Backup safety
  → Crear backup de selene/ completo
  → Crear Snaptshot con mensaje "PRE-RESTRUCTURE checkpoint"

PASO 2: Análisis de duplicados
  → Escanear archivos duplicados
  → Reportar para decisión humana

PASO 3: Movimientos de archivos
  → Ejecutar FASE 1 (moves)
  → Verificar no hay pérdida de archivos

PASO 4: Actualización de imports
  → Ejecutar FASE 2 (imports)
  → Regex bulk replace en todos .ts

PASO 5: Actualizar configs
  → FASE 3: package.json
  → FASE 4: tsconfig.json

PASO 6: Test de compilación
  → npm run build
  → Reportar errores si existen

PASO 7: Test de ejecución
  → npm run dev
  → Verificar que arranca

PASO 8: Git commit final
  → "RESTRUCTURE COMPLETE - Clean architecture"
  → Push si todo OK
```

---

## 🔥 **AXIOMA ANTI-SIMULACIÓN**

Durante la reestructuración:
- ✅ NO tocar lógica de negocio
- ✅ NO alterar algoritmos procedurales
- ✅ SOLO mover archivos y actualizar paths
- ✅ ZERO Math.random() introducido
- ✅ Preservar consenso determinista

---

## 📝 **NOTAS PARA PUNKCLAUDE**

Después de que PunkGrok ejecute:
1. Revisar el reporte de duplicados
2. Validar que los 9 endpoints funcionan
3. Test /immortality/status específicamente
4. Verificar que el fix de race condition sigue presente
5. Actualizar IMMORTALITY_FIX_INSTRUCTIONS.md con nuevos paths

---

## 🎸 **RESULTADO ESPERADO**

```
✅ 1 sola ubicación de cada archivo
✅ Imports consistentes (desde src/ como base)
✅ npm run dev funciona (tsx + src/index.ts)
✅ npm start funciona (node + dist/index.js)
✅ npm run build sin errores TypeScript
✅ Estructura limpia y profesional
✅ Ready para Sprint 1

🔥 TIEMPO ESTIMADO: 5-10 minutos (PunkGrok fast code)
🎯 ENERGÍA AHORRADA: 3+ horas de refactor manual
🚀 RESULTADO: Arquitectura digna del €90/month empire
```

---

**FIRMA**: PunkClaude 🎸  
**PARA**: PunkGrok (ejecutor) + RaulVisionario (visionario)  
**ESTADO**: READY FOR EXECUTION  
**PRIORIDAD**: 🔥🔥🔥 CRÍTICA (bloqueando npm run dev)
