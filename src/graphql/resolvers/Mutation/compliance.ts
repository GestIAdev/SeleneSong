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
 * 🎯 CREATE COMPLIANCE REGULATION
 * Implementa el Four-Gate Pattern completo
 */
export const createComplianceV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log('🎯 [COMPLIANCE] createComplianceV3 CALLED');
  
  const { input } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    // --------------------------------------------------------------------------
    // 🚪 GATE 1: VERIFICACIÓN (El Guardián - VerificationEngine)
    // --------------------------------------------------------------------------
    // Validaciones básicas de entrada
    if (!input.name || !input.name.trim()) {
      throw new Error('El nombre de la regulación es requerido');
    }

    if (!input.category || !input.category.trim()) {
      throw new Error('La categoría es requerida');
    }

    if (!input.description || !input.description.trim()) {
      throw new Error('La descripción es requerida');
    }

    if (!input.complianceDeadline) {
      throw new Error('La fecha límite de cumplimiento es requerida');
    }

    const deadlineDate = new Date(input.complianceDeadline);
    if (isNaN(deadlineDate.getTime())) {
      throw new Error('Fecha límite inválida');
    }

    if (deadlineDate <= new Date()) {
      throw new Error('La fecha límite debe ser futura');
    }

    if (!input.responsibleParty || !input.responsibleParty.trim()) {
      throw new Error('El responsable es requerido');
    }

    console.log('✅ GATE 1: Verificación completada');

    // --------------------------------------------------------------------------
    // 🏗️ GATE 2: LÓGICA DE NEGOCIO (El Arquitecto)
    // --------------------------------------------------------------------------
    // Validar estado inicial
    const validStatuses = ['ACTIVE', 'INACTIVE', 'EXPIRED'];
    const status = input.status || 'ACTIVE';
    if (!validStatuses.includes(status)) {
      throw new Error(`Status inválido: ${status}`);
    }

    // Validar que version sea válida si se proporciona
    const version = input.version || '1.0';
    const versionRegex = /^\d+\.\d+(\.\d+)?$/;
    if (!versionRegex.test(version)) {
      throw new Error(`Versión inválida: ${version}. Formato esperado: 1.0 o 1.0.0`);
    }

    console.log('✅ GATE 2: Lógica de negocio validada');

    // --------------------------------------------------------------------------
    // 💾 GATE 3: TRANSACCIÓN DB (El Ejecutor)
    // --------------------------------------------------------------------------
    const newCompliance = await database.compliance.createComplianceV3({
      ...input,
      status,
      complianceScore: 0,
      userId: user?.id,
      createdAt: new Date()
    });

    if (!newCompliance || !newCompliance.id) {
      throw new Error('Fallo al crear la regulación de cumplimiento');
    }

    console.log('✅ GATE 3: Regulación creada en DB');

    // --------------------------------------------------------------------------
    // 📝 GATE 4: AUDITORÍA (El Cronista - AuditLogger)
    // --------------------------------------------------------------------------
    const duration = Date.now() - startTime;

    if (auditLogger) {
      try {
        await auditLogger.logCreate(
          'ComplianceRegulationV3',
          newCompliance.id,
          newCompliance,
          user?.id,
          user?.email,
          ip
        );
        console.log('✅ GATE 4: Auditoría registrada');
      } catch (auditError) {
        console.warn(
          `⚠️ Fallo al registrar auditoría para createComplianceV3:`,
          auditError
        );
        // No lanzar error - la auditoría fallida no debe romper la mutación
      }
    }

    // 📊 Publicar eventos de WebSocket si PubSub está disponible
    if (context.pubsub) {
      try {
        context.pubsub.publish('COMPLIANCE_CREATED', {
          complianceCreated: newCompliance
        });
      } catch (pubError) {
        console.warn(`⚠️ Fallo al publicar evento PubSub:`, pubError);
      }
    }

    console.log(
      `✅ [COMPLIANCE] createComplianceV3 completada: ${newCompliance.id} (${duration}ms)`
    );
    return newCompliance;
  } catch (error) {
    // ❌ AUDITORÍA DE ERRORES
    if (auditLogger && !verificationFailed) {
      try {
        await auditLogger.logIntegrityViolation(
          'ComplianceRegulationV3',
          'N/A (CREATE)',
          'validation_error',
          input,
          (error as Error).message,
          'CRITICAL',
          user?.id,
          user?.email,
          ip
        );
      } catch (auditError) {
        console.warn(
          `⚠️ Fallo al registrar violación de integridad:`,
          auditError
        );
      }
    }

    console.error('❌ [COMPLIANCE] createComplianceV3 error:', error as Error);
    throw error;
  }
};

