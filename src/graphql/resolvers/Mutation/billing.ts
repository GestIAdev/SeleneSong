import type { GraphQLContext } from '../../types.js';
import { getClinicIdFromContext } from '../../utils/clinicHelpers.js';

// ============================================================================
// BILLING MUTATION RESOLVERS V3 - FOUR-GATE PATTERN
// ============================================================================

// 🔥 CREATE BILLING DATA V3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4)
export const createBillingDataV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log("🎯 [BILLING] createBillingDataV3 - Creating with FOUR-GATE protection");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation (ECONOMIC SINGULARITY aligned)
    if (!args.input || typeof args.input !== 'object') {
      throw new Error('Invalid input: must be a non-null object');
    }
    if (!args.input.patientId) {
      throw new Error('Validation failed: patientId is required');
    }
    if (!args.input.totalAmount || args.input.totalAmount <= 0) {
      throw new Error('Validation failed: totalAmount must be positive');
    }

    // 🏛️ EMPIRE V2: Extract and inject clinic_id
    const clinicId = getClinicIdFromContext(context);
    
    if (!clinicId) {
      throw new Error('🏛️ EMPIRE V2: clinic_id required for invoice creation');
    }

    // 💰 OPERATION CASHFLOW: Remove invoiceNumber from input (auto-generated)
    const { invoiceNumber, ...inputWithoutInvoiceNumber } = args.input;
    const inputWithClinic = { ...inputWithoutInvoiceNumber, clinicId };

    console.log(`✅ GATE 1 (Verificación) - Input validated (patientId, totalAmount, clinic: ${clinicId})`);

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation (will auto-generate invoice number)
    const billingData = await context.database.billing.createBillingDataV3(inputWithClinic);
    console.log(`✅ GATE 3 (Transacción DB) - Created: ${billingData.id} (invoice: ${billingData.invoice_number})`);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail (NON-BLOCKING)
    if (context.auditLogger) {
      try {
        await context.auditLogger.logMutation({
          entityType: 'BillingDataV3',
          entityId: billingData.id,
          operationType: 'CREATE',
          userId: context.user?.id,
          userEmail: context.user?.email,
          ipAddress: context.ip,
          newValues: billingData,
        });
        console.log("✅ GATE 4 (Auditoría) - Mutation logged");
      } catch (auditError) {
        console.warn("⚠️ GATE 4 (Auditoría) - Logging failed (non-blocking):", (auditError as Error).message);
      }
    }

    if (context.pubsub) {
      context.pubsub.publish('BILLING_DATA_V3_CREATED', {
        billingDataV3Created: billingData,
      });
    }

    console.log(`✅ createBillingDataV3 mutation created: ${billingData.id}`);
    return billingData;
  } catch (error) {
    console.error("❌ createBillingDataV3 mutation error:", error as Error);
    throw new Error(`Failed to create billing data: ${(error as Error).message}`);
  }
};

// 🔥 UPDATE BILLING DATA V3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4)
export const updateBillingDataV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log("🎯 [BILLING] updateBillingDataV3 - Updating with FOUR-GATE protection");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!args.id) {
      throw new Error('Validation failed: id is required');
    }
    if (!args.input || typeof args.input !== 'object') {
      throw new Error('Invalid input: must be a non-null object');
    }

    // 🏛️ EMPIRE V2: Extract clinic_id for ownership check
    const clinicId = getClinicIdFromContext(context);

    console.log("✅ GATE 1 (Verificación) - Input validated");

    // Capture old values for audit trail (WITH ownership check)
    const oldBillingData = await context.database.billing.getBillingDatumV3ById(args.id, clinicId);
    if (!oldBillingData) {
      throw new Error(`Billing data ${args.id} not found or access denied`);
    }

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation (with immutability + ownership)
    const billingData = await context.database.billing.updateBillingDataV3(args.id, args.input, clinicId);
    console.log(`✅ GATE 3 (Transacción DB) - Updated: ${billingData.id} (clinic: ${clinicId || 'ANY'})`);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'BillingDataV3',
        entityId: args.id,
        operationType: 'UPDATE',
        userId: context.user?.id,
        userEmail: context.user?.email,
        ipAddress: context.ip,
        oldValues: oldBillingData,
        newValues: billingData,
        changedFields: Object.keys(args.input),
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged");
    }

    if (context.pubsub) {
      context.pubsub.publish('BILLING_DATA_V3_UPDATED', {
        billingDataV3Updated: billingData,
      });
    }

    console.log(`✅ updateBillingDataV3 mutation updated: ${billingData.id}`);
    return billingData;
  } catch (error) {
    console.error("❌ updateBillingDataV3 mutation error:", error as Error);
    throw new Error(`Failed to update billing data: ${(error as Error).message}`);
  }
};

