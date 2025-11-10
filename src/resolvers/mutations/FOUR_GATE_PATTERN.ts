/**
 * 🚀 THE FOUR-GATE MUTATION PATTERN - PHASE 3 INTEGRATION
 * ============================================================================
 * File: selene/src/resolvers/mutations/FOUR_GATE_PATTERN.ts
 * Created: November 10, 2025
 * Author: PunkClaude + Radwulf
 *
 * DOCUMENTATION: How to integrate VerificationEngine + AuditLogger
 * into every mutation resolver.
 *
 * THE FOUR GATES:
 * ============================================================================
 *
 * GATE 1: INPUT VERIFICATION
 *   └─ VerificationEngine.verifyBatch() validates all input fields
 *      against integrity_checks rules
 *   └─ If rules block (CRITICAL severity): STOP, throw error
 *   └─ If rules warn: Continue but log warning
 *
 * GATE 2: BUSINESS LOGIC
 *   └─ Your custom business rules (cascades, state transitions, etc.)
 *   └─ Can call VerificationEngine.verifyStateTransition(),
 *      checkDependencies(), etc.
 *   └─ If logic fails: STOP, throw error
 *
 * GATE 3: DATABASE TRANSACTION
 *   └─ Execute INSERT/UPDATE/DELETE in PostgreSQL
 *   └─ Wrapped in transaction for atomicity
 *   └─ If transaction fails: ROLLBACK, throw error
 *
 * GATE 4: AUDIT & LOGGING
 *   └─ AuditLogger records the mutation to data_audit_logs
 *   └─ Publishes pubsub events for subscribers
 *   └─ Triggers any cascade operations
 *   └─ This ALWAYS runs, even if earlier gates warn
 *
 * ============================================================================
 * KEY PRINCIPLE: Separation of concerns
 * - Verification logic is DECLARATIVE (rules in database)
 * - Audit logic is TRANSPARENT (always happens)
 * - Business logic is YOUR code (we don't touch it)
 * ============================================================================
 */

// ============================================================================
// EXAMPLE 1: Simple CREATE Mutation (InventoryV3)
// ============================================================================

export const exampleCreateInventory = `
async createInventoryV3(_, args, context) {
  const startTime = Date.now();

  try {
    // ✅ GATE 1: INPUT VERIFICATION
    const verification = await context.verificationEngine.verifyBatch(
      'InventoryV3',
      args.input
    );
    
    if (!verification.valid) {
      // Log the blocked attempt
      await context.auditLogger.logIntegrityViolation(
        'InventoryV3',
        'new-entity',
        Object.keys(args.input)[0],
        Object.values(args.input)[0],
        verification.criticalFields.join(', '),
        'CRITICAL',
        context.user?.id,
        context.user?.email,
        context.ip
      );
      
      // STOP - throw error
      throw new Error(\`Invalid input: \${verification.fieldResults
        .get(verification.criticalFields[0])?.errors.join(', ')}\`);
    }

    // ✅ GATE 2: BUSINESS LOGIC
    // (None for simple create - but you could validate cascades, etc.)

    // ✅ GATE 3: DATABASE TRANSACTION
    const inventory = await context.database.createInventoryV3(args.input);

    // ✅ GATE 4: AUDIT & LOGGING
    const duration = Date.now() - startTime;
    await context.auditLogger.logCreate(
      'InventoryV3',
      inventory.id,
      inventory,
      context.user?.id,
      context.user?.email,
      context.ip
    );

    // Publish pubsub event
    context.pubsub.publish('INVENTORY_CREATED', {
      inventoryCreated: inventory
    });

    return inventory;
  } catch (error) {
    // Log the error
    console.error('❌ Create failed:', error);
    
    // Still log the attempt
    await context.auditLogger.logIntegrityViolation(
      'InventoryV3',
      'new-entity',
      'unknown',
      args.input,
      error.message,
      'CRITICAL',
      context.user?.id,
      context.user?.email,
      context.ip
    );

    throw error;
  }
}
`;

// ============================================================================
// EXAMPLE 2: Complex UPDATE Mutation with State Transition
// ============================================================================