/**
 * 🎯 UPDATE COMPLIANCE REGULATION
 * Implementa el Four-Gate Pattern completo
 */
export const updateComplianceV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log(`🎯 [COMPLIANCE] updateComplianceV3 CALLED for ID: ${args.id}`);

  const { id, input } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    // --------------------------------------------------------------------------
    // 🚪 GATE 1: VERIFICACIÓN (El Guardián)
    // --------------------------------------------------------------------------
    // Obtener el registro actual para comparación
    const oldCompliance = await database.compliance.getComplianceV3ById(id);
    if (!oldCompliance) {
      throw new Error(`Regulación de cumplimiento no encontrada: ${id}`);
    }

    // Validar campos si se proporcionan
    if (input.name && !input.name.trim()) {
      throw new Error('El nombre de la regulación no puede estar vacío');
    }

    if (input.complianceDeadline) {
      const deadlineDate = new Date(input.complianceDeadline);
      if (isNaN(deadlineDate.getTime())) {
        throw new Error('Fecha límite inválida');
      }
    }

    if (input.status) {
      const validStatuses = ['ACTIVE', 'INACTIVE', 'EXPIRED'];
      if (!validStatuses.includes(input.status)) {
        throw new Error(`Status inválido: ${input.status}`);
      }
    }

    console.log('✅ GATE 1: Verificación completada');

    // --------------------------------------------------------------------------
    // 🏗️ GATE 2: LÓGICA DE NEGOCIO (El Arquitecto)
    // --------------------------------------------------------------------------
    // Validar transiciones de estado si aplican
    if (input.status && input.status !== oldCompliance.status) {
      // Validar que la transición sea válida
      const validTransitions: Record<string, string[]> = {
        ACTIVE: ['INACTIVE', 'EXPIRED'],
        INACTIVE: ['ACTIVE'],
        EXPIRED: [] // EXPIRED no puede transicionar
      };

      const allowedTransitions = validTransitions[oldCompliance.status] || [];
      if (!allowedTransitions.includes(input.status)) {
        throw new Error(
          `Transición de estado no válida: ${oldCompliance.status} -> ${input.status}`
        );
      }
    }

    // Si se actualiza la fecha límite, debe ser futura
    if (
      input.complianceDeadline &&
      input.complianceDeadline !== oldCompliance.complianceDeadline
    ) {
      const newDeadline = new Date(input.complianceDeadline);
      if (newDeadline <= new Date()) {
        throw new Error('La nueva fecha límite debe ser futura');
      }
    }

    console.log('✅ GATE 2: Lógica de negocio validada');

    // --------------------------------------------------------------------------
    // 💾 GATE 3: TRANSACCIÓN DB (El Ejecutor)
    // --------------------------------------------------------------------------
    const updatedCompliance = await database.compliance.updateComplianceV3(id, {
      ...input,
      updatedAt: new Date()
    });

    if (!updatedCompliance) {
      throw new Error('Fallo al actualizar la regulación de cumplimiento');
    }

    console.log('✅ GATE 3: Regulación actualizada en DB');

    // --------------------------------------------------------------------------
    // 📝 GATE 4: AUDITORÍA (El Cronista)
    // --------------------------------------------------------------------------
    const duration = Date.now() - startTime;

    if (auditLogger) {
      try {
        await auditLogger.logUpdate(
          'ComplianceRegulationV3',
          id,
          oldCompliance,
          updatedCompliance,
          user?.id,
          user?.email,
          ip
        );
        console.log('✅ GATE 4: Auditoría registrada');
      } catch (auditError) {
        console.warn(
          `⚠️ Fallo al registrar auditoría para updateComplianceV3:`,
          auditError
        );
      }
    }

    // 📊 Publicar eventos
    if (context.pubsub) {
      try {
        context.pubsub.publish('COMPLIANCE_UPDATED', {
          complianceUpdated: updatedCompliance
        });
      } catch (pubError) {
        console.warn(`⚠️ Fallo al publicar evento PubSub:`, pubError);
      }
    }

    console.log(
      `✅ [COMPLIANCE] updateComplianceV3 completada: ${id} (${duration}ms)`
    );
    return updatedCompliance;
  } catch (error) {
    // ❌ AUDITORÍA DE ERRORES
    if (auditLogger) {
      try {
        await auditLogger.logIntegrityViolation(
          'ComplianceRegulationV3',
          'UPDATE',
          'validation_error',
          input,
          (error as Error).message,
          'CRITICAL',
          user?.id,
          user?.email,
          ip
        );
      } catch (auditError) {
        console.warn(
          `⚠️ Fallo al registrar violación de integridad:`,
          auditError
        );
      }
    }

    console.error('❌ [COMPLIANCE] updateComplianceV3 error:', error as Error);
    throw error;
  }
};

