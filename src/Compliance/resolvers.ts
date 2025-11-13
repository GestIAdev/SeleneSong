import { GraphQLContext } from "../graphql/types.js";

export const ComplianceV3 = {
  id: async (_p: any) => _p.id,
  patientId: async (_p: any) => _p.patientId,
  description: async (_p: any) => _p.description,
  lastChecked: async (_p: any) => _p.lastChecked,
  nextCheck: async (_p: any) => _p.nextCheck,
  createdAt: async (_p: any) => _p.createdAt,
  updatedAt: async (_p: any) => _p.updatedAt,
  // _veritas field resolver REMOVED - not in schema
};

export const ComplianceQuery = {
  compliancesV3: async (_: any, { patientId, limit = 50, offset = 0 }: any, ctx: GraphQLContext) => {
    console.log('🎯 [COMPLIANCE] compliancesV3 query - fetching with patientId:', patientId);
    
    try {
      const results = await ctx.database.compliance.getCompliancesV3({
        patientId,
        limit,
        offset,
      });
      
      // Convert snake_case to camelCase
      return results.map(r => ({
        id: r.id,
        patientId: r.patient_id,
        regulationId: r.regulation_id,
        complianceStatus: r.compliance_status,
        description: r.description,
        lastChecked: r.last_checked,
        nextCheck: r.next_check,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (error) {
      console.error('❌ [COMPLIANCE] compliancesV3 query failed:', error);
      throw error;
    }
  },
  
  complianceV3: async (_: any, { id }: any, ctx: GraphQLContext) => {
    console.log('🎯 [COMPLIANCE] complianceV3 query - fetching:', id);
    
    try {
      const result = await ctx.database.compliance.getComplianceV3ById(id);
      
      if (!result) return null;
      
      // Convert snake_case to camelCase
      return {
        id: result.id,
        patientId: result.patient_id,
        regulationId: result.regulation_id,
        complianceStatus: result.compliance_status,
        description: result.description,
        lastChecked: result.last_checked,
        nextCheck: result.next_check,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      };
    } catch (error) {
      console.error('❌ [COMPLIANCE] complianceV3 query failed:', error);
      throw error;
    }
  },
};

export const ComplianceMutation = {
  createComplianceV3: async (_: any, { input }: any, ctx: GraphQLContext) => {
    // 🎯 [COMPLIANCE] CREATE - Using real PostgreSQL via ComplianceDatabase
    console.log('🎯 [COMPLIANCE] createComplianceV3 - Creating in PostgreSQL', input);
    
    try {
      const compliance = await ctx.database.compliance.createComplianceV3(input);
      console.log('✅ [COMPLIANCE] Created:', compliance.id);
      
      // Log to audit trail
      if (ctx.auditLogger) {
        await ctx.auditLogger.logMutation({
          entityType: 'ComplianceV3',
          entityId: compliance.id,
          operationType: 'CREATE',
          userId: ctx.user?.id,
          userEmail: ctx.user?.email,
          ipAddress: ctx.ip,
          newValues: compliance,
        });
      }
      
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
      console.error('❌ [COMPLIANCE] CREATE failed:', error);
      throw error;
    }
  },
  
  updateComplianceV3: async (
    _: any,
    { id, input }: any,
    ctx: GraphQLContext,
  ) => {
    // 🎯 [COMPLIANCE] UPDATE - Using real PostgreSQL via ComplianceDatabase
    console.log('🎯 [COMPLIANCE] updateComplianceV3 - Updating in PostgreSQL', id, input);
    
    try {
      // Obtener valores anteriores para audit
      const oldCompliance = await ctx.database.compliance.getComplianceV3ById(id);
      if (!oldCompliance) {
        throw new Error(`Compliance record ${id} not found`);
      }
      
      const compliance = await ctx.database.compliance.updateComplianceV3(id, input);
      console.log('✅ [COMPLIANCE] Updated:', compliance.id);
      
      // Log to audit trail
      if (ctx.auditLogger) {
        await ctx.auditLogger.logMutation({
          entityType: 'ComplianceV3',
          entityId: id,
          operationType: 'UPDATE',
          userId: ctx.user?.id,
          userEmail: ctx.user?.email,
          ipAddress: ctx.ip,
          oldValues: oldCompliance,
          newValues: compliance,
          changedFields: Object.keys(input),
        });
      }
      
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
      console.error('❌ [COMPLIANCE] UPDATE failed:', error);
      throw error;
    }
  },
  
  deleteComplianceV3: async (_: any, { id }: any, ctx: GraphQLContext) => {
    // 🎯 [COMPLIANCE] DELETE - Using real PostgreSQL via ComplianceDatabase
    console.log('🎯 [COMPLIANCE] deleteComplianceV3 - Deleting:', id);
    
    try {
      // Obtener valores anteriores para audit
      const oldCompliance = await ctx.database.compliance.getComplianceV3ById(id);
      if (!oldCompliance) {
        throw new Error(`Compliance record ${id} not found`);
      }
      
      await ctx.database.compliance.deleteComplianceV3(id);
      console.log('✅ [COMPLIANCE] Deleted:', id);
      
      // Log to audit trail
      if (ctx.auditLogger) {
        await ctx.auditLogger.logMutation({
          entityType: 'ComplianceV3',
          entityId: id,
          operationType: 'DELETE',
          userId: ctx.user?.id,
          userEmail: ctx.user?.email,
          ipAddress: ctx.ip,
          oldValues: oldCompliance,
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ [COMPLIANCE] DELETE failed:', error);
      throw error;
    }
  },
};


