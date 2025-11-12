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
}