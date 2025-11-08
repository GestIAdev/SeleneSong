import { GraphQLContext } from "../../types.js";


// ============================================================================
// 🎯 APPOINTMENT V3 QUERY RESOLVERS - VERITAS ENHANCED
// ============================================================================

export const appointmentQueries = {
  // Appointments - Standard Query (using medical_records as base)
  appointments: async (
    _: any,
    { limit = 50, offset = 0, patientId }: any,
    _context: GraphQLContext,
  ) => {
    try {
      console.log("🔥🔥🔥 PUNK DEBUG: APPOINTMENTS RESOLVER CALLED!!! 🔥🔥🔥");
      console.log(
        `🔍 APPOINTMENTS query called with limit: ${limit}, offset: ${offset}, patientId: ${patientId}`,
      );

      // Since appointments table doesn't exist, create appointments from medical_records
      let query = `
        SELECT 
          id,
          patient_id as "patientId",
          created_by as "practitionerId",
          TO_CHAR(visit_date, 'YYYY-MM-DD') as date,
          TO_CHAR(visit_date, 'HH24:MI') as time,
          60 as duration,
          procedure_category as type,
          CASE 
            WHEN treatment_status = 'COMPLETED' THEN 'completed'
            WHEN treatment_status = 'IN_PROGRESS' THEN 'in_progress' 
            ELSE 'scheduled'
          END as status,
          COALESCE(clinical_notes, '') as notes,
          TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt",
          TO_CHAR(updated_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "updatedAt"
        FROM medical_records 
        WHERE is_active = true AND deleted_at IS NULL AND patient_id IS NOT NULL
      `;

      const params: any[] = [];

      if (patientId) {
        query += " AND patient_id = $1";
        params.push(patientId);
      }

      query += ` ORDER BY visit_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await _context.database.executeQuery(query, params);
      console.log(`🔍 APPOINTMENTS found ${result.rows.length} appointments`);

      // PUNK DEBUG: Log each row to see what's happening
      result.rows.forEach((row: any, _index: any) => {
        console.log(`🎯 APPOINTMENT $JSON.stringify({_index}):`, {
          id: row.id,
          patientId: row.patientId,
          patientIdType: typeof row.patientId,
          rawPatientId: row.patient_id,
        });
      });

      return result.rows || [];
    } catch (error) {
      console.error("Appointments query error:", error as Error);
      return [];
    }
  },

  // AppointmentsV3 - Veritas Enhanced
  appointmentsV3: async (
    _: any,
    { limit = 50, offset = 0, patientId }: any,
    _context: GraphQLContext,
  ) => {
    try {
      console.log(
        `🔍 APPOINTMENTSV3 query called with limit: ${limit}, offset: ${offset}, patientId: ${patientId}`,
      );

      // Use specialized AppointmentsDatabase class
      return await _context.database.appointments.getAppointments({ limit, offset, patientId });
    } catch (error) {
      console.error("AppointmentsV3 query error:", error as Error);
      return [];
    }
  },

  appointmentV3: async (
    _: any,
    { id }: any,
    context: GraphQLContext,
    _info: any,
  ) => {
    try {
      console.log(`🔍 APPOINTMENTV3 RESOLVER called with id: ${id}`);
      console.log(`🔍 Context veritas available: ${!!context.veritas}`);

      // Use specialized AppointmentsDatabase class
      return await context.database.appointments.getAppointmentByIdV3(id);
    } catch (error) {
      console.error("AppointmentV3 query error:", error as Error);
      return null;
    }
  },

  appointmentsV3ByDate: async (
    _: any,
    { date }: any,
    _context: GraphQLContext,
  ) => {
    try {
      console.log(`🔍 APPOINTMENTSV3_BY_DATE query called with date: ${date}`);

      // Use specialized AppointmentsDatabase class
      return await _context.database.appointments.getAppointmentsByDateV3(date);
    } catch (error) {
      console.error("Appointments by date error:", error as Error);
      return [];
    }
  },
};


