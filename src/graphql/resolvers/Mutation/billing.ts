import type { GraphQLContext } from '../../types.js';

// ============================================================================
// BILLING MUTATION RESOLVERS V3
// ============================================================================

export const createBillingDataV3 = async (
  _: unknown,
  args: { input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const billingData = await context.database.createBillingDataV3(args.input);

    console.log(`✅ createBillingDataV3 mutation created: ${billingData.id}`);
    return billingData;
  } catch (error) {
    console.error("❌ createBillingDataV3 mutation error:", error as Error);
    throw error;
  }
};

export const updateBillingDataV3 = async (
  _: unknown,
  args: { id: string; input: any },
  context: GraphQLContext
): Promise<any> => {
  try {
    const billingData = await context.database.updateBillingDataV3(args.id, args.input);

    console.log(`✅ updateBillingDataV3 mutation updated: ${billingData.id}`);
    return billingData;
  } catch (error) {
    console.error("❌ updateBillingDataV3 mutation error:", error as Error);
    throw error;
  }
};

export const deleteBillingDataV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<boolean> => {
  try {
    await context.database.deleteBillingDataV3(args.id);

    console.log(`✅ deleteBillingDataV3 mutation deleted ID: ${args.id}`);
    return true;
  } catch (error) {
    console.error("❌ deleteBillingDataV3 mutation error:", error as Error);
    throw error;
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
  const { input } = args;
  const { database, verificationEngine, auditLogger, user, ip } = context;
  const startTime = Date.now();
  let verificationFailed = false;

  try {
    // --------------------------------------------------------------------------
    // 🔥 PUERTA 1: VERIFICACIÓN (El Guardián - VerificationEngine)
    // --------------------------------------------------------------------------
    // Verificar el input contra las reglas de 'integrity_checks'
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

    await auditLogger.logCreate(
      'PaymentPlanV3',
      newPaymentPlan.id,
      newPaymentPlan,
      user?.id,
      user?.email,
      ip
    );

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
    // Registrar error como violación de integridad (solo si no fue registrado en GATE 1)
    if (auditLogger && !verificationFailed) {
      await auditLogger.logIntegrityViolation(
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

// Export consolidated billing mutations object
export const billingMutations = {
  createBillingDataV3,
  updateBillingDataV3,
  deleteBillingDataV3,
  createPaymentPlan,
  updatePaymentPlanStatus,
  cancelPaymentPlan,
};