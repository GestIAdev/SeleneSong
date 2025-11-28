/**
 * ⚖️ PENTAGON LEGAL GRAPHQL RESOLVERS
 * ============================================================================
 * File: selene/src/graphql/resolvers/Query/pentagonLegal.ts
 * Created: November 28, 2025
 * Author: PunkClaude + Radwulf
 *
 * MISSION: GraphQL queries for the Pentágono Legal (Compliance V4)
 *
 * STATUS: PRODUCTION-READY
 * ============================================================================
 */

import type { GraphQLContext } from '../../types.js';
import { ComplianceService } from '../../../services/ComplianceService.js';

// ============================================================================
// QUERY RESOLVERS
// ============================================================================

/**
 * Calculate and return real compliance score
 */
export const complianceScoreV4 = async (
  _: unknown,
  args: { clinicId?: string; jurisdiction?: string },
  context: GraphQLContext
): Promise<unknown> => {
  console.log('⚖️ [PENTAGON] complianceScoreV4 query');
  
  const clinicId = args.clinicId || 'default';
  const service = new ComplianceService(context.database.getPool());
  
  const score = await service.calculateComplianceScore(clinicId, args.jurisdiction);
  
  return {
    overallScore: score.overall_score,
    totalRules: score.total_rules,
    rulesPassed: score.rules_passed,
    rulesFailed: score.rules_failed,
    criticalIssues: score.critical_issues,
    highIssues: score.high_issues,
    mediumIssues: score.medium_issues,
    lowIssues: score.low_issues,
    breakdown: {
      dataPrivacy: score.breakdown.data_privacy,
      security: score.breakdown.security,
      patientRights: score.breakdown.patient_rights,
      retention: score.breakdown.retention
    },
    checks: score.checks.map(c => ({
      ruleId: c.rule_id,
      ruleCode: c.rule_code,
      ruleName: c.rule_name,
      passed: c.passed,
      details: JSON.stringify(c.details),
      severity: c.severity,
      weight: c.weight,
      penalty: c.penalty
    })),
    calculatedAt: score.calculated_at
  };
};

/**
 * Get all compliance rules
 */
export const complianceRulesV4 = async (
  _: unknown,
  args: { jurisdiction?: string; activeOnly?: boolean },
  context: GraphQLContext
): Promise<unknown[]> => {
  console.log('⚖️ [PENTAGON] complianceRulesV4 query');
  
  const service = new ComplianceService(context.database.getPool());
  
  const rules = args.activeOnly !== false 
    ? await service.getActiveRules(args.jurisdiction)
    : await service.getAllRules();
  
  return rules.map(r => ({
    id: r.id,
    code: r.code,
    name: r.name,
    description: r.description,
    jurisdiction: r.jurisdiction,
    regulationReference: r.regulation_reference,
    category: r.category,
    checkType: r.check_type,
    severity: r.severity,
    weight: r.weight,
    failurePenalty: r.failure_penalty,
    isActive: r.is_active
  }));
};

/**
 * Get legal documents library
 */
export const legalDocumentsV4 = async (
  _: unknown,
  args: { jurisdiction?: string; category?: string },
  context: GraphQLContext
): Promise<unknown[]> => {
  console.log('⚖️ [PENTAGON] legalDocumentsV4 query');
  
  const service = new ComplianceService(context.database.getPool());
  const docs = await service.getLegalDocuments(args.jurisdiction, args.category);
  
  return docs.map(d => ({
    id: d.id,
    code: d.code,
    title: d.title,
    description: d.description,
    jurisdiction: d.jurisdiction,
    category: d.category,
    documentType: d.document_type,
    contentMarkdown: d.content_markdown,
    filePath: d.file_path,
    externalUrl: d.external_url,
    version: d.version,
    effectiveDate: d.effective_date,
    isMandatory: d.is_mandatory,
    isTemplate: d.is_template,
    createdAt: d.created_at,
    updatedAt: d.updated_at
  }));
};

/**
 * Get single legal document
 */
export const legalDocumentV4 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<unknown | null> => {
  console.log('⚖️ [PENTAGON] legalDocumentV4 query');
  
  const service = new ComplianceService(context.database.getPool());
  const doc = await service.getLegalDocumentById(args.id);
  
  if (!doc) return null;
  
  return {
    id: doc.id,
    code: doc.code,
    title: doc.title,
    description: doc.description,
    jurisdiction: doc.jurisdiction,
    category: doc.category,
    documentType: doc.document_type,
    contentMarkdown: doc.content_markdown,
    filePath: doc.file_path,
    externalUrl: doc.external_url,
    version: doc.version,
    effectiveDate: doc.effective_date,
    isMandatory: doc.is_mandatory,
    isTemplate: doc.is_template,
    createdAt: doc.created_at,
    updatedAt: doc.updated_at
  };
};

