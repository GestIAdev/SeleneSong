/**
 * ⚖️ PENTAGON LEGAL MUTATIONS
 * ============================================================================
 * File: selene/src/graphql/resolvers/Mutation/pentagonLegal.ts
 * Created: November 28, 2025
 * Author: PunkClaude + Radwulf
 *
 * MISSION: Seed compliance rules and run compliance checks
 *
 * STATUS: PRODUCTION-READY
 * ============================================================================
 */

import type { GraphQLContext } from '../../types.js';
import { ComplianceService } from '../../../services/ComplianceService.js';

// ============================================================================
// SEED COMPLIANCE DEFAULTS
// ============================================================================

export const seedComplianceDefaults = async (
  _: unknown,
  _args: unknown,
  context: GraphQLContext
): Promise<{ success: boolean; rulesSeeded: number; documentsSeeded: number; message: string }> => {
  console.log('⚖️ [PENTAGON] seedComplianceDefaults mutation - IGNITION');
  
  const pool = context.database.getPool();
  
  try {
    // ========================================================================
    // STEP 0: CREATE TABLES IF NOT EXIST
    // ========================================================================
    console.log('⚖️ [PENTAGON] Checking/creating tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS compliance_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        jurisdiction VARCHAR(50) NOT NULL,
        regulation_reference VARCHAR(255),
        category VARCHAR(50) NOT NULL,
        check_type VARCHAR(50) NOT NULL,
        check_query TEXT,
        expected_result VARCHAR(255),
        severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
        weight INTEGER NOT NULL DEFAULT 50,
        failure_penalty INTEGER NOT NULL DEFAULT 10,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS legal_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        jurisdiction VARCHAR(50) NOT NULL,
        category VARCHAR(50) NOT NULL,
        document_type VARCHAR(50) NOT NULL,
        content_markdown TEXT,
        file_path VARCHAR(500),
        external_url VARCHAR(500),
        version VARCHAR(20) DEFAULT '1.0.0',
        effective_date DATE,
        is_mandatory BOOLEAN DEFAULT false,
        is_template BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('⚖️ [PENTAGON] Tables ready');

    // Check if rules already exist
    const existingRules = await pool.query('SELECT COUNT(*) FROM compliance_rules');
    const rulesCount = parseInt(existingRules.rows[0].count);
    
    if (rulesCount > 0) {
      return {
        success: true,
        rulesSeeded: 0,
        documentsSeeded: 0,
        message: `Sistema ya inicializado con ${rulesCount} reglas. No se requiere seeding.`
      };
    }

    // ========================================================================
    // SEED COMPLIANCE RULES
    // ========================================================================
    const rulesInserted = await pool.query(`
      INSERT INTO compliance_rules (
        code, name, description, jurisdiction, regulation_reference,
        category, check_type, check_query, expected_result,
        severity, weight, failure_penalty, is_active
      ) VALUES
      -- GDPR Rules (EU)
      ('GDPR-CONSENT-001', 'Consentimiento Explícito', 
       'Todo paciente debe tener consentimiento de tratamiento registrado',
       'EU', 'GDPR Art. 6, 9', 'DATA_CONSENT', 'SQL_QUERY',
       'SELECT COUNT(*) FROM patients WHERE consent_to_treatment = false AND deleted_at IS NULL',
       '0', 'CRITICAL', 100, 25, true),
       
      ('GDPR-AUDIT-001', 'Trazabilidad de Accesos',
       'Debe existir registro de todos los accesos a datos sensibles',
       'EU', 'GDPR Art. 30', 'SECURITY', 'EXISTS_CHECK',
       'SELECT EXISTS(SELECT 1 FROM data_audit_logs LIMIT 1)',
       'true', 'HIGH', 80, 20, true),
       
      ('GDPR-RETENTION-001', 'Política de Retención',
       'Los datos no deben conservarse más tiempo del necesario',
       'EU', 'GDPR Art. 5(1)(e)', 'RETENTION', 'SQL_QUERY',
       'SELECT COUNT(*) FROM patients WHERE deleted_at IS NOT NULL AND deleted_at < CURRENT_DATE - INTERVAL ''7 years''',
       '0', 'MEDIUM', 60, 15, true),
       
      -- Argentina Rules (Ley 25.326)
      ('AR-HABEAS-001', 'Derecho de Acceso',
       'Los titulares pueden solicitar información sobre sus datos',
       'AR', 'Ley 25.326 Art. 14', 'PATIENT_RIGHTS', 'MANUAL',
       NULL, 'documented', 'HIGH', 70, 15, true),
       
      ('AR-CONSENT-001', 'Consentimiento Informado',
       'El tratamiento de datos sensibles requiere consentimiento expreso',
       'AR', 'Ley 25.326 Art. 5, 7', 'DATA_CONSENT', 'SQL_QUERY',
       'SELECT COUNT(*) FROM patients WHERE consent_to_treatment = false AND deleted_at IS NULL',
       '0', 'CRITICAL', 100, 25, true),
       
      -- Universal Security Rules
      ('SEC-ENCRYPT-001', 'Cifrado en Tránsito',
       'Todas las comunicaciones deben estar cifradas (HTTPS)',
       'GLOBAL', 'ISO 27001', 'SECURITY', 'MANUAL',
       NULL, 'configured', 'CRITICAL', 90, 20, true),
       
      ('SEC-AUTH-001', 'Autenticación Segura',
       'Usuarios deben autenticarse antes de acceder a datos',
       'GLOBAL', 'ISO 27001', 'SECURITY', 'EXISTS_CHECK',
       'SELECT EXISTS(SELECT 1 FROM users WHERE role IS NOT NULL LIMIT 1)',
       'true', 'CRITICAL', 95, 25, true)
       
      ON CONFLICT (code) DO NOTHING
      RETURNING id
    `);
    
    // ========================================================================
    // SEED LEGAL DOCUMENTS
    // ========================================================================
    const docsInserted = await pool.query(`
      INSERT INTO legal_documents (
        code, title, description, jurisdiction, category, document_type,
        content_markdown, version, is_mandatory, is_template
      ) VALUES
      ('GDPR-INFO', 'Información sobre GDPR',
       'Reglamento General de Protección de Datos de la Unión Europea',
       'EU', 'DATA_PRIVACY', 'REGULATION',
       '# GDPR - Reglamento General de Protección de Datos

## Artículo 9 - Tratamiento de categorías especiales de datos personales

1. Quedan prohibidos el tratamiento de datos personales que revelen el origen étnico o racial, las opiniones políticas, las convicciones religiosas o filosóficas, o la afiliación sindical, y el tratamiento de datos genéticos, datos biométricos dirigidos a identificar de manera unívoca a una persona física, **datos relativos a la salud** o datos relativos a la vida sexual o las orientación sexuales de una persona física.

2. El apartado 1 no será de aplicación cuando concurra una de las circunstancias siguientes:
   - a) el interesado dio su **consentimiento explícito**
   - h) el tratamiento es necesario para fines de **medicina preventiva o laboral**

## Implicaciones para Dentiagest
- ✅ Consentimiento explícito obligatorio
- ✅ Cifrado de datos en reposo y tránsito
- ✅ Derecho al olvido implementado
- ✅ Trazabilidad de accesos',
       '1.0.0', true, false),
       
      ('AR-25326-INFO', 'Ley 25.326 - Protección de Datos Personales',
       'Legislación argentina sobre protección de datos personales',
       'AR', 'DATA_PRIVACY', 'REGULATION',
       '# Ley 25.326 - Protección de Datos Personales (Argentina)

## Artículo 5 - Consentimiento
1. El tratamiento de datos personales es ilícito cuando el titular no hubiere prestado su consentimiento libre, expreso e informado.

## Artículo 7 - Datos Sensibles
Los datos sensibles sólo pueden ser tratados cuando:
- Existan razones de **interés general** autorizadas por ley
- Con finalidades **estadísticas o científicas**
- Cuando el titular haya prestado su **consentimiento expreso**

## Artículo 8 - Datos de Salud
Los establecimientos sanitarios pueden tratar datos de salud de sus pacientes siempre que se resguarde:
- La **identidad de los pacientes**
- La **confidencialidad de la información**',
       '1.0.0', true, false),
       
      ('PRIVACY-POLICY', 'Política de Privacidad - Plantilla',
       'Plantilla de política de privacidad para clínicas',
       'GLOBAL', 'DATA_PRIVACY', 'TEMPLATE',
       '# Política de Privacidad

## 1. Responsable del Tratamiento
[Nombre de la Clínica], con domicilio en [Dirección].

## 2. Datos que Recopilamos
- Datos de identificación (nombre, DNI, fecha de nacimiento)
- Datos de contacto (teléfono, email, dirección)
- Datos de salud (historial clínico, tratamientos, radiografías)

## 3. Finalidad del Tratamiento
- Prestación de servicios de salud dental
- Gestión administrativa y facturación
- Comunicaciones relacionadas con su atención

## 4. Base Legal
- Consentimiento del interesado
- Ejecución de contrato de servicios médicos

## 5. Derechos del Paciente
Puede ejercer sus derechos de acceso, rectificación, supresión y portabilidad contactando a [email].',
       '1.0.0', false, true)
       
      ON CONFLICT (code) DO NOTHING
      RETURNING id
    `);

    return {
      success: true,
      rulesSeeded: rulesInserted.rowCount || 0,
      documentsSeeded: docsInserted.rowCount || 0,
      message: `⚡ IGNICIÓN COMPLETA: ${rulesInserted.rowCount || 0} reglas + ${docsInserted.rowCount || 0} documentos cargados`
    };
    
  } catch (error) {
    console.error('❌ [PENTAGON] Seed failed:', error);
    throw new Error(`Error al inicializar sistema legal: ${(error as Error).message}`);
  }
};

// ============================================================================
// RUN COMPLIANCE CHECK
// ============================================================================

export const runComplianceCheck = async (
  _: unknown,
  args: { clinicId?: string; jurisdiction?: string },
  context: GraphQLContext
): Promise<{ success: boolean; score: number; message: string }> => {
  console.log('⚖️ [PENTAGON] runComplianceCheck mutation - CALCULATING');
  
  const clinicId = args.clinicId || 'default';
  const service = new ComplianceService(context.database.getPool());
  
  try {
    const result = await service.calculateComplianceScore(clinicId, args.jurisdiction);
    
    return {
      success: true,
      score: result.overall_score,
      message: `✅ Score calculado: ${result.overall_score.toFixed(1)}% (${result.rules_passed}/${result.total_rules} reglas)`
    };
  } catch (error) {
    console.error('❌ [PENTAGON] Compliance check failed:', error);
    throw new Error(`Error al calcular compliance: ${(error as Error).message}`);
  }
};

// ============================================================================
// EXPORT
// ============================================================================

export const pentagonLegalMutations = {
  seedComplianceDefaults,
  runComplianceCheck
};