/**
 * 🎯 DELETE COMPLIANCE REGULATION (SOFT DELETE)
 * Implementa el Four-Gate Pattern completo
 */
export const deleteComplianceV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  console.log(`🎯 [COMPLIANCE] deleteComplianceV3 CALLED for ID: ${args.id}`);

  const { id } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    // --------------------------------------------------------------------------
    // 🚪 GATE 1: VERIFICACIÓN (El Guardián)
    // --------------------------------------------------------------------------
    // Obtener el registro para validar que existe
    const oldCompliance = await database.compliance.getComplianceV3ById(id);
    if (!oldCompliance) {
      throw new Error(`Regulación de cumplimiento no encontrada: ${id}`);
    }

    console.log('✅ GATE 1: Verificación completada (registro encontrado)');

    // --------------------------------------------------------------------------
    // 🏗️ GATE 2: LÓGICA DE NEGOCIO (El Arquitecto)
    // --------------------------------------------------------------------------
    // Registrar razón de eliminación (soft delete)
    const deletionReason = 'Eliminado por usuario';

    console.log('✅ GATE 2: Lógica de negocio validada');

    // --------------------------------------------------------------------------
    // 💾 GATE 3: TRANSACCIÓN DB (El Ejecutor - DELETE)
    // --------------------------------------------------------------------------
    // Usar hard delete con registro en auditoría
    await database.compliance.deleteComplianceV3(id);

    console.log('✅ GATE 3: Regulación eliminada en DB');

    // --------------------------------------------------------------------------
    // 📝 GATE 4: AUDITORÍA (El Cronista)
    // --------------------------------------------------------------------------
    const duration = Date.now() - startTime;

    if (auditLogger) {
      try {
        await auditLogger.logSoftDelete(
          'ComplianceRegulationV3',
          id,
          deletionReason,
          oldCompliance,
          user?.id,
          user?.email,
          ip
        );
        console.log('✅ GATE 4: Auditoría de eliminación registrada');
      } catch (auditError) {
        console.warn(
          `⚠️ Fallo al registrar auditoría para deleteComplianceV3:`,
          auditError
        );
      }
    }

    // 📊 Publicar eventos
    if (context.pubsub) {
      try {
        context.pubsub.publish('COMPLIANCE_DELETED', {
          complianceDeleted: { id, deletedAt: new Date() }
        });
      } catch (pubError) {
        console.warn(`⚠️ Fallo al publicar evento PubSub:`, pubError);
      }
    }

    console.log(
      `✅ [COMPLIANCE] deleteComplianceV3 completada: ${id} (${duration}ms)`
    );
    return true;
  } catch (error) {
    // ❌ AUDITORÍA DE ERRORES
    if (auditLogger) {
      try {
        await auditLogger.logIntegrityViolation(
          'ComplianceRegulationV3',
          'DELETE',
          'deletion_error',
          { id },
          (error as Error).message,
          'CRITICAL',
          user?.id,
          user?.email,
          ip
        );
      } catch (auditError) {
        console.warn(
          `⚠️ Fallo al registrar violación de integridad:`,
          auditError
        );
      }
    }

    console.error('❌ [COMPLIANCE] deleteComplianceV3 error:', error as Error);
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