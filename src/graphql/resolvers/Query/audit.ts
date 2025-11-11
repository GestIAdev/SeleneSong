/**
 * 📋 AUDIT QUERY RESOLVERS - PHASE 3
 * ============================================================================
 * File: selene/src/graphql/resolvers/Query/audit.ts
 * Created: November 10, 2025
 * Author: PunkClaude + Radwulf
 *
 * PHILOSOPHY:
 * The Historian (AuditDatabase) reads the audit logs.
 * These resolvers expose the reading capability via GraphQL API.
 *
 * STATUS: PRODUCTION-READY
 * ============================================================================
 */

import { GraphQLContext } from '../../types.js';
import { AuditDatabase } from '../../../database/AuditDatabase.js';

/**
 * Audit Query Resolvers
 * Todas las queries para leer logs de auditoría, reportes, estadísticas
 */
export const auditQueryResolvers = {
  /**
   * Query: verificationDashboard
   * Retorna el dashboard principal con todas las estadísticas de verificación
   */
  verificationDashboard: async (
    _: any,
    __: any,
    context: GraphQLContext
  ) => {
    try {
      const { auditDatabase } = context;
      if (!auditDatabase) {
        throw new Error('AuditDatabase not initialized in context');
      }

      // Obtener resumen de auditoría
      const summary = await auditDatabase.getAuditSummary();
      
      return {
        reportDate: new Date().toISOString(),
        totalOperations: summary.total_mutations || 0,
        failedChecks: (summary.failed_mutations || 0) + (summary.blocked_mutations || 0),
        criticalIssues: summary.blocked_mutations || 0,
        warningIssues: summary.warned_mutations || 0,
        integrityScore: summary.integrity_score || 1.0
      };
    } catch (error) {
      console.error('❌ Error in verificationDashboard resolver:', error);
      throw error;
    }
  },

  /**
   * Query: auditTrail
   * Retorna el historial completo de una entidad con state transitions
   */
  auditTrail: async (
    _: any,
    args: { entityType: string; entityId: string; limit?: number },
    context: GraphQLContext
  ) => {
    try {
      const { auditDatabase } = context;
      if (!auditDatabase) {
        throw new Error('AuditDatabase not initialized in context');
      }

      const { entityType, entityId, limit = 100 } = args;

      const trail = await auditDatabase.getEntityAuditTrail(
        entityType,
        entityId,
        limit
      );

      // Mapear valores JSONB a formato GraphQL (mantener como JSON)
      return {
        entityType: trail.entity_type,
        entityId: trail.entity_id,
        totalMutations: trail.total_mutations,
        firstMutation: {
          id: trail.first_mutation.id,
          entityType: trail.first_mutation.entity_type,
          entityId: trail.first_mutation.entity_id,
          operation: trail.first_mutation.operation,
          oldValues: trail.first_mutation.old_values,
          newValues: trail.first_mutation.new_values,
          changedFields: trail.first_mutation.changed_fields,
          userId: trail.first_mutation.user_id,
          userEmail: trail.first_mutation.user_email,
          ipAddress: trail.first_mutation.ip_address,
          integrityStatus: trail.first_mutation.integrity_status,
          timestamp: trail.first_mutation.created_at,
          createdAt: trail.first_mutation.created_at
        },
        lastMutation: {
          id: trail.last_mutation.id,
          entityType: trail.last_mutation.entity_type,
          entityId: trail.last_mutation.entity_id,
          operation: trail.last_mutation.operation,
          oldValues: trail.last_mutation.old_values,
          newValues: trail.last_mutation.new_values,
          changedFields: trail.last_mutation.changed_fields,
          userId: trail.last_mutation.user_id,
          userEmail: trail.last_mutation.user_email,
          ipAddress: trail.last_mutation.ip_address,
          integrityStatus: trail.last_mutation.integrity_status,
          timestamp: trail.last_mutation.created_at,
          createdAt: trail.last_mutation.created_at
        },
        history: trail.history.map((log: any) => ({
          id: log.id,
          entityType: log.entity_type,
          entityId: log.entity_id,
          operation: log.operation,
          oldValues: log.old_values,
          newValues: log.new_values,
          changedFields: log.changed_fields,
          userId: log.user_id,
          userEmail: log.user_email,
          ipAddress: log.ip_address,
          integrityStatus: log.integrity_status,
          timestamp: log.created_at,
          createdAt: log.created_at
        })),
        currentState: trail.current_state,
        stateTransitions: trail.state_transitions?.map((st: any) => ({
          from: st.from,
          to: st.to,
          operation: st.operation,
          timestamp: st.timestamp,
          userId: st.user_id
        }))
      };
    } catch (error) {
      console.error('❌ Error in auditTrail resolver:', error);
      throw error;
    }
  },

  /**
   * Query: integrityReport
   * Retorna las violaciones de integridad filtradas por severidad
   */
  integrityReport: async (
    _: any,
    args: { severity: 'WARNING' | 'ERROR' | 'CRITICAL'; limit?: number },
    context: GraphQLContext
  ) => {
    try {
      const { auditDatabase } = context;
      if (!auditDatabase) {
        throw new Error('AuditDatabase not initialized in context');
      }

      const { severity, limit = 50 } = args;

      const violations = await auditDatabase.getIntegrityViolations(severity, limit);

      return violations.map((log: any) => ({
        id: log.id,
        entityType: log.entity_type,
        entityId: log.entity_id,
        operation: log.operation,
        oldValues: log.old_values,
        newValues: log.new_values,
        changedFields: log.changed_fields,
        userId: log.user_id,
        userEmail: log.user_email,
        ipAddress: log.ip_address,
        integrityStatus: log.integrity_status,
        timestamp: log.created_at,
        createdAt: log.created_at
      }));
    } catch (error) {
      console.error('❌ Error in integrityReport resolver:', error);
      throw error;
    }
  },

  /**
   * Query: recentChanges
   * Retorna los cambios más recientes (últimas N mutaciones)
   * Útil para activity feeds
   */
  recentChanges: async (
    _: any,
    args: { limit?: number },
    context: GraphQLContext
  ) => {
    try {
      const { auditDatabase } = context;
      if (!auditDatabase) {
        throw new Error('AuditDatabase not initialized in context');
      }

      const { limit = 20 } = args;

      const changes = await auditDatabase.getRecentChanges(limit);

      return changes.map((log: any) => ({
        id: log.id,
        entityType: log.entity_type,
        entityId: log.entity_id,
        operation: log.operation,
        oldValues: log.old_values,
        newValues: log.new_values,
        changedFields: log.changed_fields,
        userId: log.user_id,
        userEmail: log.user_email,
        ipAddress: log.ip_address,
        integrityStatus: log.integrity_status,
        timestamp: log.created_at,
        createdAt: log.created_at
      }));
    } catch (error) {
      console.error('❌ Error in recentChanges resolver:', error);
      throw error;
    }
  },

  /**
   * Query: mutationsByEntityType
   * Retorna qué tipos de entidades están siendo modificados más
   */
  mutationsByEntityType: async (
    _: any,
    args: { limit?: number },
    context: GraphQLContext
  ) => {
    try {
      const { auditDatabase } = context;
      if (!auditDatabase) {
        throw new Error('AuditDatabase not initialized in context');
      }

      const { limit = 10 } = args;

      const mutations = await auditDatabase.getMutationsByEntityType(limit);

      return mutations.map((m: any) => ({
        entityType: m.entity_type,
        count: m.count
      }));
    } catch (error) {
      console.error('❌ Error in mutationsByEntityType resolver:', error);
      throw error;
    }
  },

  /**
   * Query: integrityStats
   * Retorna estadísticas de integridad en un rango de fechas
   */
  integrityStats: async (
    _: any,
    args: { startDate?: string; endDate?: string },
    context: GraphQLContext
  ) => {
    try {
      const { auditDatabase } = context;
      if (!auditDatabase) {
        throw new Error('AuditDatabase not initialized in context');
      }

      const { startDate, endDate } = args;

      const stats = await auditDatabase.getIntegrityStats(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      return {
        total: stats.total,
        valid: stats.valid,
        warned: stats.warned,
        failed: stats.failed,
        blocked: stats.blocked,
        integrityPercentage: stats.integrityPercentage
      };
    } catch (error) {
      console.error('❌ Error in integrityStats resolver:', error);
      throw error;
    }
  },

  /**
   * Query: mostActiveUsers
   * Retorna los usuarios que más están modificando datos
   */
  mostActiveUsers: async (
    _: any,
    args: { limit?: number },
    context: GraphQLContext
  ) => {
    try {
      const { auditDatabase } = context;
      if (!auditDatabase) {
        throw new Error('AuditDatabase not initialized in context');
      }

      const { limit = 10 } = args;

      const users = await auditDatabase.getMostActiveUsers(limit);

      return users.map((u: any) => ({
        userId: u.user_id,
        mutationCount: u.mutation_count
      }));
    } catch (error) {
      console.error('❌ Error in mostActiveUsers resolver:', error);
      throw error;
    }
  }
};

export default auditQueryResolvers;