export const exampleUpdatePurchaseOrder = `
async updatePurchaseOrderV3(_, args, context) {
  const startTime = Date.now();

  try {
    // Fetch current entity for before/after tracking
    const oldOrder = await context.database.getPurchaseOrderV3(args.id);

    // ✅ GATE 1: INPUT VERIFICATION
    const verification = await context.verificationEngine.verifyBatch(
      'PurchaseOrderV3',
      args.input,
      { entityId: args.id, operation: 'UPDATE' }
    );

    if (!verification.valid) {
      // Log violation
      for (const field of verification.criticalFields) {
        const result = verification.fieldResults.get(field);
        await context.auditLogger.logIntegrityViolation(
          'PurchaseOrderV3',
          args.id,
          field,
          args.input[field],
          result?.errors.join(', ') || 'Unknown error',
          'CRITICAL',
          context.user?.id,
          context.user?.email,
          context.ip
        );
      }
      throw new Error(\`Validation failed: \${verification.totalErrors} errors\`);
    }

    // ✅ GATE 2: BUSINESS LOGIC - State Machine Validation
    if (args.input.status && args.input.status !== oldOrder.status) {
      const stateTransition = await context.verificationEngine.verifyStateTransition(
        oldOrder.status,
        args.input.status,
        {
          'PENDING': ['APPROVED', 'CANCELLED'],
          'APPROVED': ['RECEIVED', 'CANCELLED'],
          'RECEIVED': ['PAID'], // Terminal state
          'CANCELLED': [], // Terminal state
          'PAID': [] // Terminal state
        }
      );

      if (!stateTransition.valid) {
        throw new Error(stateTransition.error);
      }

      // Log state transition
      await context.auditLogger.logStateTransition(
        'PurchaseOrderV3',
        args.id,
        oldOrder.status,
        args.input.status,
        { supplier_id: oldOrder.supplier_id },
        context.user?.id,
        context.user?.email,
        context.ip
      );
    }

    // ✅ GATE 3: DATABASE TRANSACTION
    const updatedOrder = await context.database.updatePurchaseOrderV3(args.id, args.input);

    // ✅ GATE 4: AUDIT & LOGGING
    const duration = Date.now() - startTime;
    await context.auditLogger.logUpdate(
      'PurchaseOrderV3',
      args.id,
      oldOrder,
      updatedOrder,
      context.user?.id,
      context.user?.email,
      context.ip
    );

    // Publish pubsub event
    context.pubsub.publish('PURCHASE_ORDER_UPDATED', {
      purchaseOrderUpdated: updatedOrder
    });

    return updatedOrder;
  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  }
}
`;

// ============================================================================
// EXAMPLE 3: DELETE with Cascade Detection
// ============================================================================

export const exampleDeleteSupplier = `
async deleteSupplierV3(_, args, context) {
  const startTime = Date.now();

  try {
    // Fetch supplier for audit trail
    const supplier = await context.database.getSupplierV3(args.id);

    // ✅ GATE 2: BUSINESS LOGIC - Check Dependencies
    const dependencies = await context.verificationEngine.checkDependencies(
      'SupplierV3',
      args.id,
      {
        'SupplierV3': [
          { table: 'purchase_orders', field: 'supplier_id' },
          { table: 'dental_materials', field: 'supplier_id' }
        ]
      }
    );

    if (dependencies.hasDependents) {
      const affectedSummary = dependencies.dependents
        .map(d => \`\${d.count} in \${d.table}\`)
        .join(', ');
      
      throw new Error(
        \`Cannot delete supplier: has dependent records (\${affectedSummary}). \` +
        \`Use soft delete or cascade delete if permitted.\`
      );
    }

    // ✅ GATE 3: DATABASE TRANSACTION
    await context.database.deleteSupplierV3(args.id);

    // ✅ GATE 4: AUDIT & LOGGING
    const duration = Date.now() - startTime;
    await context.auditLogger.logDelete(
      'SupplierV3',
      args.id,
      supplier,
      context.user?.id,
      context.user?.email,
      context.ip
    );

    // Publish event
    context.pubsub.publish('SUPPLIER_DELETED', {
      supplierDeleted: { id: args.id }
    });

    return { id: args.id, success: true };
  } catch (error) {
    console.error('❌ Delete failed:', error);
    throw error;
  }
}
`;

