import { BaseDatabase } from './BaseDatabase.js';

/**
 * 🎯 APPOINTMENTS DATABASE - Specialized Database Class
 * ✅ MODULARIZED: Extracted from monolithic Database.ts
 * ✅ RESPONSIBILITY: Handle all appointment-related operations
 * ✅ INHERITANCE: Extends BaseDatabase for shared functionality
 */
export class AppointmentsDatabase extends BaseDatabase {
  /**
   * � GET APPOINTMENTS - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO: snake_case DB → camelCase GraphQL
   * ✅ FIELDS: id, patientId, practitionerId, date, time, appointmentDate, appointmentTime, duration, type, status, notes, createdAt, updatedAt
   */
  public async getAppointments(filters?: any): Promise<any[]> {
    try {
      // PUNK FIX: Query usando medical_records en lugar de apollo_appointments (que no existe)
      let query = `
        SELECT
          id,
          patient_id,
          created_by,
          visit_date,
          procedure_category,
          treatment_status,
          clinical_notes,
          created_at,
          updated_at
        FROM medical_records
        WHERE is_active = true AND deleted_at IS NULL AND patient_id IS NOT NULL
      `;
      const params: any[] = [];

      if (filters) {
        if (filters.patientId) {
          query += ` AND patient_id = $${params.length + 1}`;
          params.push(filters.patientId);
        }
        if (filters.date) {
          query += ` AND TO_CHAR(visit_date, 'YYYY-MM-DD') = $${params.length + 1}`;
          params.push(filters.date);
        }
        if (filters.status) {
          query += ` AND treatment_status = $${params.length + 1}`;
          params.push(filters.status);
        }
      }

      query += " ORDER BY visit_date DESC";

      const result = await this.pool.query(query, params);

      // ✅ MAPEO: Extraer fecha y hora de visit_date timestamp
      return result.rows.map((dbRow) => ({
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.created_by,
        date: dbRow.visit_date
          ? new Date(dbRow.visit_date).toISOString().split("T")[0]
          : null,
        time: dbRow.visit_date
          ? new Date(dbRow.visit_date).toISOString().split("T")[1].slice(0, 5)
          : null,
        appointmentDate: dbRow.visit_date
          ? new Date(dbRow.visit_date).toISOString().split("T")[0]
          : null,
        appointmentTime: dbRow.visit_date
          ? new Date(dbRow.visit_date).toISOString().split("T")[1].slice(0, 5)
          : null,
        duration: 60, // Default 60 min
        type: dbRow.procedure_category || "regular",
        status:
          dbRow.treatment_status === "COMPLETED"
            ? "completed"
            : dbRow.treatment_status === "IN_PROGRESS"
              ? "in_progress"
              : "scheduled",
        notes: dbRow.clinical_notes || "",
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at,
      }));
    } catch (error) {
      console.error("💥 Failed to get appointments:", error as Error);
      throw error;
    }
  }

  /**
   * ➕ CREATE APPOINTMENT - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO: camelCase input → snake_case DB → camelCase output
   * ✅ RETURNS: Mapped appointment object with createdAt/updatedAt
   */
  public async createAppointment(appointmentData: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `
        INSERT INTO appointments (
          id, patient_id, dentist_id, scheduled_date,
          duration_minutes, appointment_type, status, priority,
          title, notes, created_at, updated_at, created_by
        ) VALUES (
          gen_random_uuid(),
          $1,
          COALESCE($2::uuid, (SELECT id FROM users ORDER BY created_at ASC LIMIT 1)),
          $3,
          $4,
          $5::appointmenttype,
          $6::appointmentstatus,
          $7::appointmentpriority,
          $8,
          $9,
          NOW(),
          NOW(),
          COALESCE($2::uuid, (SELECT id FROM users ORDER BY created_at ASC LIMIT 1))
        )
        RETURNING *
      `,
        [
          appointmentData.patientId,
          appointmentData.practitionerId || null,
          `${appointmentData.appointmentDate} ${appointmentData.appointmentTime}`,
          appointmentData.duration || 30,
          appointmentData.type || "CONSULTATION", // ✅ DEFAULT ENUM VALUE
          appointmentData.status || "SCHEDULED", // ✅ DEFAULT ENUM VALUE
          appointmentData.priority || "NORMAL", // ✅ DEFAULT ENUM VALUE (UPPERCASE)
          appointmentData.title || `Appointment on ${appointmentData.appointmentDate}`,
          appointmentData.notes || "",
        ],
      );

      await client.query("COMMIT");

      const dbRow = result.rows[0];

      // ✅ MAPEO: Extraer fecha y hora de scheduled_date timestamp
      const scheduledDate = new Date(dbRow.scheduled_date);
      const appointmentDate = scheduledDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const appointmentTime = scheduledDate.toTimeString().slice(0, 5); // HH:MM

      // ✅ MAPEO COMPLETO snake_case → camelCase
      const appointment = {
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.dentist_id,
        appointmentDate,
        appointmentTime,
        duration: dbRow.duration_minutes,
        type: dbRow.appointment_type,
        status: dbRow.status,
        notes: dbRow.notes,
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at,
      };

