/**
 * 📚 THE HISTORIAN - PHASE 3 AUDIT DATABASE
 * ============================================================================
 * File: selene/src/database/AuditDatabase.ts
 * Created: November 10, 2025
 * Author: PunkClaude + Radwulf
 *
 * PHILOSOPHY:
 * The Chronicler (AuditLogger) WRITES the history.
 * The Historian (AuditDatabase) READS the history.
 *
 * This class provides query methods for reading audit logs and
 * generating reports for the dashboard, compliance audits, and analytics.
 *
 * STATUS: PRODUCTION-READY
 * ============================================================================
 */

import { Pool } from 'pg';
import {
  AuditLogEntry,
  EntityAuditTrail,
  CascadeImpactReport
} from '../core/AuditLogger.js';

// ============================================================================
// AUDIT SUMMARY TYPE (Dashboard aggregations)
// ============================================================================

export interface AuditSummary {
  total_mutations: number;
  entity_types_touched: number;
  unique_users: number;
  blocked_mutations: number;
  failed_mutations: number;
  warned_mutations: number;
  integrity_score?: number;
}

// ============================================================================
// VERIFICATION DASHBOARD TYPE (What the dashboard shows)
// ============================================================================

export interface VerificationDashboard {
  reportDate: string;
  totalOperations: number;
  failedChecks: number;
  criticalIssues: number;
  warningIssues: number;
  integrityScore: number;
}

// ============================================================================
// AUDIT DATABASE - THE HISTORIAN
// ============================================================================

export class AuditDatabase {
  private db: Pool;

  constructor(databaseConnection: Pool) {
    this.db = databaseConnection;
    console.log('📚 AuditDatabase (The Historian) initialized');
  }

