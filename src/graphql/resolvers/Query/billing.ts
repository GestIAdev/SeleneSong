/**
 * 💰 BILLING QUERY RESOLVERS V3
 * Mission: Provide billing data queries with @veritas verification
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// QUERY RESOLVERS
// ============================================================================

export const billingDataV3 = async (
  _: unknown,
  args: { patientId?: string; limit?: number; offset?: number },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { patientId, limit = 50, offset = 0 } = args;

    // Use specialized BillingDatabase class
    const billingData = await context.database.billing.getBillingDataV3({
      patientId,
      limit,
      offset
    });

    console.log(`✅ billingDataV3 query returned ${billingData.length} billing records`);
    return billingData;
  } catch (error) {
    console.error("❌ billingDataV3 query error:", error as Error);
    throw error;
  }
};

export const billingDatumV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    // Use specialized BillingDatabase class
    const billingData = await context.database.billing.getBillingDatumV3ById(args.id);

    if (!billingData) {
      throw new Error(`Billing data not found: ${args.id}`);
    }

    console.log(`✅ billingDatumV3 query returned billing data: ${billingData.id}`);
    return billingData;
  } catch (error) {
    console.error("❌ billingDatumV3 query error:", error as Error);
    throw error;
  }
};

// ============================================================================
// PAYMENT TRACKING QUERY RESOLVERS
// ============================================================================

/**
 * Obtiene planes de pago con filtros opcionales
 */
export const getPaymentPlans = async (
  _: unknown,
  args: {
    billingId?: string;
    patientId?: string;
    status?: string;
  },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { billingId, patientId, status } = args;

    const plans = await context.database.billing.getPaymentPlans({
      billingId,
      patientId,
      status
    });

    console.log(`✅ getPaymentPlans query returned ${plans.length} payment plans`);
    return plans;
  } catch (error) {
    console.error("❌ getPaymentPlans query error:", error as Error);
    throw error;
  }
};

/**
 * Obtiene un plan de pago por ID
 */
export const getPaymentPlanById = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const plan = await context.database.billing.getPaymentPlanById(args.id);

    if (!plan) {
      throw new Error(`Payment plan not found: ${args.id}`);
    }

    console.log(`✅ getPaymentPlanById query returned plan: ${plan.id}`);
    return plan;
  } catch (error) {
    console.error("❌ getPaymentPlanById query error:", error as Error);
    throw error;
  }
};

/**
 * Obtiene pagos parciales con filtros opcionales
 */
export const getPartialPayments = async (
  _: unknown,
  args: {
    invoiceId: string;
    patientId?: string;
  },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { invoiceId, patientId } = args;

    const payments = await context.database.billing.getPartialPayments({
      invoiceId,
      patientId
    });

    console.log(`✅ getPartialPayments query returned ${payments.length} partial payments`);
    return payments;
  } catch (error) {
    console.error("❌ getPartialPayments query error:", error as Error);
    throw error;
  }
};

/**
 * Obtiene recordatorios de pago con filtros opcionales
 */
export const getPaymentReminders = async (
  _: unknown,
  args: {
    billingId?: string;
    patientId?: string;
    status?: string;
  },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { billingId, patientId, status } = args;

    const reminders = await context.database.billing.getPaymentReminders({
      billingId,
      patientId,
      status
    });

    console.log(`✅ getPaymentReminders query returned ${reminders.length} reminders`);
    return reminders;
  } catch (error) {
    console.error("❌ getPaymentReminders query error:", error as Error);
    throw error;
  }
};

/**
 * Obtiene recibos de pago con filtros opcionales
 */
export const getPaymentReceipts = async (
  _: unknown,
  args: {
    invoiceId: string;
    patientId?: string;
  },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { invoiceId, patientId } = args;

    const receipts = await context.database.billing.getPaymentReceipts({
      invoiceId,
      patientId
    });

    console.log(`✅ getPaymentReceipts query returned ${receipts.length} receipts`);
    return receipts;
  } catch (error) {
    console.error("❌ getPaymentReceipts query error:", error as Error);
    throw error;
  }
};

/**
 * Obtiene un recibo de pago por ID
 */
export const getPaymentReceiptById = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const receipt = await context.database.billing.getPaymentReceiptById(args.id);

    if (!receipt) {
      throw new Error(`Payment receipt not found: ${args.id}`);
    }

    console.log(`✅ getPaymentReceiptById query returned receipt: ${receipt.id}`);
    return receipt;
  } catch (error) {
    console.error("❌ getPaymentReceiptById query error:", error as Error);
    throw error;
  }
};

// Export consolidated billing queries object
export const billingQueries = {
  billingDataV3,
  billingDatumV3,
  // Payment Tracking Queries
  getPaymentPlans,
  getPaymentPlanById,
  getPartialPayments,
  getPaymentReminders,
  getPaymentReceipts,
  getPaymentReceiptById
};