      // Invalidate cache
      await this.invalidateAppointmentCache();

      // Emit real-time update
      await this.emitRealtimeUpdate("appointments", "created", appointment);

      return appointment;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to create appointment:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * ✏️ UPDATE APPOINTMENT - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO: camelCase input → snake_case DB → camelCase output
   * ✅ RETURNS: Mapped appointment with updatedAt (CRITICAL!)
   */
  public async updateAppointment(id: string, data: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // Build dynamic UPDATE query
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      // Handle scheduledDate (timestamp column in DB)
      if (data.scheduledDate !== undefined) {
        fields.push(`scheduled_date = $${paramIndex++}`);
        values.push(data.scheduledDate);
      }
      if (data.duration !== undefined) {
        fields.push(`duration_minutes = $${paramIndex++}`);
        values.push(data.duration);
      }
      if (data.type !== undefined) {
        fields.push(`appointment_type = $${paramIndex++}::appointmenttype`);
        values.push(data.type);
      }
      if (data.status !== undefined) {
        fields.push(`status = $${paramIndex++}::appointmentstatus`);
        values.push(data.status);
      }
      if (data.notes !== undefined) {
        fields.push(`notes = $${paramIndex++}`);
        values.push(data.notes);
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await client.query(
        `UPDATE appointments SET ${fields.join(", ")} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
        values,
      );

      await client.query("COMMIT");

      if (result.rows.length === 0) {
        throw new Error("Appointment not found");
      }

      const dbRow = result.rows[0];

      // ✅ MAPEO COMPLETO snake_case → camelCase
      // Extract date and time from scheduled_date timestamp
      const scheduledDate = new Date(dbRow.scheduled_date);
      const appointmentDate = scheduledDate.toISOString().split("T")[0];
      const appointmentTime = scheduledDate.toTimeString().slice(0, 5);

      const appointment = {
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.dentist_id,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        duration: dbRow.duration_minutes,
        type: dbRow.appointment_type,
        status: dbRow.status,
        notes: dbRow.notes,
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at, // 🔥 CRITICAL - GraphQL espera esto
      };

      console.log("💥 UPDATE APPOINTMENT RETURNING:", JSON.stringify(appointment, null, 2));

      // Invalidate cache
      await this.invalidateAppointmentCache();

      // Emit real-time update
      await this.emitRealtimeUpdate("appointments", "updated", appointment);

      return appointment;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to update appointment:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 🗑️ DELETE APPOINTMENT - GraphQL Migration v1.0
   * ✅ Soft delete with deleted_at timestamp
   * ✅ RETURNS: boolean success
   */
  public async deleteAppointment(id: string): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE appointments SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
        [id],
      );

      await client.query("COMMIT");

      if (result.rows.length === 0) {
        throw new Error("Appointment not found");
      }

      // Invalidate cache
      await this.invalidateAppointmentCache();

      // Emit real-time update
      await this.emitRealtimeUpdate("appointments", "deleted", { id });

      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to delete appointment:", error as Error);
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * 🗑️ Invalidate appointment cache
   */
  private async invalidateAppointmentCache(): Promise<void> {
    try {
      const keys = await this.getRedis().keys("appointments:*");
      if (keys.length > 0) {
        await this.getRedis().del(keys);
      }
    } catch (error) {
      console.error("⚠️ Failed to invalidate appointment cache:", error as Error);
    }
  }

  /**
   * 📡 Emit real-time updates
   */
  protected async emitRealtimeUpdate(
    _room: string,
    _event: string,
    _data: any,
  ): Promise<void> {
    try {
      // This will be connected to Socket.IO in the main server
      await this.getRedis().publish(
        `realtime:${_room}`,
        JSON.stringify({
          _event,
          _data,
          timestamp: new Date().toISOString(),
        }),
      );
    } catch (error) {
      console.warn(
        "⚠️ Failed to emit realtime update:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // ============================================================================
  // APPOINTMENT V3 METHODS - API COMPATIBILITY
  // ============================================================================

  async getAppointmentByIdV3(id: string): Promise<any> {
    const query = `
      SELECT
        id,
        patient_id as "patientId",
        created_by as "practitionerId",
        visit_date as "appointmentDate",
        procedure_category as type,
        treatment_status as status,
        clinical_notes as notes,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM medical_records
      WHERE id = $1 AND is_active = true AND deleted_at IS NULL
    `;

    return this.getOne(query, [id]);
  }

  async getAppointmentsByDateV3(date: string): Promise<any[]> {
    const query = `
      SELECT
        id,
        patient_id as "patientId",
        created_by as "practitionerId",
        visit_date as "appointmentDate",
        procedure_category as type,
        treatment_status as status,
        clinical_notes as notes,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM medical_records
      WHERE DATE(visit_date) = $1 AND is_active = true AND deleted_at IS NULL
      ORDER BY visit_date ASC
    `;

    return this.getAll(query, [date]);
  }
}