// 🔥 DELETE BILLING DATA V3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4)
export const deleteBillingDataV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  console.log("🎯 [BILLING] deleteBillingDataV3 - Deleting with FOUR-GATE protection");
  
  try {
    // ✅ GATE 1: VERIFICACIÓN - Input validation
    if (!args.id) {
      throw new Error('Validation failed: id is required');
    }

    // 🏛️ EMPIRE V2: Extract clinic_id for ownership check
    const clinicId = getClinicIdFromContext(context);

    console.log("✅ GATE 1 (Verificación) - Input validated");

    // Capture old values for audit trail (WITH ownership check)
    const oldBillingData = await context.database.billing.getBillingDatumV3ById(args.id, clinicId);
    if (!oldBillingData) {
      throw new Error(`Billing data ${args.id} not found or access denied`);
    }

    // ✅ GATE 3: TRANSACCIÓN DB - Real database operation (with ownership check)
    await context.database.billing.deleteBillingDataV3(args.id, clinicId);
    console.log(`✅ GATE 3 (Transacción DB) - Deleted: ${args.id} (clinic: ${clinicId || 'ANY'})`);

    // ✅ GATE 4: AUDITORÍA - Log to audit trail
    if (context.auditLogger) {
      await context.auditLogger.logMutation({
        entityType: 'BillingDataV3',
        entityId: args.id,
        operationType: 'DELETE',
        userId: context.user?.id,
        userEmail: context.user?.email,
        ipAddress: context.ip,
        oldValues: oldBillingData,
      });
      console.log("✅ GATE 4 (Auditoría) - Mutation logged");
    }

    if (context.pubsub) {
      context.pubsub.publish('BILLING_DATA_V3_DELETED', {
        billingDataV3Deleted: args.id,
      });
    }

    console.log(`✅ deleteBillingDataV3 mutation deleted ID: ${args.id}`);
    return true;
  } catch (error) {
    console.error("❌ deleteBillingDataV3 mutation error:", error as Error);
    throw new Error(`Failed to delete billing data: ${(error as Error).message}`);
  }
};

// ============================================================================
// PAYMENT TRACKING MUTATION RESOLVERS - FOUR-GATE PATTERN
// ============================================================================

/**
 * Crea un nuevo plan de pagos (Payment Tracking Module)
 * Implementa el Four-Gate Pattern:
 * 1. Verificación (VerificationEngine)
 * 2. Lógica de Negocio (BusinessLogic)
 * 3. Transacción DB (Database)
 * 4. Auditoría (AuditLogger)
 */
export const createPaymentPlan = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  console.log("🔥🔥🔥 [BILLING] createPaymentPlan CALLED");
  console.log("🔥🔥🔥 [BILLING] Input:", JSON.stringify(args.input, null, 2));
  console.log("🔥🔥🔥 [BILLING] Context has database?", !!context.database);
  console.log("🔥🔥🔥 [BILLING] Context.database has billing?", !!context.database?.billing);
  
  const { input } = args;
  const { database } = context;
  const startTime = Date.now();
  // 🚨 TEMPORARY: verificationEngine, auditLogger not in context yet
  // const verificationEngine = context.verificationEngine;
  // const auditLogger = context.auditLogger;
  const user = context.user;
  const ip = context.ip;
  let verificationFailed = false;

  try {
    // --------------------------------------------------------------------------
    // 🔥 PUERTA 1: VERIFICACIÓN (El Guardián - VerificationEngine)
    // --------------------------------------------------------------------------
    // 🚨 TEMPORARY BYPASS: Integrity rules not configured yet
    // TODO: Configure integrity_checks for PaymentPlanV3 and re-enable
    /*
    const verification = await verificationEngine.verifyBatch(
      'PaymentPlanV3',
      input
    );

    if (!verification.valid) {
      // Si la verificación falla, registramos la violación y paramos
      await auditLogger.logIntegrityViolation(
        'PaymentPlanV3',
        'N/A (CREATE)',
        verification.criticalFields[0] || 'batch',
        input,
        verification.errors[0] || verification.errors.join(', '),
        (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }
    */

    // --------------------------------------------------------------------------
    // 🎯 PUERTA 2: LÓGICA DE NEGOCIO (El Arquitecto)
    // --------------------------------------------------------------------------
    // Validar que installmentAmount * installmentsCount == totalAmount
    const calculatedTotal = input.installmentAmount * input.installmentsCount;
    if (Math.abs(calculatedTotal - input.totalAmount) > 0.01) {
      throw new Error(
        `Monto de cuota inconsistente: ${input.installmentAmount} x ${input.installmentsCount} = ${calculatedTotal}, pero totalAmount = ${input.totalAmount}`
      );
    }

    // Validar que startDate sea válida
    const startDate = new Date(input.startDate);
    if (isNaN(startDate.getTime())) {
      throw new Error(`Fecha de inicio inválida: ${input.startDate}`);
    }

    // --------------------------------------------------------------------------
    // 💾 PUERTA 3: TRANSACCIÓN DB (El Ejecutor)
    // --------------------------------------------------------------------------
    const newPaymentPlan = await database.billing.createPaymentPlan({
      ...input,
      userId: user?.id
    });

    // --------------------------------------------------------------------------
    // 📝 PUERTA 4: AUDITORÍA (El Cronista - AuditLogger)
    // --------------------------------------------------------------------------
    const duration = Date.now() - startTime;

    // ✅ PHASE 2: AUDIT LOGGING ENABLED
    console.log('🔍 DEBUG: createPaymentPlan GATE 4 - context.auditLogger exists?', !!context.auditLogger);
    console.log('🔍 DEBUG: createPaymentPlan GATE 4 - context keys:', Object.keys(context));
    
    if (context.auditLogger) {
      try {
        console.log('🔍 DEBUG: Calling auditLogger.logCreate...');
        await context.auditLogger.logCreate(
          'PaymentPlanV3',
          newPaymentPlan.id,
          newPaymentPlan,
          user?.id,
          user?.email,
          ip
        );
        console.log('✅ DEBUG: auditLogger.logCreate completed');
      } catch (auditError) {
        console.warn(`⚠️ Failed to log audit trail for createPaymentPlan:`, auditError);
        // Don't throw - audit failure shouldn't break the mutation
      }
    } else {
      console.error('❌ DEBUG: context.auditLogger is MISSING or undefined!');
    }

    // (Opcional: Publicar evento de WebSocket si tienes PubSub configurado)
    if (context.pubsub) {
      context.pubsub.publish('PAYMENT_PLAN_CREATED', {
        paymentPlanCreated: newPaymentPlan
      });
    }

    console.log(
      `✅ createPaymentPlan mutation created: ${newPaymentPlan.id} (${duration}ms)`
    );
    return newPaymentPlan;
  } catch (error) {
    // ✅ PHASE 2: AUDIT LOGGING FOR ERRORS
    if (context.auditLogger && !verificationFailed) {
      try {
        await context.auditLogger.logIntegrityViolation(
          'PaymentPlanV3',
          'N/A (CREATE)',
          'unknown',
          input,
          (error as Error).message,
          'CRITICAL',
          user?.id,
          user?.email,
          ip
        );
      } catch (auditError) {
        console.warn(`⚠️ Failed to log audit violation for createPaymentPlan:`, auditError);
      }
    }

    console.error("❌ createPaymentPlan mutation error:", error as Error);
    throw error;
  }
};