// ============================================================================
// EXAMPLE 4: SOFT DELETE with Cascade
// ============================================================================

export const exampleSoftDeleteDocument = `
async softDeleteDocumentV3(_, args, context) {
  const startTime = Date.now();

  try {
    // Fetch document
    const document = await context.database.getDocumentV3(args.id);

    // ✅ GATE 2: Check cascade rules
    const softDeleteConfig = await context.database.query(
      'SELECT * FROM soft_delete_config WHERE table_name = \$1',
      ['documents']
    );

    const config = softDeleteConfig.rows[0];
    let cascadedEntities = [];

    // If cascade is enabled, soft-delete children too
    if (config.cascade_delete_enabled) {
      cascadedEntities = await context.database.query(
        'SELECT id FROM document_versions WHERE document_id = \$1',
        [args.id]
      );

      for (const child of cascadedEntities.rows) {
        await context.database.softDeleteDocumentVersion(child.id);
      }
    }

    // ✅ GATE 3: DATABASE TRANSACTION
    const softDeletedDoc = await context.database.softDeleteDocumentV3(
      args.id,
      args.reason,
      context.user?.id
    );

    // ✅ GATE 4: AUDIT & LOGGING
    const duration = Date.now() - startTime;
    await context.auditLogger.logSoftDelete(
      'DocumentV3',
      args.id,
      args.reason,
      document,
      context.user?.id,
      context.user?.email,
      context.ip
    );

    // Log cascade if happened
    if (cascadedEntities.rows.length > 0) {
      await context.auditLogger.logCascadeOperation(
        'DocumentV3',
        args.id,
        [
          {
            table: 'document_versions',
            count: cascadedEntities.rows.length,
            ids: cascadedEntities.rows.map(r => r.id)
          }
        ],
        context.user?.id,
        context.user?.email,
        context.ip
      );
    }

    // Publish event
    context.pubsub.publish('DOCUMENT_SOFT_DELETED', {
      documentSoftDeleted: softDeletedDoc
    });

    return softDeletedDoc;
  } catch (error) {
    console.error('❌ Soft delete failed:', error);
    throw error;
  }
}
`;

// ============================================================================
// EXAMPLE 5: BATCH Operation
// ============================================================================

export const exampleBatchUpdateInventoryStatus = `
async batchUpdateInventoryStatusV3(_, args, context) {
  const startTime = Date.now();

  try {
    const results = [];

    for (const { inventoryId, newStatus } of args.updates) {
      try {
        // Get current inventory
        const inventory = await context.database.getInventoryV3(inventoryId);

        // ✅ GATE 1: Verify status is valid
        const statusVerification = await context.verificationEngine.verify(
          'InventoryV3',
          'status',
          newStatus
        );

        if (!statusVerification.valid) {
          results.push({
            entity_type: 'InventoryV3',
            entity_id: inventoryId,
            operation: 'UPDATE',
            success: false,
            error: statusVerification.errors[0]
          });
          continue;
        }

        // ✅ GATE 3: Update
        const updated = await context.database.updateInventoryV3(inventoryId, { status: newStatus });

        // ✅ GATE 4: Log
        await context.auditLogger.logUpdate(
          'InventoryV3',
          inventoryId,
          inventory,
          updated,
          context.user?.id,
          context.user?.email,
          context.ip
        );

        results.push({
          entity_type: 'InventoryV3',
          entity_id: inventoryId,
          operation: 'UPDATE',
          success: true
        });
      } catch (error) {
        results.push({
          entity_type: 'InventoryV3',
          entity_id: inventoryId,
          operation: 'UPDATE',
          success: false,
          error: error.message
        });
      }
    }

    // Log batch operation
    const duration = Date.now() - startTime;
    const batchResult = await context.auditLogger.logBatchOperation(
      results,
      context.user?.id,
      context.user?.email,
      context.ip
    );

    return {
      transactionId: batchResult.transaction_id,
      totalCount: batchResult.total_count,
      successCount: batchResult.success_count,
      failedCount: batchResult.failed_count,
      results
    };
  } catch (error) {
    console.error('❌ Batch update failed:', error);
    throw error;
  }
}
`;

