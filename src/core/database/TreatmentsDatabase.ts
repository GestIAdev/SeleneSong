import { BaseDatabase } from './BaseDatabase.js';
import { Pool } from 'pg';

export class TreatmentsDatabase extends BaseDatabase {
  constructor(pool: Pool) {
    super(pool);
  }
  /**
   * 🩺 GET TREATMENTS - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO: snake_case DB → camelCase GraphQL
   * ✅ FIELDS: id, patientId, practitionerId, treatmentType, description, status, startDate, endDate, cost, notes, aiRecommendations, veritasScore, createdAt, updatedAt
   */
  public async getTreatments(filters?: any): Promise<any[]> {
    try {
      // Query treatments from medical_records table
      let query = `
        SELECT
          id,
          patient_id,
          created_by,
          procedure_category,
          diagnosis,
          treatment_status,
          visit_date,
          follow_up_date,
          estimated_cost,
          clinical_notes,
          created_at,
          updated_at
        FROM medical_records
        WHERE is_active = true AND deleted_at IS NULL
      `;
      const params: any[] = [];

      if (filters) {
        if (filters.patientId) {
          query += ` AND patient_id = $${params.length + 1}`;
          params.push(filters.patientId);
        }
        if (filters.status) {
          query += ` AND treatment_status = $${params.length + 1}`;
          params.push(filters.status);
        }
      }

      query += " ORDER BY created_at DESC";

      if (filters?.limit) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(filters.limit);
      }

      const result = await this.pool.query(query, params);

      // ✅ MAPEO COMPLETO snake_case → camelCase con FALLBACKS para non-nullable fields
      return result.rows.map((dbRow) => ({
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.created_by || "unknown", // Schema: practitionerId: ID!
        treatmentType: dbRow.procedure_category || "general", // Schema: treatmentType: String!
        description: dbRow.diagnosis || "No description", // Schema: description: String!
        status: dbRow.treatment_status || "pending", // Schema: status: String!
        startDate: dbRow.visit_date || new Date().toISOString(), // Schema: startDate: String!
        endDate: dbRow.follow_up_date,
        cost: dbRow.estimated_cost || 0,
        notes: dbRow.clinical_notes || "",
        aiRecommendations: [], // Default empty array
        veritasScore: 0, // Default 0
        createdAt: dbRow.created_at || new Date().toISOString(), // Schema: createdAt: String!
        updatedAt: dbRow.updated_at || new Date().toISOString(), // Schema: updatedAt: String!
      }));
    } catch (error) {
      console.error("💥 Failed to get treatments:", error as Error);
      throw error;
    }
  }

  /**
   * ➕ CREATE TREATMENT - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO: camelCase input → snake_case DB → camelCase output
   */
  public async createTreatment(data: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `
        INSERT INTO medical_records (
          patient_id, created_by, procedure_category,
          diagnosis, treatment_status, visit_date,
          follow_up_date, estimated_cost, clinical_notes,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *
      `,
        [
          data.patientId,
          data.practitionerId,
          data.treatmentType || "general",
          data.description || "",
          data.status || "pending",
          data.startDate || new Date(),
          data.endDate,
          data.cost || 0,
          data.notes || "",
        ],
      );

      await client.query("COMMIT");

      const dbRow = result.rows[0];

      // ✅ MAPEO COMPLETO
      return {
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.created_by,
        treatmentType: dbRow.procedure_category,
        description: dbRow.diagnosis,
        status: dbRow.treatment_status,
        startDate: dbRow.visit_date,
        endDate: dbRow.follow_up_date,
        cost: dbRow.estimated_cost,
        notes: dbRow.clinical_notes,
        aiRecommendations: [],
        veritasScore: 0,
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to create treatment:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * ✏️ UPDATE TREATMENT - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO con updatedAt (CRITICAL!)
   */
  public async updateTreatment(id: string, data: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.treatmentType !== undefined) {
        fields.push(`procedure_category = $${paramIndex++}`);
        values.push(data.treatmentType);
      }
      if (data.description !== undefined) {
        fields.push(`diagnosis = $${paramIndex++}`);
        values.push(data.description);
      }
      if (data.status !== undefined) {
        fields.push(`treatment_status = $${paramIndex++}`);
        values.push(data.status);
      }
      if (data.startDate !== undefined) {
        fields.push(`visit_date = $${paramIndex++}`);
        values.push(data.startDate);
      }
      if (data.endDate !== undefined) {
        fields.push(`follow_up_date = $${paramIndex++}`);
        values.push(data.endDate);
      }
      if (data.cost !== undefined) {
        fields.push(`estimated_cost = $${paramIndex++}`);
        values.push(data.cost);
      }
      if (data.notes !== undefined) {
        fields.push(`clinical_notes = $${paramIndex++}`);
        values.push(data.notes);
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await client.query(
        `UPDATE medical_records SET ${fields.join(", ")} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
        values,
      );

      await client.query("COMMIT");

      if (result.rows.length === 0) {
        throw new Error("Treatment not found");
      }

      const dbRow = result.rows[0];

      // ✅ MAPEO COMPLETO
      return {
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.created_by,
        treatmentType: dbRow.procedure_category,
        description: dbRow.diagnosis,
        status: dbRow.treatment_status,
        startDate: dbRow.visit_date,
        endDate: dbRow.follow_up_date,
        cost: dbRow.estimated_cost,
        notes: dbRow.clinical_notes,
        aiRecommendations: [],
        veritasScore: 0,
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at, // 🔥 CRITICAL
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to update treatment:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 🗑️ DELETE TREATMENT - GraphQL Migration v1.0
   * ✅ Soft delete
   */
  public async deleteTreatment(id: string): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE medical_records SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
        [id],
      );

      await client.query("COMMIT");

      return result.rows.length > 0;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to delete treatment:", error as Error);
      return false;
    } finally {
      client.release();
    }
  }

  // ============================================================================
  // TREATMENT V3 METHODS - API COMPATIBILITY
  // ============================================================================

  async getTreatmentByIdV3(id: string): Promise<any> {
    const query = `
      SELECT
        id,
        patient_id as "patientId",
        created_by as "practitionerId",
        procedure_category as "treatmentType",
        diagnosis as description,
        treatment_status as status,
        visit_date as "startDate",
        follow_up_date as "endDate",
        estimated_cost as cost,
        clinical_notes as notes,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM medical_records
      WHERE id = $1 AND is_active = true AND deleted_at IS NULL
    `;

    return this.getOne(query, [id]);
  }
}