/**
 * Actualiza el status de un plan de pagos
 * Implementa el Four-Gate Pattern
 */
export const updatePaymentPlanStatus = async (
  _: unknown,
  args: { planId: string; status: string },
  context: GraphQLContext
): Promise<any> => {
  const { planId, status } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    // --------------------------------------------------------------------------
    // 🔥 PUERTA 1: VERIFICACIÓN (El Guardián)
    // --------------------------------------------------------------------------
    // Obtener el plan actual para auditoría
    const oldPlan = await database.billing.getPaymentPlanById(planId);
    if (!oldPlan) {
      throw new Error(`Plan de pagos no encontrado: ${planId}`);
    }

    // Verificar que el status sea válido
    const validStatuses = ['active', 'paused', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Status inválido: ${status}. Valores válidos: ${validStatuses.join(', ')}`);
    }

    // --------------------------------------------------------------------------
    // 🎯 PUERTA 2: LÓGICA DE NEGOCIO (El Arquitecto)
    // --------------------------------------------------------------------------
    // No se puede cambiar a 'completed' manualmente; se completa cuando se pagan todas las cuotas
    if (status === 'completed' && oldPlan.status !== 'active') {
      throw new Error('Solo se puede completar un plan activo');
    }

    // --------------------------------------------------------------------------
    // 💾 PUERTA 3: TRANSACCIÓN DB (El Ejecutor)
    // --------------------------------------------------------------------------
    const updatedPlan = await database.billing.updatePaymentPlanStatus(planId, status);

    // --------------------------------------------------------------------------
    // 📝 PUERTA 4: AUDITORÍA (El Cronista)
    // --------------------------------------------------------------------------
    const duration = Date.now() - startTime;

    await auditLogger.logUpdate(
      'PaymentPlanV3',
      planId,
      oldPlan,
      updatedPlan,
      user?.id,
      user?.email,
      ip
    );

    // Publicar evento
    if (context.pubsub) {
      context.pubsub.publish('PAYMENT_PLAN_UPDATED', {
        paymentPlanUpdated: updatedPlan
      });
    }

    console.log(
      `✅ updatePaymentPlanStatus mutation updated: ${planId} -> ${status} (${duration}ms)`
    );
    return updatedPlan;
  } catch (error) {
    // Registrar error
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation(
        'PaymentPlanV3',
        planId,
        'status',
        { status },
        (error as Error).message,
        'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
    }

    console.error("❌ updatePaymentPlanStatus mutation error:", error as Error);
    throw error;
  }
};

/**
 * Cancela un plan de pagos
 * Implementa el Four-Gate Pattern
 */
export const cancelPaymentPlan = async (
  _: unknown,
  args: { planId: string },
  context: GraphQLContext
): Promise<boolean> => {
  const { planId } = args;
  const { database, auditLogger, user, ip } = context;
  const startTime = Date.now();

  try {
    // --------------------------------------------------------------------------
    // 🔥 PUERTA 1: VERIFICACIÓN (El Guardián)
    // --------------------------------------------------------------------------
    const oldPlan = await database.billing.getPaymentPlanById(planId);
    if (!oldPlan) {
      throw new Error(`Plan de pagos no encontrado: ${planId}`);
    }

    if (oldPlan.status === 'cancelled') {
      throw new Error(`Plan ya estaba cancelado: ${planId}`);
    }

    // --------------------------------------------------------------------------
    // 🎯 PUERTA 2: LÓGICA DE NEGOCIO (El Arquitecto)
    // --------------------------------------------------------------------------
    // No se puede cancelar un plan completado
    if (oldPlan.status === 'completed') {
      throw new Error('No se puede cancelar un plan completado');
    }

    // --------------------------------------------------------------------------
    // 💾 PUERTA 3: TRANSACCIÓN DB (El Ejecutor)
    // --------------------------------------------------------------------------
    const success = await database.billing.cancelPaymentPlan(planId, user?.id);

    // --------------------------------------------------------------------------
    // 📝 PUERTA 4: AUDITORÍA (El Cronista)
    // --------------------------------------------------------------------------
    const duration = Date.now() - startTime;

    if (success) {
      await auditLogger.logDelete(
        'PaymentPlanV3',
        planId,
        oldPlan,
        user?.id,
        user?.email,
        ip
      );

      // Publicar evento
      if (context.pubsub) {
        context.pubsub.publish('PAYMENT_PLAN_CANCELLED', {
          paymentPlanCancelled: { id: planId, status: 'cancelled' }
        });
      }
    }

    console.log(`✅ cancelPaymentPlan mutation cancelled: ${planId} (${duration}ms)`);
    return success;
  } catch (error) {
    // Registrar error
    if (auditLogger) {
      await auditLogger.logIntegrityViolation(
        'PaymentPlanV3',
        planId,
        'cancel',
        { planId },
        (error as Error).message,
        'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
    }

    console.error("❌ cancelPaymentPlan mutation error:", error as Error);
    throw error;
  }
};

/**
 * Registra un pago parcial (Payment Tracking Module - Puente Agnóstico)
 * 
 * Esta mutación es crítica porque maneja dinero real desde el sistema de pagos
 * (VISA/MC, QR, Bizum, etc.) y actualiza automáticamente el status de la factura.
 * 
 * FLUJO TRANSACCIONAL (BEGIN/COMMIT):
 * - Inserta pago en partial_payments
 * - Recalcula total pagado (SUM)
 * - Actualiza status de billing_data (PENDING → PARTIAL → PAID)
 * 
 * Implementa el Four-Gate Pattern con auditoría doble (pago + factura)
 */
export const recordPartialPayment = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  const { input } = args;
  const { database } = context;
  // 🚨 TEMPORARY: verificationEngine, auditLogger not in context yet
  const user = context.user;
  const ip = context.ip;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    // --------------------------------------------------------------------------
    // 🔥 PUERTA 1: VERIFICACIÓN (El Guardián - VerificationEngine)
    // --------------------------------------------------------------------------
    // 🚨 TEMPORARY BYPASS: Integrity rules not configured yet
    // TODO: Configure integrity_checks for PartialPaymentV3 and re-enable
    /*
    const verification = await verificationEngine.verifyBatch(
      'PartialPaymentV3',
      input
    );

    if (!verification.valid) {
      await auditLogger.logIntegrityViolation(
        'PartialPaymentV3',
        'N/A (CREATE)',
        verification.criticalFields[0] || 'batch',
        input,
        verification.errors[0] || verification.errors.join(', '),
        (verification.severity || 'CRITICAL') as 'WARNING' | 'ERROR' | 'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
      verificationFailed = true;
      throw new Error(`Error de validación: ${verification.errors.join(', ')}`);
    }
    */

    // --------------------------------------------------------------------------
    // 🎯 PUERTA 2: LÓGICA DE NEGOCIO (El Arquitecto)
    // --------------------------------------------------------------------------
    // Obtener el estado actual de la factura para auditoría
    const oldInvoice = await database.billing.getBillingDataById(input.invoiceId);
    if (!oldInvoice) {
      throw new Error(`Factura (billing_data) no encontrada: ${input.invoiceId}`);
    }

    // No se puede registrar pagos en facturas ya pagadas completamente
    if (oldInvoice.status === 'PAID') {
      throw new Error('Esta factura ya ha sido pagada en su totalidad.');
    }

    // Validar que el monto sea positivo
    if (input.amount <= 0) {
      throw new Error(`El monto del pago debe ser positivo: ${input.amount}`);
    }

    // Validar que el currency sea válido
    const validCurrencies = ['EUR', 'USD', 'MXN', 'ARS', 'COP', 'CLP', 'PEN'];
    if (!validCurrencies.includes(input.currency)) {
      throw new Error(
        `Moneda inválida: ${input.currency}. Valores válidos: ${validCurrencies.join(', ')}`
      );
    }

    // --------------------------------------------------------------------------
    // 💾 PUERTA 3: TRANSACCIÓN DB (El Ejecutor)
    // --------------------------------------------------------------------------
    // La lógica transaccional compleja (BEGIN/COMMIT) está en el método de la DB
    const { newPayment, updatedInvoice } = await database.billing.recordPartialPayment({
      invoiceId: input.invoiceId,
      patientId: input.patientId,
      paymentPlanId: input.paymentPlanId,
      amount: input.amount,
      currency: input.currency,
      method: input.methodType, // 🔥 MAPEO: GraphQL methodType → SQL method
      transactionId: input.transactionId,
      reference: input.reference,
      metadata: input.metadata,
      userId: user?.id
    });

    // --------------------------------------------------------------------------
    // 📝 PUERTA 4: AUDITORÍA (El Cronista - AuditLogger)
    // --------------------------------------------------------------------------
    const duration = Date.now() - startTime;

    // ✅ PHASE 2: AUDIT LOGGING ENABLED (Double audit: payment CREATE + invoice UPDATE)
    if (context.auditLogger) {
      try {
        // 4a. Registrar la creación del pago
        await context.auditLogger.logCreate(
          'PartialPaymentV3',
          newPayment.id,
          newPayment,
          user?.id,
          user?.email,
          ip
        );

        // 4b. Registrar la actualización de la factura (status change)
        await context.auditLogger.logUpdate(
          'BillingDataV3',
          updatedInvoice.id,
          oldInvoice,
          updatedInvoice,
          user?.id,
          user?.email,
          ip
        );
      } catch (auditError) {
        console.warn(`⚠️ Failed to log audit trail for recordPartialPayment:`, auditError);
        // Don't throw - audit failure shouldn't break the mutation
      }
    }

    // Publicar eventos WebSocket (opcional, para actualizar frontend en tiempo real)
    if (context.pubsub) {
      context.pubsub.publish('PAYMENT_RECORDED', {
        partialPaymentAdded: newPayment
      });
      context.pubsub.publish('INVOICE_UPDATED', {
        invoiceUpdated: updatedInvoice
      });
    }

    console.log(
      `✅ recordPartialPayment mutation: ${input.amount} ${input.currency} ` +
      `registrado en factura ${input.invoiceId} (${duration}ms)`
    );

    return newPayment; // Devolver el objeto de pago creado
  } catch (error) {
    // ✅ PHASE 2: AUDIT LOGGING FOR ERRORS
    if (context.auditLogger && !verificationFailed) {
      try {
        await context.auditLogger.logIntegrityViolation(
          'PartialPaymentV3',
          input.invoiceId || 'N/A',
          'transaction',
          input,
          (error as Error).message,
          'CRITICAL',
          user?.id,
          user?.email,
          ip
        );
      } catch (auditError) {
        console.warn(`⚠️ Failed to log audit violation for recordPartialPayment:`, auditError);
      }
    }

    console.error("❌ recordPartialPayment mutation error:", error as Error);
    throw error;
  }
};

// ============================================================================
// PAYMENT REMINDERS & RECEIPTS MUTATIONS
// ============================================================================

/**
 * MUTATION: scheduleReminder
 * Programa un nuevo recordatorio de pago
 * Four-Gate Pattern: Verification → Business Logic → DB Transaction → Audit
 */
export const scheduleReminder = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  const startTime = Date.now();
  const { input } = args;
  const { verificationEngine, auditLogger, user, ip } = context;
  let verificationFailed = false;

  try {
    // ================================
    // GATE 1: VERIFICATION (Veritas)
    // ================================
    const verificationResult = await verificationEngine.verify(
      'scheduleReminder',
      {
        billingId: input.billingId,
        patientId: input.patientId,
        reminderType: input.reminderType,
        scheduledAt: input.scheduledAt
      },
      {
        operation: 'create_payment_reminder',
        timestamp: new Date().toISOString(),
        user: user?.id || 'anonymous'
      }
    );

    if (!verificationResult.isValid) {
      verificationFailed = true;
      await auditLogger.logIntegrityViolation(
        'PaymentReminder',
        input.billingId,
        'verification',
        input,
        verificationResult.errors?.join(', ') || 'Verification failed',
        'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
      throw new Error(`Verification failed: ${verificationResult.errors?.join(', ')}`);
    }

    // ================================
    // GATE 2: BUSINESS LOGIC
    // ================================
    if (!input.scheduledAt || isNaN(Date.parse(input.scheduledAt))) {
      throw new Error('Invalid scheduled date');
    }

    const scheduledDate = new Date(input.scheduledAt);
    const now = new Date();
    if (scheduledDate < now) {
      throw new Error('Scheduled date must be in the future');
    }

    if (!['email', 'sms', 'push', 'whatsapp'].includes(input.reminderType)) {
      throw new Error(`Invalid reminderType: ${input.reminderType}`);
    }

    // ================================
    // GATE 3: DATABASE TRANSACTION
    // ================================
    const newReminder = await context.database.billing.scheduleReminder({
      billingId: input.billingId,
      patientId: input.patientId,
      scheduledAt: input.scheduledAt,
      reminderType: input.reminderType,
      messageTemplate: input.messageTemplate || 'Payment reminder',
      metadata: input.metadata || {}
    });

    // ================================
    // GATE 4: AUDIT LOGGING (Veritas)
    // ================================
    const duration = Date.now() - startTime;
    await auditLogger.logDataChange(
      'PaymentReminder',
      newReminder.id,
      'INSERT',
      null,
      newReminder,
      'ACTIVE',
      user?.id,
      user?.email,
      ip
    );

    console.log(
      `✅ scheduleReminder mutation: Recordatorio ${input.reminderType} programado ` +
      `para ${input.scheduledAt} (${duration}ms)`
    );

    return newReminder;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation(
        'PaymentReminder',
        input.billingId || 'N/A',
        'transaction',
        input,
        (error as Error).message,
        'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
    }

    console.error("❌ scheduleReminder mutation error:", error as Error);
    throw error;
  }
};

/**
 * MUTATION: sendReminder
 * Marca un recordatorio como enviado
 * Four-Gate Pattern: Verification → Business Logic → DB Transaction → Audit
 */
export const sendReminder = async (
  _: unknown,
  args: { reminderId: string },
  context: GraphQLContext
): Promise<any> => {
  const startTime = Date.now();
  const { reminderId } = args;
  const { verificationEngine, auditLogger, user, ip } = context;
  let verificationFailed = false;

  try {
    // ================================
    // GATE 1: VERIFICATION (Veritas)
    // ================================
    const verificationResult = await verificationEngine.verify(
      'sendReminder',
      { reminderId },
      {
        operation: 'send_payment_reminder',
        timestamp: new Date().toISOString(),
        user: user?.id || 'anonymous'
      }
    );

    if (!verificationResult.isValid) {
      verificationFailed = true;
      await auditLogger.logIntegrityViolation(
        'PaymentReminder',
        reminderId,
        'verification',
        { reminderId },
        verificationResult.errors?.join(', ') || 'Verification failed',
        'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
      throw new Error(`Verification failed: ${verificationResult.errors?.join(', ')}`);
    }

    // ================================
    // GATE 2: BUSINESS LOGIC
    // ================================
    // TODO: Aquí se integraría con el servicio de envío real (email, SMS, etc.)
    // Por ahora solo actualizamos el status en DB

    // ================================
    // GATE 3: DATABASE TRANSACTION
    // ================================
    const sentReminder = await context.database.billing.sendReminder(reminderId);

    if (!sentReminder) {
      throw new Error(`Payment reminder not found: ${reminderId}`);
    }

    // ================================
    // GATE 4: AUDIT LOGGING (Veritas)
    // ================================
    const duration = Date.now() - startTime;
    await auditLogger.logDataChange(
      'PaymentReminder',
      reminderId,
      'UPDATE',
      { status: 'scheduled' },
      { status: 'sent', sent_at: new Date() },
      'ACTIVE',
      user?.id,
      user?.email,
      ip
    );

    console.log(`✅ sendReminder mutation: Recordatorio ${reminderId} marcado como enviado (${duration}ms)`);

    return sentReminder;
  } catch (error) {
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation(
        'PaymentReminder',
        reminderId,
        'transaction',
        { reminderId },
        (error as Error).message,
        'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
    }

    console.error("❌ sendReminder mutation error:", error as Error);
    throw error;
  }
};

/**
 * MUTATION: generateReceipt
 * Genera un recibo de pago con firma Veritas SHA-256
 * Four-Gate Pattern: Verification → Business Logic → DB Transaction → Audit
 */
export const generateReceipt = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  const startTime = Date.now();
  const { input } = args;
  const { database } = context;
  // 🚨 TEMPORARY: verificationEngine, auditLogger not in context yet
  const user = context.user;
  const ip = context.ip;
  let verificationFailed = false;

  try {
    // ================================
    // GATE 1: VERIFICATION (Veritas)
    // ================================
    // 🚨 TEMPORARY BYPASS: Integrity rules not configured yet
    // TODO: Configure integrity_checks for PaymentReceiptV3 and re-enable
    /*
    const verificationResult = await verificationEngine.verify(
      'generateReceipt',
      {
        paymentId: input.paymentId,
        billingId: input.billingId,
        patientId: input.patientId,
        totalAmount: input.totalAmount,
        paidAmount: input.paidAmount
      },
      {
        operation: 'generate_payment_receipt',
        timestamp: new Date().toISOString(),
        user: user?.id || 'anonymous'
      }
    );

    if (!verificationResult.isValid) {
      verificationFailed = true;
      await auditLogger.logIntegrityViolation(
        'PaymentReceipt',
        input.billingId,
        'verification',
        input,
        verificationResult.errors?.join(', ') || 'Verification failed',
        'CRITICAL',
        user?.id,
        user?.email,
        ip
      );
      throw new Error(`Verification failed: ${verificationResult.errors?.join(', ')}`);
    }
    */

    // ================================
    // GATE 2: BUSINESS LOGIC
    // ================================
    if (input.paidAmount <= 0) {
      throw new Error('Paid amount must be greater than 0');
    }

    if (input.totalAmount <= 0) {
      throw new Error('Total amount must be greater than 0');
    }

    if (input.paidAmount > input.totalAmount) {
      throw new Error('Paid amount cannot exceed total amount');
    }

    const balanceRemaining = input.totalAmount - input.paidAmount;

    // ================================
    // GATE 3: DATABASE TRANSACTION
    // ================================
    const newReceipt = await context.database.billing.generateReceipt({
      paymentId: input.paymentId,
      billingId: input.billingId,
      patientId: input.patientId,
      receiptNumber: input.receiptNumber,
      totalAmount: input.totalAmount,
      paidAmount: input.paidAmount,
      balanceRemaining,
      metadata: input.metadata || {}
    });

    // ================================
    // GATE 4: AUDIT LOGGING (Veritas)
    // ================================
    const duration = Date.now() - startTime;
    
    // ✅ PHASE 2: AUDIT LOGGING ENABLED
    if (context.auditLogger) {
      try {
        await context.auditLogger.logCreate(
          'PaymentReceiptV3',
          newReceipt.id,
          newReceipt,
          user?.id,
          user?.email,
          ip
        );
      } catch (auditError) {
        console.warn(`⚠️ Failed to log audit trail for generateReceipt:`, auditError);
        // Don't throw - audit failure shouldn't break the mutation
      }
    }

    console.log(
      `✅ generateReceipt mutation: Recibo ${input.receiptNumber} generado ` +
      `(Paid: €${input.paidAmount}, Balance: €${balanceRemaining}) (${duration}ms)`
    );

    return newReceipt;
  } catch (error) {
    // ✅ PHASE 2: AUDIT LOGGING FOR ERRORS
    if (context.auditLogger && !verificationFailed) {
      try {
        await context.auditLogger.logIntegrityViolation(
          'PaymentReceiptV3',
          input.billingId || 'N/A',
          'transaction',
          input,
          (error as Error).message,
          'CRITICAL',
          user?.id,
          user?.email,
          ip
        );
      } catch (auditError) {
        console.warn(`⚠️ Failed to log audit violation for generateReceipt:`, auditError);
      }
    }

    console.error("❌ generateReceipt mutation error:", error as Error);
    throw error;
  }
};

/**
 * 🎬 NETFLIX DENTAL: createBillingFromSubscriptionV3
 * ENDER-D1-001: Activa facturación automática desde subscriptions_v3
 * 
 * FLUJO:
 * 1. Gate 1: Verify subscription exists & is active
 * 2. Gate 2: Business Logic - Read total_amount + patient_id from subscription
 * 3. Gate 3: DB Transaction - Create billing_data with subscription_id FK
 * 4. Gate 4: Audit - Log BILLING_FROM_SUBSCRIPTION_CREATED event
 * 
 * INTEGRACIÓN: Llamado por SubscriptionBillingWorker.ts (cron diario 9:00 AM)
 */
export const createBillingFromSubscriptionV3 = async (
  _: unknown,
  args: { subscriptionId: string },
  context: GraphQLContext
): Promise<any> => {
  console.log("🎬 [NETFLIX DENTAL] createBillingFromSubscriptionV3 - ENDER-D1-001 ACTIVATED");
  const startTime = Date.now();
  
  try {
    // ================================
    // 🔥 GATE 1: VERIFICACIÓN (Veritas)
    // ================================
    if (!args.subscriptionId) {
      throw new Error('Validation failed: subscriptionId is required');
    }
    
    // Verificar que la subscription existe y está activa
    const subscription = await context.database.getSubscriptionV3ById(args.subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription not found: ${args.subscriptionId}`);
    }
    
    if (subscription.status !== 'ACTIVE') {
      throw new Error(`Subscription is not active: ${subscription.status}`);
    }
    
    console.log("✅ GATE 1 (Verificación) - Subscription exists and is ACTIVE");

    // ================================
    // 🎯 GATE 2: LÓGICA DE NEGOCIO (El Arquitecto)
    // ================================
    // Extraer datos de la subscription para la factura
    const patientId = subscription.patient_id;
    const totalAmount = subscription.total_amount;
    const currency = subscription.currency || 'EUR';
    
    if (!patientId) {
      throw new Error('Subscription has no patient_id');
    }
    
    if (!totalAmount || totalAmount <= 0) {
      throw new Error(`Invalid subscription amount: ${totalAmount}`);
    }
    
    // Generar invoice_number único (formato: SUB-YYYYMM-UUID)
    const today = new Date();
    const yearMonth = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    const invoiceNumber = `SUB-${yearMonth}-${args.subscriptionId.substring(0, 8)}`;
    
    // Calcular due_date (14 días desde hoy)
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 14);
    
    console.log("✅ GATE 2 (Lógica de Negocio) - Invoice data prepared:", {
      patientId,
      totalAmount,
      invoiceNumber,
      dueDate: dueDate.toISOString().split('T')[0]
    });

    // ================================
    // 💾 GATE 3: TRANSACCIÓN DB (El Ejecutor)
    // ================================
    const billingData = await context.database.createBillingDataV3({
      patient_id: patientId,
      subscription_id: args.subscriptionId, // 🔥 NUEVA FK
      invoice_number: invoiceNumber,
      subtotal: totalAmount,
      tax_rate: 0, // TODO: Integrar con tax_rules si existe
      tax_amount: 0,
      discount_amount: 0,
      total_amount: totalAmount,
      currency,
      issue_date: today.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      status: 'PENDING',
      payment_terms: 'Pago de suscripción mensual Netflix Dental',
      notes: `Factura generada automáticamente desde subscription ${args.subscriptionId}`,
      created_by: context.user?.id || 'SYSTEM_CRON'
    });
    
    console.log("✅ GATE 3 (Transacción DB) - Billing created:", billingData.id);

    // ================================
    // 🎨 GATE 3.5: PDF GENERATION (Integración Documents Module)
    // ================================
    let receiptData = null;
    try {
      // Generar receipt_number único
      const receiptNumber = `REC-${yearMonth}-${billingData.id.substring(0, 8)}`;
      
      // Crear receipt con PDF automático
      receiptData = await generateReceipt(
        _,
        {
          input: {
            paymentId: null, // NULL porque es factura PENDING (no pago aún)
            billingId: billingData.id,
            patientId: patientId,
            receiptNumber: receiptNumber,
            totalAmount: totalAmount,
            paidAmount: 0, // PENDING = 0 pagado
            metadata: {
              source: 'NETFLIX_DENTAL_SUBSCRIPTION',
              subscription_id: args.subscriptionId,
              auto_generated: true
            }
          }
        },
        context
      );
      
      console.log("✅ GATE 3.5 (PDF Generation) - Receipt created:", receiptData.id);
    } catch (pdfError) {
      console.warn(`⚠️ Failed to generate receipt PDF:`, pdfError);
      // Don't throw - PDF failure shouldn't break billing creation
    }

    // ================================
    // 📝 GATE 4: AUDITORÍA (El Cronista - Veritas)
    // ================================
    const duration = Date.now() - startTime;
    
    if (context.auditLogger) {
      try {
        await context.auditLogger.logCreate(
          'BillingDataV3',
          billingData.id,
          {
            ...billingData,
            _metadata: {
              source: 'NETFLIX_DENTAL_SUBSCRIPTION',
              subscription_id: args.subscriptionId,
              automation: 'SubscriptionBillingWorker'
            }
          },
          context.user?.id || 'SYSTEM_CRON',
          context.user?.email || 'system@dentiagest.com',
          context.ip || 'INTERNAL'
        );
        console.log("✅ GATE 4 (Auditoría) - BILLING_FROM_SUBSCRIPTION_CREATED logged");
      } catch (auditError) {
        console.warn(`⚠️ Failed to log audit trail:`, auditError);
        // Don't throw - audit failure shouldn't break the mutation
      }
    }
    
    // Publicar evento WebSocket (opcional)
    if (context.pubsub) {
      context.pubsub.publish('BILLING_FROM_SUBSCRIPTION_CREATED', {
        billingFromSubscriptionCreated: billingData,
      });
    }

    console.log(
      `✅ createBillingFromSubscriptionV3: Invoice ${invoiceNumber} created ` +
      `for subscription ${args.subscriptionId} (${duration}ms)`
    );
    
    // Retornar billing con receipt embebido (si se generó)
    return {
      ...billingData,
      receipt: receiptData // Puede ser null si falló PDF generation
    };
  } catch (error) {
    // Registrar error en auditoría
    if (context.auditLogger) {
      try {
        await context.auditLogger.logIntegrityViolation(
          'BillingDataV3',
          args.subscriptionId || 'N/A',
          'createBillingFromSubscription',
          args,
          (error as Error).message,
          'CRITICAL',
          context.user?.id || 'SYSTEM_CRON',
          context.user?.email || 'system@dentiagest.com',
          context.ip || 'INTERNAL'
        );
      } catch (auditError) {
        console.warn(`⚠️ Failed to log audit violation:`, auditError);
      }
    }
    
    console.error("❌ createBillingFromSubscriptionV3 error:", error as Error);
    throw error;
  }
};

// Export consolidated billing mutations object
export const billingMutations = {
  createBillingDataV3,
  updateBillingDataV3,
  deleteBillingDataV3,
  createBillingFromSubscriptionV3, // 🎬 ENDER-D1-001
  createPaymentPlan,
  updatePaymentPlanStatus,
  cancelPaymentPlan,
  recordPartialPayment,
  scheduleReminder,
  sendReminder,
  generateReceipt,
};