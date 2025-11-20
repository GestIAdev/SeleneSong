import { GraphQLContext } from "../../types.js";
import { getClinicIdFromContext } from "../../utils/clinicHelpers.js";

// ============================================================================
// 🎯 APPOINTMENT V3 QUERY RESOLVERS - VERITAS ENHANCED + EMPIRE V2
// ============================================================================

export const appointmentQueries = {
  // Appointments - Standard Query (EMPIRE V2: Multi-tenant filtered)
  appointments: async (
    _: any,
    { limit = 50, offset = 0, patientId }: any,
    _context: GraphQLContext,
  ) => {
    try {
      console.log("🎯 [APPOINTMENT] appointments - Query with EMPIRE V2 filtering");
      
      // 🏛️ EMPIRE V2: GATE 0 - Require clinic context
      const clinicId = getClinicIdFromContext(_context);
      if (!clinicId) {
        console.warn("⚠️ No clinic_id - CERO ABSOLUTO - returning []");
        return []; // REGLA 1: NEVER return all appointments
      }
      console.log(`🏛️ Filtering appointments for clinic: ${clinicId}`);

      // Since appointments table doesn't exist, create appointments from medical_records
      // 🏛️ CRITICAL: Filter by clinic_id (assumes medical_records has clinic_id)
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
        WHERE is_active = true 
          AND deleted_at IS NULL 
          AND patient_id IS NOT NULL
          AND clinic_id = $1
      `;

      const params: any[] = [clinicId];

      if (patientId) {
        // 🏛️ EMPIRE V2: Verify patient belongs to this clinic
        const patientAccessCheck = await _context.database.executeQuery(
          `SELECT 1 FROM patient_clinic_access 
           WHERE patient_id = $1 AND clinic_id = $2 AND is_active = TRUE`,
          [patientId, clinicId]
        );
        
        if (patientAccessCheck.rows.length === 0) {
          console.warn(`⚠️ Patient ${patientId} not accessible in clinic ${clinicId}`);
          return []; // Patient not in this clinic
        }
        
        query += ` AND patient_id = $${params.length + 1}`;
        params.push(patientId);
      }

      query += ` ORDER BY visit_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await _context.database.executeQuery(query, params);
      console.log(`✅ Found ${result.rows.length} appointments for clinic ${clinicId}`);

      return result.rows || [];
    } catch (error) {
      console.error("❌ Appointments query error:", error as Error);
      return [];
    }
  },

  // AppointmentsV3 - Veritas Enhanced + EMPIRE V2
  appointmentsV3: async (
    _: any,
    { limit = 50, offset = 0, patientId }: any,
    _context: GraphQLContext,
  ) => {
    try {
      console.log("🎯 [APPOINTMENT] appointmentsV3 - Query with EMPIRE V2 filtering");
      
      // 🏛️ EMPIRE V2: GATE 0 - Require clinic context
      const clinicId = getClinicIdFromContext(_context);
      if (!clinicId) {
        console.warn("⚠️ No clinic_id - CERO ABSOLUTO - returning []");
        return []; // REGLA 1: NEVER return all appointments
      }
      console.log(`🏛️ Filtering appointmentsV3 for clinic: ${clinicId}`);

      // TODO: Update AppointmentsDatabase class to accept clinicId parameter
      // For now, direct query with clinic filtering
      let query = `
        SELECT * FROM appointments
        WHERE is_active = true 
          AND deleted_at IS NULL
          AND clinic_id = $1
      `;
      
      const params: any[] = [clinicId];

      if (patientId) {
        // 🏛️ EMPIRE V2: Verify patient belongs to this clinic
        const patientAccessCheck = await _context.database.executeQuery(
          `SELECT 1 FROM patient_clinic_access 
           WHERE patient_id = $1 AND clinic_id = $2 AND is_active = TRUE`,
          [patientId, clinicId]
        );
        
        if (patientAccessCheck.rows.length === 0) {
          console.warn(`⚠️ Patient ${patientId} not accessible in clinic ${clinicId}`);
          return [];
        }
        
        query += ` AND patient_id = $${params.length + 1}`;
        params.push(patientId);
      }

      query += ` ORDER BY appointment_date DESC, appointment_time DESC 
                 LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await _context.database.executeQuery(query, params);
      console.log(`✅ Found ${result.rows.length} appointmentsV3 for clinic ${clinicId}`);

      return result.rows || [];
    } catch (error) {
      console.error("❌ AppointmentsV3 query error:", error as Error);
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
      console.log(`🎯 [APPOINTMENT] appointmentV3(${id}) - Query with EMPIRE V2 filtering`);
      
      // 🏛️ EMPIRE V2: GATE 0 - Require clinic context
      const clinicId = getClinicIdFromContext(context);
      if (!clinicId) {
        console.warn("⚠️ No clinic_id - CERO ABSOLUTO - returning null");
        return null; // REGLA 1: NEVER return appointment without clinic check
      }

      // 🏛️ EMPIRE V2: Verify appointment belongs to this clinic
      const query = `
        SELECT * FROM appointments
        WHERE id = $1 
          AND clinic_id = $2
          AND is_active = true
          AND deleted_at IS NULL
      `;
      
      const result = await context.database.executeQuery(query, [id, clinicId]);
      
      if (result.rows.length === 0) {
        console.warn(`⚠️ Appointment ${id} not found or not accessible in clinic ${clinicId}`);
        return null;
      }

      console.log(`✅ Appointment ${id} belongs to clinic ${clinicId}`);
      return result.rows[0];
    } catch (error) {
      console.error("❌ AppointmentV3 query error:", error as Error);
      return null;
    }
  },

  // 🚨 CRITICAL: Calendar View - MUST filter by clinic_id
  appointmentsV3ByDate: async (
    _: any,
    { date }: any,
    _context: GraphQLContext,
  ) => {
    try {
      console.log(`🎯 [APPOINTMENT] appointmentsV3ByDate(${date}) - CALENDAR VIEW with EMPIRE V2`);
      
      // 🏛️ EMPIRE V2: GATE 0 - Require clinic context
      const clinicId = getClinicIdFromContext(_context);
      if (!clinicId) {
        console.warn("⚠️ No clinic_id - CERO ABSOLUTO - returning []");
        console.warn("🚨 Calendar View WITHOUT clinic filter = MASSIVE DATA BREACH");
        return []; // REGLA 1: NEVER return all appointments from all clinics
      }
      console.log(`🏛️ Calendar View for clinic: ${clinicId} on date: ${date}`);

      // 🏛️ EMPIRE V2: Filter by clinic_id AND date
      const query = `
        SELECT * FROM appointments
        WHERE clinic_id = $1
          AND appointment_date = $2
          AND is_active = true
          AND deleted_at IS NULL
        ORDER BY appointment_time ASC
      `;
      
      const result = await _context.database.executeQuery(query, [clinicId, date]);
      console.log(`✅ Calendar View: Found ${result.rows.length} appointments for clinic ${clinicId} on ${date}`);

      return result.rows || [];
    } catch (error) {
      console.error("❌ Appointments by date error:", error as Error);
      return [];
    }
  },
};


