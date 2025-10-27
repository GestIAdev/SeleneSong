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

      // Since appointments table doesn't exist, create mock appointments from medical_records
      let query = `
        SELECT 
          id,
          patient_id as "patientId",
          created_by as "practitionerId",
          TO_CHAR(visit_date, 'YYYY-MM-DD') as date,
          TO_CHAR(visit_date, 'HH24:MI') as time,
          TO_CHAR(visit_date, 'YYYY-MM-DD') as "appointmentDate",
          TO_CHAR(visit_date, 'HH24:MI') as "appointmentTime",
          60 as duration,
          treatment_plan as type,
          CASE 
            WHEN treatment_status = 'COMPLETED' THEN 'completed'
            WHEN treatment_status = 'IN_PROGRESS' THEN 'in_progress' 
            ELSE 'scheduled'
          END as status,
          COALESCE(clinical_notes, '') as notes,
          COALESCE(treatment_performed, '') as "treatmentDetails",
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
      console.log(`🔍 APPOINTMENTSV3 found ${result.rows.length} appointments`);

      return result.rows || [];
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

      const result = await context.database.executeQuery(
        `
        SELECT 
          a.id,
          a.patient_id,
          a.patient_id as "patientId",
          a.practitioner_id,
          a.practitioner_id as "practitionerId", 
          a.date,
          a.date as "appointmentDate",
          a.time,
          a.time as "appointmentTime",
          a.duration,
          a.type,
          a.status,
          a.notes,
          a.treatment_details,
          a.treatment_details as "treatmentDetails",
          a.created_at,
          a.created_at as "createdAt",
          a.updated_at,
          a.updated_at as "updatedAt",
          p.name as patient_name
        FROM appointments a 
        LEFT JOIN patients p ON a.patient_id = p.id 
        WHERE a.id = $1 AND a.deleted_at IS NULL
      `,
        [id],
      );

      const appointment = result.rows?.[0] || null;
      console.log(`🔍 AppointmentV3 found: ${!!appointment}`);

      if (appointment) {
        console.log(`🔍 AppointmentV3 data:`, appointment);
        return appointment;
      }

      return null;
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

      const result = await _context.database.executeQuery(
        `
        SELECT 
          a.id,
          a.patient_id,
          a.patient_id as "patientId",
          a.practitioner_id,
          a.practitioner_id as "practitionerId", 
          a.date,
          a.date as "appointmentDate",
          a.time,
          a.time as "appointmentTime",
          a.duration,
          a.type,
          a.status,
          a.notes,
          a.treatment_details,
          a.treatment_details as "treatmentDetails",
          a.created_at,
          a.created_at as "createdAt",
          a.updated_at,
          a.updated_at as "updatedAt",
          p.name as patient_name
        FROM appointments a 
        LEFT JOIN patients p ON a.patient_id = p.id 
        WHERE a.date = $1 AND a.deleted_at IS NULL
      `,
        [date],
      );

      const appointments = result.rows || [];
      console.log(
        `🔍 Found ${appointments.length} appointments for date ${date}`,
      );

      return appointments;
    } catch (error) {
      console.error("Appointments by date error:", error as Error);
      return [];
    }
  },
};


