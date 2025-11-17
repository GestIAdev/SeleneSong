/**
 * 🎬 NETFLIX DENTAL: SUBSCRIPTION BILLING WORKER
 * ENDER-D1-001 - Automated daily billing for active subscriptions
 * 
 * MISSION: Ejecutar facturación automática para subscriptions activas
 * CRON SCHEDULE: Diario a las 9:00 AM
 * 
 * FLUJO:
 * 1. Fetch todas las subscriptions con status='ACTIVE' y next_billing_date = TODAY
 * 2. Para cada subscription: llamar createBillingFromSubscriptionV3 mutation
 * 3. Manejo de errores: continuar si falla una, loggear errores
 * 4. Generar summary report al final
 * 
 * By PunkClaude & Radwulf - ENDER-D1-001
 */

import * as cron from "node-cron";
import type { Pool } from "pg";

interface SubscriptionBillingResult {
  subscription_id: string;
  success: boolean;
  billing_id?: string;
  error?: string;
}

export class SubscriptionBillingWorker {
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning: boolean = false;
  private database: Pool;

  constructor(database: Pool) {
    this.database = database;
    console.log("🎬 [NETFLIX DENTAL] SubscriptionBillingWorker initialized");
  }

  /**
   * 🚀 START WORKER - Schedule daily cron job at 9:00 AM
   */
  public start(): void {
    if (this.isRunning) {
      console.log("⚠️ [NETFLIX DENTAL] Worker already running");
      return;
    }

    // Cron expression: "0 9 * * *" = 9:00 AM every day
    this.cronJob = cron.schedule("0 9 * * *", async () => {
      await this.processDailyBilling();
    });

    this.isRunning = true;
    console.log("✅ [NETFLIX DENTAL] Worker scheduled: Daily at 9:00 AM");
  }

  /**
   * 🛑 STOP WORKER
   */
  public stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    this.isRunning = false;
    console.log("🛑 [NETFLIX DENTAL] Worker stopped");
  }

  /**
   * 🔥 PROCESS DAILY BILLING - Main worker logic
   */
  private async processDailyBilling(): Promise<void> {
    const startTime = Date.now();
    console.log("🎬 [NETFLIX DENTAL] Starting daily billing cycle...");

    const results: SubscriptionBillingResult[] = [];

    try {
      // Fetch active subscriptions due for billing TODAY
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      const subscriptions = await this.database.query(
        `SELECT 
          id, 
          patient_id, 
          total_amount, 
          currency, 
          next_billing_date,
          status
        FROM subscriptions_v3
        WHERE status = 'ACTIVE'
          AND next_billing_date = $1
          AND deleted_at IS NULL`,
        [today]
      );

      const subscriptionCount = subscriptions.rows.length;
      console.log(`📊 [NETFLIX DENTAL] Found ${subscriptionCount} subscriptions to bill`);

      if (subscriptionCount === 0) {
        console.log("✅ [NETFLIX DENTAL] No subscriptions due for billing today");
        return;
      }

      // Process each subscription
      for (const subscription of subscriptions.rows) {
        try {
          const billingResult = await this.createBillingForSubscription(subscription);
          
          results.push({
            subscription_id: subscription.id,
            success: true,
            billing_id: billingResult.billing_id
          });

          console.log(
            `✅ [NETFLIX DENTAL] Billed subscription ${subscription.id} → ` +
            `Invoice ${billingResult.billing_id}`
          );
        } catch (error) {
          const errorMessage = (error as Error).message;
          
          results.push({
            subscription_id: subscription.id,
            success: false,
            error: errorMessage
          });

          console.error(
            `❌ [NETFLIX DENTAL] Failed to bill subscription ${subscription.id}: ${errorMessage}`
          );
          
          // Continue processing other subscriptions (don't throw)
        }
      }

      // Generate summary report
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      const duration = Date.now() - startTime;

      console.log(`
🎬 [NETFLIX DENTAL] DAILY BILLING CYCLE COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Total Subscriptions: ${subscriptionCount}
✅ Success: ${successCount}
❌ Failures: ${failureCount}
⏱️ Duration: ${duration}ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);

      // Log failures detail
      if (failureCount > 0) {
        console.log("❌ [NETFLIX DENTAL] FAILED SUBSCRIPTIONS:");
        results
          .filter(r => !r.success)
          .forEach(r => {
            console.log(`  - Subscription ${r.subscription_id}: ${r.error}`);
          });
      }

    } catch (error) {
      console.error("💥 [NETFLIX DENTAL] Fatal error in daily billing cycle:", error as Error);
      throw error;
    }
  }

  /**
   * 💾 CREATE BILLING FOR SUBSCRIPTION - DB Transaction
   */
  private async createBillingForSubscription(subscription: any): Promise<{ billing_id: string }> {
    const client = await this.database.connect();

    try {
      await client.query('BEGIN');

      // Generate invoice_number (format: SUB-YYYYMM-UUID8)
      const today = new Date();
      const yearMonth = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
      const invoiceNumber = `SUB-${yearMonth}-${subscription.id.substring(0, 8)}`;

      // Calculate due_date (14 days from today)
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 14);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      // Insert billing_data
      const billingResult = await client.query(
        `INSERT INTO billing_data (
          patient_id,
          subscription_id,
          invoice_number,
          subtotal,
          tax_rate,
          tax_amount,
          discount_amount,
          total_amount,
          currency,
          issue_date,
          due_date,
          status,
          payment_terms,
          notes,
          created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        ) RETURNING id`,
        [
          subscription.patient_id,
          subscription.id, // subscription_id FK
          invoiceNumber,
          subscription.total_amount, // subtotal
          0, // tax_rate (TODO: integrate tax rules)
          0, // tax_amount
          0, // discount_amount
          subscription.total_amount, // total_amount
          subscription.currency || 'EUR',
          today.toISOString().split('T')[0], // issue_date
          dueDateStr, // due_date
          'PENDING', // status
          'Pago de suscripción mensual Netflix Dental',
          `Factura generada automáticamente desde subscription ${subscription.id}`,
          'SYSTEM_CRON' // created_by
        ]
      );

      const billingId = billingResult.rows[0].id;

      // Update next_billing_date in subscriptions_v3 (+1 month)
      const nextBillingDate = new Date(subscription.next_billing_date);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      const nextBillingDateStr = nextBillingDate.toISOString().split('T')[0];

      await client.query(
        `UPDATE subscriptions_v3 
         SET next_billing_date = $1, 
             updated_at = NOW()
         WHERE id = $2`,
        [nextBillingDateStr, subscription.id]
      );

      await client.query('COMMIT');

      return { billing_id: billingId };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 🧪 MANUAL TRIGGER - For testing without waiting for cron
   */
  public async triggerManual(): Promise<void> {
    console.log("🧪 [NETFLIX DENTAL] Manual trigger activated");
    await this.processDailyBilling();
  }
}
