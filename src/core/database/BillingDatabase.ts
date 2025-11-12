import { BaseDatabase } from './BaseDatabase.js';

export class BillingDatabase extends BaseDatabase {
  /**
   * Obtiene datos de facturación con filtros opcionales
   */
  async getBillingDataV3(args: {
    patientId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { patientId, limit = 50, offset = 0 } = args;

    let query = `
      SELECT
        id, patient_id, amount, billing_date, status,
        description, payment_method, created_at, updated_at
      FROM billing_data
    `;

    const params: any[] = [];

    if (patientId) {
      query += ` WHERE patient_id = $1`;
      params.push(patientId);
      query += ` LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }

    query += ` ORDER BY billing_date DESC`;

    return this.getAll(query, params);
  }

  /**
   * Obtiene un dato de facturación por ID
   */
  async getBillingDatumV3ById(id: string): Promise<any> {
    const query = `SELECT * FROM billing_data WHERE id = $1`;
    return this.getOne(query, [id]);
  }

  /**
   * Crea un nuevo dato de facturación
   */
  async createBillingDataV3(input: any): Promise<any> {
    const {
      patientId,
      amount,
      billingDate,
      status,
      description,
      paymentMethod
    } = input;

    const query = `
      INSERT INTO billing_data (
        patient_id, amount, billing_date, status,
        description, payment_method, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;

    const result = await this.runQuery(query, [
      patientId,
      amount,
      billingDate,
      status || 'PENDING',
      description,
      paymentMethod
    ]);

    return result.rows[0];
  }

  /**
   * Actualiza un dato de facturación existente
   */
  async updateBillingDataV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.amount !== undefined) {
      updates.push(`amount = $${paramIndex++}`);
      values.push(input.amount);
    }
    if (input.billingDate !== undefined) {
      updates.push(`billing_date = $${paramIndex++}`);
      values.push(input.billingDate);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if (input.paymentMethod !== undefined) {
      updates.push(`payment_method = $${paramIndex++}`);
      values.push(input.paymentMethod);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE billing_data
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.runQuery(query, values);
    return result.rows[0];
  }

  /**
   * Elimina un dato de facturación
   */
  async deleteBillingDataV3(id: string): Promise<void> {
    const query = `DELETE FROM billing_data WHERE id = $1`;
    await this.runQuery(query, [id]);
  }

  // ============================================================================
  // PAYMENT TRACKING METHODS - Payment Plans
  // ============================================================================

  /**
   * Crea un nuevo plan de pagos en la DB
   * Tabla: payment_plans
   * Status por defecto: 'active'
   */
  async createPaymentPlan(input: {
    billingId: string;
    patientId: string;
    totalAmount: number;
    installmentsCount: number;
    installmentAmount: number;
    frequency: string;
    startDate: string;
    endDate?: string;
    userId?: string;
  }): Promise<any> {
    const query = `
      INSERT INTO payment_plans (
        billing_id, patient_id, total_amount, installments_count,
        installment_amount, frequency, start_date, end_date, created_by, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
      RETURNING *;
    `;

    const values = [
      input.billingId,
      input.patientId,
      input.totalAmount,
      input.installmentsCount,
      input.installmentAmount,
      input.frequency,
      input.startDate,
      input.endDate || null,
      input.userId
    ];

    try {
      const result = await this.runQuery(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating payment plan in DB:', error);
      throw new Error('Failed to create payment plan.');
    }
  }

  /**
   * Obtiene planes de pagos por filtros
   * Filtros: billingId, patientId, status
   */
  async getPaymentPlans(filters: {
    billingId?: string;
    patientId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { billingId, patientId, status, limit = 50, offset = 0 } = filters;

    let query = `SELECT * FROM payment_plans WHERE 1=1`;
    const values: any[] = [];
    let paramIndex = 1;

    if (billingId) {
      query += ` AND billing_id = $${paramIndex++}`;
      values.push(billingId);
    }
    if (patientId) {
      query += ` AND patient_id = $${paramIndex++}`;
      values.push(patientId);
    }
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      values.push(status);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    return this.getAll(query, values);
  }

  /**
   * Obtiene un plan de pagos por ID
   */
  async getPaymentPlanById(id: string): Promise<any> {
    const query = `SELECT * FROM payment_plans WHERE id = $1`;
    return this.getOne(query, [id]);
  }

  /**
   * Actualiza el status de un plan de pagos
   */
  async updatePaymentPlanStatus(id: string, status: string): Promise<any> {
    const query = `
      UPDATE payment_plans
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *;
    `;
    const result = await this.runQuery(query, [status, id]);
    return result.rows[0];
  }

  /**
   * Cancela (soft-delete) un plan de pagos
   */
  async cancelPaymentPlan(id: string, userId?: string): Promise<boolean> {
    const query = `
      UPDATE payment_plans
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1
      RETURNING id;
    `;
    const result = await this.runQuery(query, [id]);
    return result.rows.length > 0;
  }

  // ============================================================================
  // PAYMENT TRACKING METHODS - Partial Payments (Transaccional)
  // ============================================================================

  /**
   * Alias para getBillingDatumV3ById (consistencia con naming conventions)
   */
  async getBillingDataById(id: string): Promise<any> {
    return this.getBillingDatumV3ById(id);
  }

  /**
   * Registra un pago parcial (TRANSACCIONAL - Puente Agnóstico)
   * Esta mutación es crítica porque maneja dinero real del sistema de pagos.
   * 
   * FLUJO TRANSACCIONAL (BEGIN/COMMIT):
   * 1. Inserta el pago en 'partial_payments' (status='completed')
   * 2. Recalcula el total pagado de la factura (SUM de partial_payments)
   * 3. Actualiza el status de 'billing_data' (PENDING → PARTIAL → PAID)
   * 4. Actualiza paid_date si la factura queda completamente pagada
   * 
   * Si cualquier paso falla, hace ROLLBACK para mantener consistencia.
   * 
   * @returns { newPayment, updatedInvoice } - Ambos objetos actualizados
   */
  async recordPartialPayment(input: {
    invoiceId: string;
    patientId: string;
    paymentPlanId?: string;
    amount: number;
    currency: string;
    method: string;
    transactionId?: string;
    reference?: string;
    metadata?: any;
    userId?: string;
  }): Promise<{ newPayment: any; updatedInvoice: any }> {
    
    // Obtener un cliente del pool para manejar la transacción
    const client = await this.pool.connect();
    
    try {
      // ========================================================================
      // INICIAR LA TRANSACCIÓN
      // ========================================================================
      await client.query('BEGIN');

      // ------------------------------------------------------------------------
      // PASO 1: Insertar el Pago Parcial en 'partial_payments'
      // ------------------------------------------------------------------------
      const paymentQuery = `
        INSERT INTO partial_payments (
          invoice_id, patient_id, payment_plan_id, amount, currency,
          method, transaction_id, reference, metadata, created_by, status, processed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'completed', NOW())
        RETURNING *;
      `;
      const paymentValues = [
        input.invoiceId,
        input.patientId,
        input.paymentPlanId || null,
        input.amount,
        input.currency,
        input.method,
        input.transactionId || null,
        input.reference || null,
        input.metadata ? JSON.stringify(input.metadata) : null,
        input.userId
      ];
      
      const paymentResult = await client.query(paymentQuery, paymentValues);
      const newPayment = paymentResult.rows[0];

      // ------------------------------------------------------------------------
      // PASO 2: Recalcular el total pagado de la factura (billing_data)
      // ------------------------------------------------------------------------
      const sumResult = await client.query(
        `SELECT COALESCE(SUM(amount), 0) as total_paid 
         FROM partial_payments 
         WHERE invoice_id = $1 AND status = 'completed'`,
        [input.invoiceId]
      );
      const totalPaid = parseFloat(sumResult.rows[0].total_paid);

      // Obtener el total de la factura
      const invoiceResult = await client.query(
        `SELECT id, total_amount, status FROM billing_data WHERE id = $1`,
        [input.invoiceId]
      );
      
      if (invoiceResult.rows.length === 0) {
        throw new Error(`Factura no encontrada: ${input.invoiceId}`);
      }

      const invoice = invoiceResult.rows[0];
      const totalAmount = parseFloat(invoice.total_amount);

      // ------------------------------------------------------------------------
      // PASO 3: Determinar el nuevo status de la factura
      // ------------------------------------------------------------------------
      let newStatus = 'PENDING';
      
      if (totalPaid >= totalAmount) {
        newStatus = 'PAID';
      } else if (totalPaid > 0 && totalPaid < totalAmount) {
        newStatus = 'PARTIAL';
      }

      // ------------------------------------------------------------------------
      // PASO 4: Actualizar la Factura (billing_data)
      // ------------------------------------------------------------------------
      const updateInvoiceQuery = `
        UPDATE billing_data
        SET 
          status = $1,
          paid_date = CASE WHEN $1 = 'PAID' THEN NOW() ELSE paid_date END,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *;
      `;
      
      const updatedInvoiceResult = await client.query(updateInvoiceQuery, [
        newStatus,
        input.invoiceId
      ]);
      const updatedInvoice = updatedInvoiceResult.rows[0];

      // ========================================================================
      // FINALIZAR LA TRANSACCIÓN (COMMIT)
      // ========================================================================
      await client.query('COMMIT');

      console.log(
        `✅ recordPartialPayment: Pago de ${input.amount} ${input.currency} registrado. ` +
        `Factura ${input.invoiceId} ahora: ${newStatus} (Total pagado: ${totalPaid}/${totalAmount})`
      );

      return { newPayment, updatedInvoice };

    } catch (error) {
      // ========================================================================
      // SI ALGO FALLA, DESHACER TODO (ROLLBACK)
      // ========================================================================
      await client.query('ROLLBACK');
      console.error('❌ Error en la transacción recordPartialPayment:', error);
      throw new Error(`Falló el registro del pago (transacción revertida): ${(error as Error).message}`);
    } finally {
      // Devolver el cliente al pool
      client.release();
    }
  }

  /**
   * Obtiene todos los pagos parciales de una factura
   */
  async getPartialPayments(filters: {
    invoiceId: string;
    patientId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { invoiceId, patientId, status, limit = 50, offset = 0 } = filters;

    let query = `SELECT * FROM partial_payments WHERE invoice_id = $1`;
    const values: any[] = [invoiceId];
    let paramIndex = 2;

    if (patientId) {
      query += ` AND patient_id = $${paramIndex++}`;
      values.push(patientId);
    }
    if (status) {
      query += ` AND status = $${paramIndex++}`;
      values.push(status);
    }

    query += ` ORDER BY processed_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    return this.getAll(query, values);
  }

  /**
   * Obtiene un pago parcial por ID
   */
  async getPartialPaymentById(id: string): Promise<any> {
    const query = `SELECT * FROM partial_payments WHERE id = $1`;
    return this.getOne(query, [id]);
  }
}