  /**
   * Obtiene el historial completo de una entidad (Entity Audit Trail)
   * Muestra: todas las mutaciones, state transitions, current state
   *
   * @param entityType - Tipo de entidad (e.g., 'InventoryV3', 'CartItemV3')
   * @param entityId - ID de la entidad
   * @param limit - Límite de registros (default: 100)
   * @returns EntityAuditTrail con historial completo
   */
  async getEntityAuditTrail(
    entityType: string,
    entityId: string,
    limit: number = 100
  ): Promise<EntityAuditTrail> {
    try {
      const query = `
        SELECT *
        FROM data_audit_logs
        WHERE entity_type = $1 AND entity_id = $2
        ORDER BY created_at ASC
        LIMIT $3
      `;

      const result = await this.db.query(query, [entityType, entityId, limit]);
      const logs = result.rows as AuditLogEntry[];

      if (logs.length === 0) {
        throw new Error(`No audit trail found for ${entityType}:${entityId}`);
      }

      // Calcular state transitions (cambios de estado)
      const stateTransitions = [];
      for (let i = 0; i < logs.length - 1; i++) {
        if (logs[i].old_values && logs[i].new_values) {
          stateTransitions.push({
            from: logs[i].old_values!,
            to: logs[i].new_values!,
            operation: logs[i].operation,
            timestamp: logs[i].created_at!,
            user_id: logs[i].user_id
          });
        }
      }

      return {
        entity_type: entityType,
        entity_id: entityId,
        total_mutations: logs.length,
        first_mutation: logs[0],
        last_mutation: logs[logs.length - 1],
        history: logs,
        current_state: logs[logs.length - 1].new_values,
        state_transitions: stateTransitions
      };
    } catch (error) {
      console.error(
        `❌ Error retrieving audit trail for ${entityType}:${entityId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Obtiene el resumen de auditoría para el dashboard
   * Muestra: total de operaciones, fallos, warnings, score de integridad
   *
   * @param startDate - Fecha de inicio (opcional)
   * @param endDate - Fecha de fin (opcional)
   * @returns AuditSummary con estadísticas agregadas
   */
  async getAuditSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditSummary> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (startDate) {
        whereClause += ` AND created_at >= $${paramIndex++}`;
        params.push(startDate);
      }
      if (endDate) {
        whereClause += ` AND created_at <= $${paramIndex++}`;
        params.push(endDate);
      }

      // Construir query de estadísticas
      const summaryQuery = `
        SELECT 
          COUNT(*) as total_mutations,
          COUNT(DISTINCT entity_type) as entity_types_touched,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(CASE WHEN integrity_status = 'BLOCKED' THEN 1 END) as blocked_mutations,
          COUNT(CASE WHEN integrity_status = 'FAILED' THEN 1 END) as failed_mutations,
          COUNT(CASE WHEN integrity_status = 'WARNED' THEN 1 END) as warned_mutations
        FROM data_audit_logs
        ${whereClause}
      `;

      const result = await this.db.query(summaryQuery, params);
      const summary = result.rows[0] || {};

      // Calcular integrity_score
      const total = parseInt(summary.total_mutations) || 0;
      const failed = (parseInt(summary.failed_mutations) || 0) +
                     (parseInt(summary.blocked_mutations) || 0);
      const integrityScore = total > 0 ? (total - failed) / total : 1;

      return {
        total_mutations: total,
        entity_types_touched: parseInt(summary.entity_types_touched) || 0,
        unique_users: parseInt(summary.unique_users) || 0,
        blocked_mutations: parseInt(summary.blocked_mutations) || 0,
        failed_mutations: parseInt(summary.failed_mutations) || 0,
        warned_mutations: parseInt(summary.warned_mutations) || 0,
        integrity_score: integrityScore
      };
    } catch (error) {
      console.error('❌ Error retrieving audit summary:', error);
      throw error;
    }
  }

  /**
   * Obtiene las violaciones de integridad
   * Muestra: logs donde integrity_status es WARNED, FAILED, o BLOCKED
   *
   * @param severity - Severidad: 'WARNING' | 'ERROR' | 'CRITICAL'
   * @param limit - Límite de registros (default: 50)
   * @returns Array de AuditLogEntry con violaciones
   */
  async getIntegrityViolations(
    severity: 'WARNING' | 'ERROR' | 'CRITICAL',
    limit: number = 50
  ): Promise<AuditLogEntry[]> {
    try {
      // Mapear severidad a integrity_status
      const statusMap: Record<string, string> = {
        WARNING: 'WARNED',
        ERROR: 'FAILED',
        CRITICAL: 'BLOCKED'
      };

      const status = statusMap[severity];
      if (!status) {
        throw new Error(`Invalid severity: ${severity}`);
      }

      const query = `
        SELECT *
        FROM data_audit_logs
        WHERE integrity_status = $1
        ORDER BY created_at DESC
        LIMIT $2
      `;

      const result = await this.db.query(query, [status, limit]);
      return result.rows as AuditLogEntry[];
    } catch (error) {
      console.error('❌ Error retrieving integrity violations:', error);
      throw error;
    }
  }

  /**
   * Obtiene los cambios recientes (últimas N mutaciones)
   * Útil para timeline/activity feeds
   *
   * @param limit - Número de registros (default: 20)
   * @returns Array de AuditLogEntry ordenadas por fecha DESC
   */
  async getRecentChanges(limit: number = 20): Promise<AuditLogEntry[]> {
    try {
      const query = `
        SELECT *
        FROM data_audit_logs
        ORDER BY created_at DESC
        LIMIT $1
      `;

      const result = await this.db.query(query, [limit]);
      return result.rows as AuditLogEntry[];
    } catch (error) {
      console.error('❌ Error retrieving recent changes:', error);
      throw error;
    }
  }

  /**
   * Obtiene las mutaciones por tipo de entidad
   * Útil para ver qué se está modificando más
   *
   * @param limit - Número de tipos a retornar (default: 10)
   * @returns Array con conteos por entity_type
   */
  async getMutationsByEntityType(
    limit: number = 10
  ): Promise<Array<{ entity_type: string; count: number }>> {
    try {
      const query = `
        SELECT 
          entity_type,
          COUNT(*) as count
        FROM data_audit_logs
        GROUP BY entity_type
        ORDER BY count DESC
        LIMIT $1
      `;

      const result = await this.db.query(query, [limit]);
      return result.rows as Array<{ entity_type: string; count: number }>;
    } catch (error) {
      console.error('❌ Error retrieving mutations by entity type:', error);
      throw error;
    }
  }

  /**
   * Obtiene las mutaciones por operación (CREATE, UPDATE, DELETE, etc)
   * Útil para analizar patrones de uso
   *
   * @returns Object con conteos por operation
   */
  async getMutationsByOperation(): Promise<Record<string, number>> {
    try {
      const query = `
        SELECT 
          operation,
          COUNT(*) as count
        FROM data_audit_logs
        GROUP BY operation
      `;

      const result = await this.db.query(query);
      const counts: Record<string, number> = {};

      result.rows.forEach((row: any) => {
        counts[row.operation] = parseInt(row.count);
      });

      return counts;
    } catch (error) {
      console.error('❌ Error retrieving mutations by operation:', error);
      throw error;
    }
  }

  /**
   * Obtiene usuario más activo
   * Útil para analytics y auditoría
   *
   * @param limit - Número de usuarios a retornar (default: 10)
   * @returns Array con usuarios y sus conteos de mutaciones
   */
  async getMostActiveUsers(
    limit: number = 10
  ): Promise<Array<{ user_id: string; mutation_count: number }>> {
    try {
      const query = `
        SELECT 
          user_id,
          COUNT(*) as mutation_count
        FROM data_audit_logs
        WHERE user_id IS NOT NULL
        GROUP BY user_id
        ORDER BY mutation_count DESC
        LIMIT $1
      `;

      const result = await this.db.query(query, [limit]);
      return result.rows as Array<{ user_id: string; mutation_count: number }>;
    } catch (error) {
      console.error('❌ Error retrieving most active users:', error);
      throw error;
    }
  }

  /**
   * Obtiene la integridad de los datos en un rango de fechas
   * Muestra el porcentaje de mutaciones con integrity_status = VALID/PASSED
   *
   * @param startDate - Fecha de inicio (opcional)
   * @param endDate - Fecha de fin (opcional)
   * @returns Object con stats de integridad
   */
  async getIntegrityStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total: number;
    valid: number;
    warned: number;
    failed: number;
    blocked: number;
    integrityPercentage: number;
  }> {
    try {
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];
      let paramIndex = 1;

      if (startDate) {
        whereClause += ` AND created_at >= $${paramIndex++}`;
        params.push(startDate);
      }
      if (endDate) {
        whereClause += ` AND created_at <= $${paramIndex++}`;
        params.push(endDate);
      }

      const query = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN integrity_status IN ('VALID', 'PASSED') THEN 1 END) as valid,
          COUNT(CASE WHEN integrity_status = 'WARNED' THEN 1 END) as warned,
          COUNT(CASE WHEN integrity_status = 'FAILED' THEN 1 END) as failed,
          COUNT(CASE WHEN integrity_status = 'BLOCKED' THEN 1 END) as blocked
        FROM data_audit_logs
        ${whereClause}
      `;

      const result = await this.db.query(query, params);
      const stats = result.rows[0];

      const total = parseInt(stats.total) || 0;
      const valid = parseInt(stats.valid) || 0;
      const integrityPercentage = total > 0 ? (valid / total) * 100 : 100;

      return {
        total,
        valid,
        warned: parseInt(stats.warned) || 0,
        failed: parseInt(stats.failed) || 0,
        blocked: parseInt(stats.blocked) || 0,
        integrityPercentage
      };
    } catch (error) {
      console.error('❌ Error retrieving integrity stats:', error);
      throw error;
    }
  }

  /**
   * Healthcheck - verifica que la tabla de auditoría está accesible
   *
   * @returns boolean - true si el healthcheck pasa
   */
  async healthcheck(): Promise<boolean> {
    try {
      const result = await this.db.query(
        'SELECT COUNT(*) as count FROM data_audit_logs'
      );
      const logCount = parseInt(result.rows[0]?.count || '0');
      console.log(`✅ AuditDatabase healthcheck passed. Total logs: ${logCount}`);
      return true;
    } catch (error) {
      console.error('❌ AuditDatabase healthcheck failed:', error);
      return false;
    }
  }
}

export default AuditDatabase;