// ============================================================================
// INTEGRATION CHECKLIST
// ============================================================================

export const integrationChecklist = `
# Integration Checklist for Four-Gate Pattern

## ✅ Setup (One-time)

1. [ ] Create VerificationEngine instance
   - In graphql/server.ts or context setup:
   \`\`\`typescript
   import VerificationEngine from '../core/VerificationEngine';
   const verificationEngine = new VerificationEngine(database.pool);
   await verificationEngine.loadRules(); // On server start
   \`\`\`

2. [ ] Create AuditLogger instance
   \`\`\`typescript
   import AuditLogger from '../core/AuditLogger';
   const auditLogger = new AuditLogger(database.pool);
   \`\`\`

3. [ ] Add to GraphQL context
   \`\`\`typescript
   const context = {
     verificationEngine,
     auditLogger,
     database,
     pubsub,
     user,
     ip,
     // ... other context
   };
   \`\`\`

4. [ ] Run SQL migrations (Phase 3 Step 1)
   - data_audit_logs table
   - integrity_checks table (31 pre-loaded rules)
   - soft_delete infrastructure

## ✅ Per-Mutation Integration

For EACH mutation in your resolvers:

1. [ ] Fetch old entity (for UPDATE/DELETE)
   \`\`\`typescript
   const old = await context.database.getEntity(args.id);
   \`\`\`

2. [ ] Call verifyBatch() for GATE 1
   \`\`\`typescript
   const verification = await context.verificationEngine.verifyBatch(
     'EntityType',
     args.input
   );
   if (!verification.valid) throw error;
   \`\`\`

3. [ ] Add business logic for GATE 2
   - State transitions: verifyStateTransition()
   - Dependencies: checkDependencies()
   - Custom logic: Your code

4. [ ] Wrap DB operation for GATE 3
   \`\`\`typescript
   const result = await context.database.mutate(args.id, args.input);
   \`\`\`

5. [ ] Log operation for GATE 4
   \`\`\`typescript
   if (operation === 'CREATE') {
     await context.auditLogger.logCreate(...);
   } else if (operation === 'UPDATE') {
     await context.auditLogger.logUpdate(oldEntity, result, ...);
   } else if (operation === 'DELETE') {
     await context.auditLogger.logDelete(...);
   }
   \`\`\`

## ✅ Testing

1. [ ] Test GATE 1: Invalid input should be blocked
   \`\`\`
   Mutation with CRITICAL violation → Error thrown
   Mutation with WARNING → Continues but logs warning
   \`\`\`

2. [ ] Test GATE 2: Business rules enforced
   \`\`\`
   Invalid state transition → Error thrown
   FK reference missing → Error thrown
   Cascade dependencies exist → Error thrown (or cascaded)
   \`\`\`

3. [ ] Test GATE 3: DB transaction
   \`\`\`
   Valid mutation → DB updated
   DB error → Caught and logged
   \`\`\`

4. [ ] Test GATE 4: Audit trail
   \`\`\`
   Mutation created → data_audit_logs entry exists
   Entry has before/after state
   Entry has user_id, timestamp, integrity_status
   \`\`\`

## ✅ Performance Optimization

1. [ ] Rules cached in memory (loaded once on startup)
2. [ ] Batch verification: Multiple fields in one call
3. [ ] DB queries indexed: entity_type, field_name, severity
4. [ ] Audit logs use JSONB for flexible schema

## ✅ Compliance

1. [ ] All mutations logged
2. [ ] User tracking: user_id, user_email, IP address
3. [ ] Before/after state captured
4. [ ] Integrity violations recorded
5. [ ] Audit trail exportable to JSON

## ✅ Monitoring

1. [ ] VerificationEngine.healthcheck() on server start
2. [ ] AuditLogger.healthcheck() on server start
3. [ ] Monitor data_audit_logs growth
4. [ ] Track violation trends (dashboard query)
`;

export default {
  exampleCreateInventory,
  exampleUpdatePurchaseOrder,
  exampleDeleteSupplier,
  exampleSoftDeleteDocument,
  exampleBatchUpdateInventoryStatus,
  integrationChecklist
};