/**
 * Get audit logs for forensic view
 */
export const auditLogsV4 = async (
  _: unknown,
  args: { entityType?: string; operation?: string; limit?: number; offset?: number },
  context: GraphQLContext
): Promise<unknown[]> => {
  console.log('⚖️ [PENTAGON] auditLogsV4 query');
  
  const service = new ComplianceService(context.database.getPool());
  const logs = await service.getAuditLogs({
    entityType: args.entityType,
    operation: args.operation,
    limit: args.limit,
    offset: args.offset
  });
  
  return logs.map((log: any) => ({
    id: log.id,
    entityType: log.entity_type,
    entityId: log.entity_id,
    operation: log.operation,
    userId: log.user_id,
    ipAddress: log.ip_address,
    oldValues: log.old_values ? JSON.stringify(log.old_values) : null,
    newValues: log.new_values ? JSON.stringify(log.new_values) : null,
    changedFields: log.changed_fields,
    integrityStatus: log.integrity_status,
    createdAt: log.created_at
  }));
};

/**
 * Get audit summary for dashboard
 */
export const auditSummaryV4 = async (
  _: unknown,
  args: { days?: number },
  context: GraphQLContext
): Promise<unknown> => {
  console.log('⚖️ [PENTAGON] auditSummaryV4 query');
  
  const service = new ComplianceService(context.database.getPool());
  const summary = await service.getAuditSummary(args.days || 30);
  
  return {
    totalOperations: summary.total_operations,
    operationsByType: JSON.stringify(summary.operations_by_type),
    operationsByEntity: JSON.stringify(summary.operations_by_entity),
    integrityIssues: summary.integrity_issues
  };
};

/**
 * Quick consent compliance check
 */
export const consentComplianceCheckV4 = async (
  _: unknown,
  _args: unknown,
  context: GraphQLContext
): Promise<unknown> => {
  console.log('⚖️ [PENTAGON] consentComplianceCheckV4 query');
  
  const service = new ComplianceService(context.database.getPool());
  const result = await service.checkConsentCompliance();
  
  return {
    compliant: result.compliant,
    totalPatients: result.total,
    missingConsent: result.missing
  };
};

/**
 * 🎯 PENTAGON LEGAL DASHBOARD - Unified entry point
 * Returns all critical compliance data in one query
 */
export const pentagonLegalDashboardV4 = async (
  _: unknown,
  args: { clinicId?: string; jurisdiction?: string },
  context: GraphQLContext
): Promise<unknown> => {
  console.log('⚖️ [PENTAGON] pentagonLegalDashboardV4 query - UNIFIED DASHBOARD');
  
  const clinicId = args.clinicId || 'default';
  const service = new ComplianceService(context.database.getPool());
  
  // Parallel fetches for performance
  const [score, documents, auditSummary, consentCheck] = await Promise.all([
    service.calculateComplianceScore(clinicId, args.jurisdiction),
    service.getLegalDocuments(args.jurisdiction), // Filter by jurisdiction
    service.getAuditSummary(7), // Last 7 days
    service.checkConsentCompliance()
  ]);
  
  return {
    score: {
      overallScore: score.overall_score,
      totalRules: score.total_rules,
      rulesPassed: score.rules_passed,
      rulesFailed: score.rules_failed,
      criticalIssues: score.critical_issues,
      highIssues: score.high_issues,
      mediumIssues: score.medium_issues,
      lowIssues: score.low_issues,
      breakdown: {
        dataPrivacy: score.breakdown.data_privacy,
        security: score.breakdown.security,
        patientRights: score.breakdown.patient_rights,
        retention: score.breakdown.retention
      },
      calculatedAt: score.calculated_at
    },
    recentDocuments: documents.map(doc => ({
      id: doc.id,
      code: doc.code,
      title: doc.title,
      category: doc.category,
      jurisdiction: doc.jurisdiction,
      isMandatory: doc.is_mandatory
    })),
    auditSummary: {
      totalOperations: auditSummary.total_operations,
      integrityIssues: auditSummary.integrity_issues
    },
    consentStatus: {
      compliant: consentCheck.compliant,
      totalPatients: consentCheck.total,
      missingConsent: consentCheck.missing
    }
  };
};

// ============================================================================
// EXPORT CONSOLIDATED
// ============================================================================

export const pentagonLegalQueries = {
  complianceScoreV4,
  complianceRulesV4,
  legalDocumentsV4,
  legalDocumentV4,
  auditLogsV4,
  auditSummaryV4,
  consentComplianceCheckV4,
  pentagonLegalDashboardV4
};
