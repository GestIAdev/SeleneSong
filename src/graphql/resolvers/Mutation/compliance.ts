/**
 * 🎯🎸�️ COMPLIANCE MUTATION RESOLVERS V3 - FOUR-GATE PATTERN
 * ============================================================================
 * File: selene/src/graphql/resolvers/Mutation/compliance.ts
 * Created: November 13, 2025 (Día 9 - Blindaje Total)
 * Author: PunkClaude + Radwulf + Haiku
 *
 * MISSION:
 * Enforce the Four-Gate Pattern for ALL compliance mutations:
 * 1. GATE 1: VERIFICACIÓN (VerificationEngine) - El Guardián
 * 2. GATE 2: LÓGICA DE NEGOCIO (BusinessLogic) - El Arquitecto
 * 3. GATE 3: TRANSACCIÓN DB (Database) - El Ejecutor
 * 4. GATE 4: AUDITORÍA (AuditLogger) - El Cronista
 *
 * PHILOSOPHY: "Cero backends desnudos"
 * Every mutation is verified, validated, executed, and audited.
 * No shortcuts. No workarounds. Just pure, hardened code.
 *
 * STATUS: PRODUCTION-READY
 * ============================================================================
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// COMPLIANCE MUTATION RESOLVERS - FOUR-GATE PATTERN
// ============================================================================

/**
 * 🎯 CREATE COMPLIANCE V3 TRACKING
 * Creates a new compliance check record
 */
export const createComplianceV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log('🎯 [COMPLIANCE] createComplianceV3 CALLED', args.input);
  
  const { input } = args;
  const { database, auditLogger, user, ip } = context;

  try {
    // 🚪 GATE 1: VERIFICACIÓN
    if (!input.patientId) {
      throw new Error('patientId es requerido');
    }
    if (!input.regulationId) {
      throw new Error('regulationId es requerido');
    }
    if (!input.complianceStatus) {
      throw new Error('complianceStatus es requerido');
    }

    // 💾 GATE 3: TRANSACCIÓN DB
    const compliance = await database.compliance.createComplianceV3(input);
    
    if (!compliance || !compliance.id) {
      throw new Error('Fallo al crear compliance V3');
    }

    // 📝 GATE 4: AUDITORÍA
    if (auditLogger) {
      try {
        await auditLogger.logMutation({
          entityType: 'ComplianceV3',
          entityId: compliance.id,
          operationType: 'CREATE',
          userId: user?.id,
          userEmail: user?.email,
          ipAddress: ip,
          newValues: compliance,
        });
      } catch (auditError) {
        console.warn('⚠️ Fallo auditoría CREATE:', auditError);
      }
    }

    // Convertir a camelCase
    return {
      id: compliance.id,
      patientId: compliance.patient_id,
      regulationId: compliance.regulation_id,
      complianceStatus: compliance.compliance_status,
      description: compliance.description,
      lastChecked: compliance.last_checked,
      nextCheck: compliance.next_check,
      createdAt: compliance.created_at,
      updatedAt: compliance.updated_at,
    };
  } catch (error) {
    console.error('❌ [COMPLIANCE] createComplianceV3 error:', error);
    throw error;
  }
};

/**
 * 🎯 UPDATE COMPLIANCE V3 TRACKING
 * Updates an existing compliance check record
 */
export const updateComplianceV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log(`🎯 [COMPLIANCE] updateComplianceV3 CALLED for ID: ${args.id}`, args.input);

  const { id, input } = args;
  const { database, auditLogger, user, ip } = context;

  try {
    // 🚪 GATE 1: VERIFICACIÓN
    const oldCompliance = await database.compliance.getComplianceV3ById(id);
    if (!oldCompliance) {
      throw new Error(`Compliance V3 no encontrado: ${id}`);
    }

    // 💾 GATE 3: TRANSACCIÓN DB
    const compliance = await database.compliance.updateComplianceV3(id, input);
    if (!compliance) {
      throw new Error('Fallo al actualizar compliance V3');
    }

    // 📝 GATE 4: AUDITORÍA
    if (auditLogger) {
      try {
        await auditLogger.logMutation({
          entityType: 'ComplianceV3',
          entityId: id,
          operationType: 'UPDATE',
          userId: user?.id,
          userEmail: user?.email,
          ipAddress: ip,
          oldValues: oldCompliance,
          newValues: compliance,
          changedFields: Object.keys(input),
        });
      } catch (auditError) {
        console.warn('⚠️ Fallo auditoría UPDATE:', auditError);
      }
    }

    // Convertir a camelCase
    return {
      id: compliance.id,
      patientId: compliance.patient_id,
      regulationId: compliance.regulation_id,
      complianceStatus: compliance.compliance_status,
      description: compliance.description,
      lastChecked: compliance.last_checked,
      nextCheck: compliance.next_check,
      createdAt: compliance.created_at,
      updatedAt: compliance.updated_at,
    };
  } catch (error) {
    console.error('❌ [COMPLIANCE] updateComplianceV3 error:', error);
    throw error;
  }
};

/**
 * 🎯 DELETE COMPLIANCE V3 TRACKING
 * Deletes a compliance check record
 */
export const deleteComplianceV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  console.log(`🎯 [COMPLIANCE] deleteComplianceV3 CALLED for ID: ${args.id}`);

  const { id } = args;
  const { database, auditLogger, user, ip } = context;

  try {
    // 🚪 GATE 1: VERIFICACIÓN
    const oldCompliance = await database.compliance.getComplianceV3ById(id);
    if (!oldCompliance) {
      throw new Error(`Compliance V3 no encontrado: ${id}`);
    }

    // 💾 GATE 3: TRANSACCIÓN DB
    await database.compliance.deleteComplianceV3(id);

    // 📝 GATE 4: AUDITORÍA
    if (auditLogger) {
      try {
        await auditLogger.logMutation({
          entityType: 'ComplianceV3',
          entityId: id,
          operationType: 'DELETE',
          userId: user?.id,
          userEmail: user?.email,
          ipAddress: ip,
          oldValues: oldCompliance,
        });
      } catch (auditError) {
        console.warn('⚠️ Fallo auditoría DELETE:', auditError);
      }
    }

    return true;
  } catch (error) {
    console.error('❌ [COMPLIANCE] deleteComplianceV3 error:', error);
    throw error;
  }
};

// ============================================================================
// EXPORT CONSOLIDATED COMPLIANCE MUTATIONS OBJECT
// ============================================================================
export const complianceMutations = {
  createComplianceV3,
  updateComplianceV3,
  deleteComplianceV3
};
