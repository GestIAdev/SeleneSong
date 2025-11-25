import { createHash } from 'crypto';
import { BaseDatabase } from './BaseDatabase.js';

export class BillingDatabase extends BaseDatabase {
  /**
   * Obtiene datos de facturación con filtros opcionales (SCHEMA COMPLETO)
   */
  async getBillingDataV3(args: {
    patientId?: string;
    clinicId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { patientId, clinicId, limit = 50, offset = 0 } = args;

    let query = `
      SELECT
        id, patient_id, invoice_number, subtotal, tax_rate, tax_amount,
        discount_amount, total_amount, currency, issue_date, due_date,
        paid_date, status, payment_terms, notes, veritas_signature,
        blockchain_tx_hash, created_by, created_at, updated_at, clinic_id
      FROM billing_data
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // 🏛️ EMPIRE V2: Filter by clinic
    if (clinicId) {
      query += ` AND clinic_id = $${paramIndex++}`;
      params.push(clinicId);
    }

    if (patientId) {
      query += ` AND patient_id = $${paramIndex++}`;
      params.push(patientId);
    }

    query += ` ORDER BY issue_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(limit, offset);

    return this.getAll(query, params);
  }

  /**
   * Obtiene un dato de facturación por ID
   */
  async getBillingDatumV3ById(id: string, clinicId?: string): Promise<any> {
    let query = `SELECT * FROM billing_data WHERE id = $1`;
    const params: any[] = [id];

    // 🏛️ EMPIRE V2: Ownership check
    if (clinicId) {
      query += ` AND clinic_id = $2`;
      params.push(clinicId);
    }

    return this.getOne(query, params);
  }

  /**
   * 💰 OPERATION CASHFLOW: Genera invoice_number secuencial PER CLINIC
   * 
   * FISCAL COMPLIANCE:
   * - Cada clínica tiene su propia secuencia: FAC-2025-001, FAC-2025-002, etc.
   * - La secuencia se reinicia cada año fiscal
   * - Row locking (FOR UPDATE) previene race conditions en concurrencia
   * 
   * @param clinicId - ID de la clínica
   * @returns Invoice number en formato FAC-{YEAR}-{SEQ}
   */
  private async generateInvoiceNumber(clinicId: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    
    // 🔒 ROW LOCKING FIX: Use subquery to avoid "FOR UPDATE with aggregate" error
    const result = await this.runQuery(`
      WITH latest_invoice AS (
        SELECT 
          CAST(
            SUBSTRING(invoice_number FROM 'FAC-[0-9]{4}-([0-9]+)') 
            AS INTEGER
          ) AS seq_num
        FROM billing_data
        WHERE clinic_id = $1
          AND invoice_number LIKE $2
        ORDER BY invoice_number DESC
        LIMIT 1
        FOR UPDATE
      )
      SELECT COALESCE(MAX(seq_num), 0) AS max_seq
      FROM latest_invoice
    `, [clinicId, `FAC-${currentYear}-%`]);

    const maxSeq = parseInt(result.rows[0]?.max_seq || '0');
    const nextSeq = maxSeq + 1;
    
    // Formato: FAC-2025-001 (padding 3 dígitos)
    const invoiceNumber = `FAC-${currentYear}-${String(nextSeq).padStart(3, '0')}`;
    
    console.log(`💰 Generated invoice number: ${invoiceNumber} (clinic: ${clinicId})`);
    
    return invoiceNumber;
  }

  /**
   * 💰 Crea un nuevo dato de facturación con ECONOMIC SINGULARITY (DIRECTIVA #005)
   * Alineado con: BILLING_V_ALL_MIGRATION.md + Economic Singularity
   * Tabla: billing_data (invoice_number, subtotal, tax_amount, total_amount, treatment_id, material_cost, profit_margin, etc.)
   */
  async createBillingDataV3(input: any): Promise<any> {
    const {
      patientId,
      clinicId,  // 🏛️ EMPIRE V2: REQUIRED
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      totalAmount,
      currency,
      issueDate,
      dueDate,
      status,
      paymentTerms,
      notes,
      createdBy,
      treatmentId  // 🔥 ECONOMIC SINGULARITY: vincula factura con tratamiento
    } = input;

    // 🏛️ EMPIRE V2: Validate clinicId
    if (!clinicId) {
      throw new Error('🏛️ EMPIRE V2: clinicId is REQUIRED for invoice creation');
    }

    // 💰 OPERATION CASHFLOW: Generate sequential invoice number
    const invoiceNumber = await this.generateInvoiceNumber(clinicId);

    // 💰 ECONOMIC SINGULARITY: Calcular material_cost y profit_margin
    let materialCost = 0;
    let profitMargin = null;

    if (treatmentId) {
      console.log(`💰 [Economic Singularity] Calculando costos para treatment ${treatmentId}...`);

      // Recuperar cost_snapshot de treatment_materials
      const materialCostQuery = await this.runQuery(
        `SELECT 
          COALESCE(SUM(quantity * cost_snapshot), 0) AS total_material_cost,
          COUNT(*) AS material_count
         FROM treatment_materials
         WHERE treatment_id = $1`,
        [treatmentId]
      );

      const materialData = materialCostQuery.rows[0];
      materialCost = parseFloat(materialData?.total_material_cost || '0');
      const materialCount = parseInt(materialData?.material_count || '0');

      // 🚨 GATE 2 VERIFICATION: Grito de guerra si no hay materiales
      if (materialCount === 0) {
        console.warn(`⚠️ [Economic Singularity] WARNING: Treatment ${treatmentId} has NO materials in treatment_materials table. Profit margin will be 100% (likely incorrect).`);
      } else {
        console.log(`💰 [Economic Singularity] Found ${materialCount} material entries for treatment.`);
      }

      // Calcular profit_margin solo si hay totalAmount > 0
      if (totalAmount && totalAmount > 0) {
        profitMargin = (totalAmount - materialCost) / totalAmount;
        console.log(`💰 Material Cost: €${materialCost.toFixed(2)}, Profit Margin: ${(profitMargin * 100).toFixed(2)}%`);
      }
    }

    const query = `
      INSERT INTO billing_data (
        patient_id, clinic_id, invoice_number, subtotal, tax_rate, tax_amount,
        discount_amount, total_amount, currency, issue_date, due_date,
        status, payment_terms, notes, created_by, 
        treatment_id, material_cost, profit_margin,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
      RETURNING *
    `;

    const result = await this.runQuery(query, [
      patientId,
      clinicId,            // 🏛️ EMPIRE V2
      invoiceNumber,       // 💰 OPERATION CASHFLOW (auto-generated)
      subtotal || 0,
      taxRate || null,
      taxAmount || 0,
      discountAmount || 0,
      totalAmount,
      currency || 'EUR',
      issueDate || new Date().toISOString().split('T')[0],
      dueDate || null,
      status || 'PENDING',
      paymentTerms || null,
      notes || null,
      createdBy || null,
      treatmentId || null,        // 🔥 ECONOMIC SINGULARITY
      materialCost || 0,           // 🔥 ECONOMIC SINGULARITY
      profitMargin                 // 🔥 ECONOMIC SINGULARITY (puede ser NULL)
    ]);

    const row = result.rows[0];
    
    // 🔥 ECONOMIC SINGULARITY: Map snake_case to camelCase for GraphQL
    return {
      ...row,
      materialCost: row.material_cost,
      profitMargin: row.profit_margin,
      treatmentId: row.treatment_id
    };
  }

  /**
   * Actualiza un dato de facturación existente (SCHEMA COMPLETO)
   * 
   * 💰 IMMUTABILITY RULES:
   * - Facturas con status PAID/SENT NO permiten modificar: total_amount, subtotal, tax_amount, discount_amount, issue_date
   * - Solo permiten: status transitions, notes updates
   * - Para corregir facturas emitidas: usar Notas de Crédito (workflow separado)
   */
  async updateBillingDataV3(id: string, input: any, clinicId?: string): Promise<any> {
    // 🏛️ EMPIRE V2: Get old record WITH ownership check
    const oldRecord = await this.getBillingDatumV3ById(id, clinicId);
    
    if (!oldRecord) {
      throw new Error(`🏛️ EMPIRE V2: Invoice not found or access denied: ${id}`);
    }

    // 💰 IMMUTABILITY: Check if invoice is locked
    const lockedStatuses = ['PAID', 'SENT'];
    const isLocked = lockedStatuses.includes(oldRecord.status);

    // Fields that CANNOT be modified on locked invoices
    const immutableFields = ['subtotal', 'taxAmount', 'discountAmount', 'totalAmount', 'issueDate'];
    
    if (isLocked) {
      const attemptedImmutableChanges = immutableFields.filter(field => input[field] !== undefined);
      
      if (attemptedImmutableChanges.length > 0) {
        throw new Error(
          `💰 IMMUTABILITY VIOLATION: Invoice ${oldRecord.invoice_number} is ${oldRecord.status}. ` +
          `Cannot modify: ${attemptedImmutableChanges.join(', ')}. ` +
          `Use credit note workflow for corrections.`
        );
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Allow these updates even on locked invoices
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(input.notes);
    }
    if (input.paymentTerms !== undefined) {
      updates.push(`payment_terms = $${paramIndex++}`);
      values.push(input.paymentTerms);
    }

    // Only allow these if NOT locked
    if (!isLocked) {
      if (input.subtotal !== undefined) {
        updates.push(`subtotal = $${paramIndex++}`);
        values.push(input.subtotal);
      }
      if (input.taxRate !== undefined) {
        updates.push(`tax_rate = $${paramIndex++}`);
        values.push(input.taxRate);
      }
      if (input.taxAmount !== undefined) {
        updates.push(`tax_amount = $${paramIndex++}`);
        values.push(input.taxAmount);
      }
      if (input.discountAmount !== undefined) {
        updates.push(`discount_amount = $${paramIndex++}`);
        values.push(input.discountAmount);
      }
      if (input.totalAmount !== undefined) {
        updates.push(`total_amount = $${paramIndex++}`);
        values.push(input.totalAmount);
      }
      if (input.currency !== undefined) {
        updates.push(`currency = $${paramIndex++}`);
        values.push(input.currency);
      }
      if (input.issueDate !== undefined) {
        updates.push(`issue_date = $${paramIndex++}`);
        values.push(input.issueDate);
      }
      if (input.dueDate !== undefined) {
        updates.push(`due_date = $${paramIndex++}`);
        values.push(input.dueDate);
      }
    }

    if (updates.length === 0) {
      return oldRecord; // No changes
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    // 🏛️ EMPIRE V2: Add clinic_id to WHERE
    let query = `
      UPDATE billing_data
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++}
    `;

    if (clinicId) {
      query += ` AND clinic_id = $${paramIndex++}`;
      values.push(clinicId);
    }

    query += ` RETURNING *`;

    const result = await this.runQuery(query, values);
    
    if (result.rows.length === 0) {
      throw new Error(`🏛️ EMPIRE V2: Update failed - ownership violation`);
    }

    return result.rows[0];
  }

  /**
   * Elimina un dato de facturación
   */
  async deleteBillingDataV3(id: string, clinicId?: string): Promise<void> {
    let query = `DELETE FROM billing_data WHERE id = $1`;
    const params: any[] = [id];

    // 🏛️ EMPIRE V2: Ownership check
    if (clinicId) {
      query += ` AND clinic_id = $2`;
      params.push(clinicId);
    }

    await this.runQuery(query, params);
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
   * Filtros: billingId, patientId, status, clinicId
   */
  async getPaymentPlans(filters: {
    billingId?: string;
    patientId?: string;
    status?: string;
    clinicId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { billingId, patientId, status, clinicId, limit = 50, offset = 0 } = filters;

    let query = `SELECT * FROM payment_plans WHERE 1=1`;
    const values: any[] = [];
    let paramIndex = 1;

    // 🏛️ EMPIRE V2: Filter by clinic
    if (clinicId) {
      query += ` AND clinic_id = $${paramIndex++}`;
      values.push(clinicId);
    }

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
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING'::billing_status_enum, NOW())
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
      
      // 🔥 DEBUG: Log SQL values para ver type mismatch
      console.log('🔥🔥🔥 [BILLING] recordPartialPayment SQL:', {
        invoiceId: input.invoiceId,
        invoiceIdType: typeof input.invoiceId,
        patientId: input.patientId,
        patientIdType: typeof input.patientId,
        paymentPlanId: input.paymentPlanId,
        amount: input.amount,
        amountType: typeof input.amount,
        currency: input.currency,
        method: input.method,
        transactionId: input.transactionId,
        userId: input.userId,
        userIdType: typeof input.userId,
      });
      
      const paymentResult = await client.query(paymentQuery, paymentValues);
      const newPayment = paymentResult.rows[0];

      // ------------------------------------------------------------------------
      // PASO 2: Recalcular el total pagado de la factura (billing_data)
      // ------------------------------------------------------------------------
      const sumResult = await client.query(
        `SELECT COALESCE(SUM(amount), 0) as total_paid 
         FROM partial_payments 
         WHERE invoice_id = $1 AND status::text = 'PENDING'`,
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
          status = $1::billing_status_enum,
          paid_date = CASE WHEN $1::text = 'PAID' THEN NOW() ELSE paid_date END,
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
    clinicId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { invoiceId, patientId, status, clinicId, limit = 50, offset = 0 } = filters;

    let query = `SELECT * FROM partial_payments WHERE invoice_id = $1`;
    const values: any[] = [invoiceId];
    let paramIndex = 2;

    // 🏛️ EMPIRE V2: Filter by clinic
    if (clinicId) {
      query += ` AND clinic_id = $${paramIndex++}`;
      values.push(clinicId);
    }

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

  // ========================================
  // PAYMENT REMINDERS
  // ========================================

  /**
   * Obtiene recordatorios de pago con filtros opcionales
   */
  async getPaymentReminders(filters: {
    billingId?: string;
    patientId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { billingId, patientId, status, limit = 50, offset = 0 } = filters;

    let query = `SELECT * FROM payment_reminders WHERE 1=1`;
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

    query += ` ORDER BY scheduled_at ASC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    return this.getAll(query, values);
  }

  /**
   * Programa un nuevo recordatorio de pago
   */
  async scheduleReminder(data: {
    billingId: string;
    patientId: string;
    scheduledAt: string;
    reminderType: string;
    messageTemplate: string;
    metadata?: any;
  }): Promise<any> {
    const query = `
      INSERT INTO payment_reminders (
        id, billing_id, patient_id, scheduled_at, reminder_type, 
        message_template, status, metadata, veritas_signature
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const id = crypto.randomUUID();
    const veritasSignature = this.generateReminderSignature(id, data.billingId, data.scheduledAt);

    const values = [
      id,
      data.billingId,
      data.patientId,
      data.scheduledAt,
      data.reminderType,
      data.messageTemplate,
      'scheduled',
      JSON.stringify(data.metadata || {}),
      veritasSignature
    ];

    return this.getOne(query, values);
  }

  /**
   * Marca un recordatorio como enviado
   */
  async sendReminder(reminderId: string): Promise<any> {
    const query = `
      UPDATE payment_reminders 
      SET status = 'sent', sent_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    return this.getOne(query, [reminderId]);
  }

  // ========================================
  // PAYMENT RECEIPTS
  // ========================================

  /**
   * Obtiene recibos de pago con filtros opcionales
   */
  async getPaymentReceipts(filters: {
    invoiceId: string;
    patientId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { invoiceId, patientId, limit = 50, offset = 0 } = filters;

    let query = `SELECT * FROM payment_receipts WHERE billing_id = $1`;
    const values: any[] = [invoiceId];
    let paramIndex = 2;

    if (patientId) {
      query += ` AND patient_id = $${paramIndex++}`;
      values.push(patientId);
    }

    query += ` ORDER BY generated_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    values.push(limit, offset);

    return this.getAll(query, values);
  }

  /**
   * Obtiene un recibo de pago por ID
   */
  async getPaymentReceiptById(id: string): Promise<any> {
    const query = `SELECT * FROM payment_receipts WHERE id = $1`;
    return this.getOne(query, [id]);
  }

  /**
   * Genera un recibo de pago con firma Veritas SHA-256
   */
  async generateReceipt(data: {
    paymentId: string;
    billingId: string;
    patientId: string;
    receiptNumber: string;
    totalAmount: number;
    paidAmount: number;
    balanceRemaining: number;
    metadata?: any;
  }): Promise<any> {
    const query = `
      INSERT INTO payment_receipts (
        id, payment_id, billing_id, patient_id, receipt_number,
        total_amount, paid_amount, balance_remaining,
        metadata, veritas_signature
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const id = crypto.randomUUID();
    const veritasSignature = this.generateReceiptSignature(
      id, 
      data.receiptNumber, 
      data.paidAmount,
      'EUR' // Currency hardcoded (EUR por defecto en el proyecto)
    );

    const values = [
      id,
      data.paymentId,
      data.billingId,
      data.patientId,
      data.receiptNumber,
      data.totalAmount,
      data.paidAmount,
      data.balanceRemaining,
      JSON.stringify(data.metadata || {}),
      veritasSignature
    ];

    return this.getOne(query, values);
  }

  // ========================================
  // VERITAS SIGNATURE HELPERS
  // ========================================

  /**
   * Genera firma Veritas para recordatorio (SHA-256 hash)
   */
  private generateReminderSignature(
    reminderId: string, 
    paymentPlanId: string, 
    scheduledDate: string
  ): string {
    const data = `${reminderId}:${paymentPlanId}:${scheduledDate}:VERITAS_REMINDER`;
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Genera firma Veritas para recibo (SHA-256 hash)
   * Esta es la firma crítica que garantiza inmutabilidad del recibo
   */
  private generateReceiptSignature(
    receiptId: string,
    receiptNumber: string,
    amountPaid: number,
    currency: string
  ): string {
    const data = `${receiptId}:${receiptNumber}:${amountPaid}:${currency}:VERITAS_RECEIPT`;
    return createHash('sha256').update(data).digest('hex');
  }
}