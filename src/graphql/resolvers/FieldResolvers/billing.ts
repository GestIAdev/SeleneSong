import type { GraphQLContext } from '../../types.js';

// ============================================================================
// BILLING FIELD RESOLVERS V3 - UNIFIED WITH COMPLETE SQL SCHEMA
// ============================================================================

export const BillingDataV3 = {
  id: async (parent: any) => parent.id,
  patientId: async (parent: any) => parent.patient_id,
  invoiceNumber: async (parent: any) => parent.invoice_number,
  subtotal: async (parent: any) => parent.subtotal,
  taxRate: async (parent: any) => parent.tax_rate,
  taxAmount: async (parent: any) => parent.tax_amount,
  discountAmount: async (parent: any) => parent.discount_amount,
  totalAmount: async (parent: any) => parent.total_amount,
  currency: async (parent: any) => parent.currency,
  issueDate: async (parent: any) => parent.issue_date,
  dueDate: async (parent: any) => parent.due_date,
  status: async (parent: any) => parent.status,
  paymentTerms: async (parent: any) => parent.payment_terms,
  notes: async (parent: any) => parent.notes,
  createdAt: async (parent: any) => parent.created_at,
  updatedAt: async (parent: any) => parent.updated_at,
};

// ============================================================================
// PAYMENT PLAN FIELD RESOLVER - SQL snake_case → GraphQL camelCase
// ============================================================================
export const PaymentPlan = {
  id: async (parent: any) => parent.id,
  billingId: async (parent: any) => parent.billing_id,
  patientId: async (parent: any) => parent.patient_id,
  totalAmount: async (parent: any) => parent.total_amount,
  installmentsCount: async (parent: any) => parent.installments_count,
  installmentAmount: async (parent: any) => parent.installment_amount,
  frequency: async (parent: any) => parent.frequency,
  startDate: async (parent: any) => parent.start_date,
  endDate: async (parent: any) => parent.end_date,
  status: async (parent: any) => parent.status,
  veritasSignature: async (parent: any) => parent.veritas_signature,
  createdBy: async (parent: any) => parent.created_by,
  createdAt: async (parent: any) => parent.created_at,
  updatedAt: async (parent: any) => parent.updated_at,
};

// ============================================================================
// PARTIAL PAYMENT FIELD RESOLVER - SQL snake_case → GraphQL camelCase
// ============================================================================
export const PartialPayment = {
  id: async (parent: any) => parent.id,
  invoiceId: async (parent: any) => parent.invoice_id,
  patientId: async (parent: any) => parent.patient_id,
  paymentPlanId: async (parent: any) => parent.payment_plan_id,
  amount: async (parent: any) => parent.amount,
  currency: async (parent: any) => parent.currency,
  methodType: async (parent: any) => parent.method,
  transactionId: async (parent: any) => parent.transaction_id,
  status: async (parent: any) => parent.status,
  veritasSignature: async (parent: any) => parent.veritas_signature,
  processedAt: async (parent: any) => parent.processed_at,
  createdAt: async (parent: any) => parent.created_at,
  updatedAt: async (parent: any) => parent.updated_at,
};

// ============================================================================
// PAYMENT RECEIPT FIELD RESOLVER - SQL snake_case → GraphQL camelCase
// ============================================================================
export const PaymentReceipt = {
  id: async (parent: any) => parent.id,
  paymentId: async (parent: any) => parent.payment_id,
  billingId: async (parent: any) => parent.billing_id,
  patientId: async (parent: any) => parent.patient_id,
  receiptNumber: async (parent: any) => parent.receipt_number,
  totalAmount: async (parent: any) => parent.total_amount,
  paidAmount: async (parent: any) => parent.paid_amount,
  balanceRemaining: async (parent: any) => parent.balance_remaining,
  generatedAt: async (parent: any) => parent.generated_at,
  veritasSignature: async (parent: any) => parent.veritas_signature,
  pdfUrl: async (parent: any) => parent.pdf_url,
  metadata: async (parent: any) => parent.metadata,
  createdBy: async (parent: any) => parent.created_by,
  createdAt: async (parent: any) => parent.created_at,
  updatedAt: async (parent: any) => parent.updated_at,
};