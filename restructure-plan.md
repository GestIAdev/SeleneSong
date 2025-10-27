# PLAN DE REESTRUCTURACIÓN SELENE SONG CORE - FASE 3
## ANÁLISIS DE DUPLICADOS Y PLAN DE FUSIÓN

###  ANÁLISIS REALIZADO
- **Selene/ contiene:** 143 archivos
- **Estructura modular completa:** Analytics, Business, Calendar, GraphQL, etc.
- **Archivos comunes:** 106 archivos .ts con nombres idénticos
- **Diferencias:** Selene/ tiene estructura organizada, raíz tiene archivos específicos

###  PLAN DE FUSIÓN RECOMENDADO

#### **ESTRATEGIA: Selene/ como base canónica**
1. **Mantener Selene/** como estructura principal organizada
2. **Fusionar archivos específicos** de la raíz que no existan en Selene/
3. **Resolver conflictos** archivo por archivo (Selene/ tiene prioridad)
4. **Crear nueva estructura src/** basada en Selene/

#### **ARCHIVOS A FUSIONAR:**
- diagnostic-server.ts  Selene/GraphQL/server.ts (si aplica)
- minimal-graphql-server.ts  Selene/GraphQL/ (nueva funcionalidad)
- server-optimized.ts  Selene/GraphQL/server.ts (posible mejora)

#### **ACCIONES INMEDIATAS:**
1. Backup completo del directorio Selene/
2. Análisis detallado de dependencias
3. Creación de estructura src/ basada en Selene/
4. Migración gradual con validación de builds

###  RIESGOS IDENTIFICADOS
- Pérdida de funcionalidad específica de la raíz
- Conflictos de imports durante migración
- Posibles dependencias rotas

###  PRÓXIMOS PASOS
1. Crear backup de Selene/
2. Mapear todas las dependencias
3. Crear estructura src/ 
4. Ejecutar fusión controlada

