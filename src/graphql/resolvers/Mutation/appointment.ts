import { GraphQLContext } from "../../types.js";
import { requireClinicAccess, getClinicIdFromContext } from "../../utils/clinicHelpers.js";

// ============================================================================
// 🎯 APPOINTMENT V3 MUTATION RESOLVERS - VERITAS ENHANCED + EMPIRE V2
// ============================================================================

export const appointmentMutations = {
  // 🔥 CREATE APPOINTMENTV3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4) + EMPIRE V2
  createAppointmentV3: async (
    _: any,
    { input }: any,
    _context: GraphQLContext,
  ) => {
    console.log("🎯 [APPOINTMENTS] createAppointmentV3 - Creating with FOUR-GATE + EMPIRE V2");
    
    try {
      // 🏛️ EMPIRE V2: GATE 0 - Require clinic access
      const clinicId = requireClinicAccess({ user: _context.user }, false);
      console.log(`🏛️ Creating appointment for clinic: ${clinicId}`);
      
      // ✅ GATE 1: VERIFICACIÓN - Input validation
      if (!input || typeof input !== 'object') {
        throw new Error('Validation failed: input must be a non-null object');
      }
      if (!input.patientId) {
        throw new Error('Validation failed: patientId is required');
      }
      if (!input.appointmentDate) {
        throw new Error('Validation failed: appointmentDate is required');
      }
      if (!input.appointmentTime) {
        throw new Error('Validation failed: appointmentTime is required');
      }
      if (!input.duration || input.duration <= 0) {
        throw new Error('Validation failed: duration must be a positive number');
      }
      console.log("✅ GATE 1 (Verificación) - Input validated");

      // 🏛️ EMPIRE V2: VALIDACIÓN DE REFERENCIAS CRUZADAS
      
      // 1️⃣ Verify PATIENT belongs to this clinic
      const patientAccessCheck = await _context.database.executeQuery(`
        SELECT * FROM patient_clinic_access 
        WHERE patient_id = $1 AND clinic_id = $2 AND is_active = TRUE
      `, [input.patientId, clinicId]);
      
      if (patientAccessCheck.rows.length === 0) {
        throw new Error(
          `Patient ${input.patientId} is not accessible in clinic ${clinicId}. ` +
          `Cannot create appointment for patient from another clinic.`
        );
      }
      console.log(`✅ EMPIRE V2 - Patient ${input.patientId} belongs to clinic ${clinicId}`);

      // 2️⃣ Verify DENTIST (practitioner) belongs to this clinic
      if (input.practitionerId) {
        const dentistCheck = await _context.database.executeQuery(`
          SELECT * FROM users 
          WHERE id = $1 AND (clinic_id = $2 OR current_clinic_id = $2) AND is_active = TRUE
        `, [input.practitionerId, clinicId]);
        
        if (dentistCheck.rows.length === 0) {
          throw new Error(
            `Practitioner ${input.practitionerId} does not belong to clinic ${clinicId}. ` +
            `Cannot assign appointment to staff from another clinic.`
          );
        }
        console.log(`✅ EMPIRE V2 - Practitioner ${input.practitionerId} belongs to clinic ${clinicId}`);
      }

      // 3️⃣ CONFLICT DETECTION (scoped by clinic)
      // Check for time slot conflicts within THIS clinic only
      const conflictCheck = await _context.database.executeQuery(`
        SELECT * FROM appointments
        WHERE clinic_id = $1
          AND practitioner_id = $2
          AND appointment_date = $3
          AND appointment_time = $4
          AND is_active = TRUE
          AND deleted_at IS NULL
      `, [clinicId, input.practitionerId, input.appointmentDate, input.appointmentTime]);
      
      if (conflictCheck.rows.length > 0) {
        throw new Error(
          `Time slot conflict: Practitioner ${input.practitionerId} already has an appointment ` +
          `on ${input.appointmentDate} at ${input.appointmentTime} in clinic ${clinicId}`
        );
      }
      console.log(`✅ EMPIRE V2 - No time conflicts for this slot in clinic ${clinicId}`);

      // 🏛️ EMPIRE V2: Inject clinic_id into input
      const appointmentData = {
        ...input,
        clinic_id: clinicId, // CRITICAL: Add clinic_id to appointment
      };

      // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
      const appointment = await _context.database.createAppointment(appointmentData);
      console.log(`✅ GATE 3 (Transacción DB) - Created appointment ${appointment.id} in clinic ${clinicId}`);

      // ✅ GATE 4: AUDITORÍA - Log to audit trail
      if (_context.auditLogger) {
        await _context.auditLogger.logMutation({
          entityType: 'AppointmentV3',
          entityId: appointment.id,
          operationType: 'CREATE',
          userId: _context.user?.id,
          userEmail: _context.user?.email,
          ipAddress: _context.ip,
          newValues: { ...appointment, clinicId }, // Include clinic context
        });
        console.log("✅ GATE 4 (Auditoría) - Mutation logged");
      }

      return appointment;
    } catch (error) {
      console.error("❌ createAppointmentV3 error:", error as Error);
      throw new Error(`Failed to create appointmentV3: ${(error as Error).message}`);
    }
  },

  // 🔥 UPDATE APPOINTMENTV3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4) + EMPIRE V2
  updateAppointmentV3: async (
    _: any,
    { id, input }: any,
    _context: GraphQLContext,
  ) => {
    console.log("🎯 [APPOINTMENTS] updateAppointmentV3 - Updating with FOUR-GATE + EMPIRE V2");
    
    try {
      // 🏛️ EMPIRE V2: GATE 0 - Require clinic access
      const clinicId = requireClinicAccess({ user: _context.user }, false);
      console.log(`🏛️ Verifying appointment ${id} belongs to clinic ${clinicId}`);
      
      // ✅ GATE 1: VERIFICACIÓN - Input validation
      if (!id) {
        throw new Error('Validation failed: id is required');
      }
      if (!input || typeof input !== 'object') {
        throw new Error('Validation failed: input must be a non-null object');
      }
      console.log("✅ GATE 1 (Verificación) - Input validated");

      // 🏛️ EMPIRE V2: Verify appointment belongs to this clinic
      const appointmentCheck = await _context.database.executeQuery(`
        SELECT * FROM appointments
        WHERE id = $1 AND clinic_id = $2 AND is_active = TRUE AND deleted_at IS NULL
      `, [id, clinicId]);
      
      if (appointmentCheck.rows.length === 0) {
        throw new Error(
          `Appointment ${id} not found or not accessible in clinic ${clinicId}. ` +
          `Cannot update appointment from another clinic.`
        );
      }
      console.log(`✅ EMPIRE V2 - Appointment ${id} belongs to clinic ${clinicId}`);

      // Capture old values for audit trail
      const oldAppointment = appointmentCheck.rows[0];

      // 🏛️ EMPIRE V2: If changing patient or practitioner, validate they belong to THIS clinic
      if (input.patientId && input.patientId !== oldAppointment.patient_id) {
        const patientAccessCheck = await _context.database.executeQuery(`
          SELECT 1 FROM patient_clinic_access 
          WHERE patient_id = $1 AND clinic_id = $2 AND is_active = TRUE
        `, [input.patientId, clinicId]);
        
        if (patientAccessCheck.rows.length === 0) {
          throw new Error(
            `Cannot reassign appointment to patient ${input.patientId}: ` +
            `Patient not accessible in clinic ${clinicId}`
          );
        }
        console.log(`✅ EMPIRE V2 - New patient ${input.patientId} belongs to clinic ${clinicId}`);
      }

      if (input.practitionerId && input.practitionerId !== oldAppointment.practitioner_id) {
        const dentistCheck = await _context.database.executeQuery(`
          SELECT 1 FROM users 
          WHERE id = $1 AND (clinic_id = $2 OR current_clinic_id = $2) AND is_active = TRUE
        `, [input.practitionerId, clinicId]);
        
        if (dentistCheck.rows.length === 0) {
          throw new Error(
            `Cannot reassign appointment to practitioner ${input.practitionerId}: ` +
            `Practitioner not in clinic ${clinicId}`
          );
        }
        console.log(`✅ EMPIRE V2 - New practitioner ${input.practitionerId} belongs to clinic ${clinicId}`);
      }

      // 🏛️ EMPIRE V2: If changing date/time, check for conflicts (scoped by clinic)
      if (input.appointmentDate || input.appointmentTime) {
        const checkDate = input.appointmentDate || oldAppointment.appointment_date;
        const checkTime = input.appointmentTime || oldAppointment.appointment_time;
        const checkPractitioner = input.practitionerId || oldAppointment.practitioner_id;

        const conflictCheck = await _context.database.executeQuery(`
          SELECT * FROM appointments
          WHERE clinic_id = $1
            AND practitioner_id = $2
            AND appointment_date = $3
            AND appointment_time = $4
            AND id != $5
            AND is_active = TRUE
            AND deleted_at IS NULL
        `, [clinicId, checkPractitioner, checkDate, checkTime, id]);
        
        if (conflictCheck.rows.length > 0) {
          throw new Error(
            `Time slot conflict: Practitioner ${checkPractitioner} already has an appointment ` +
            `on ${checkDate} at ${checkTime} in clinic ${clinicId}`
          );
        }
        console.log(`✅ EMPIRE V2 - No time conflicts for updated slot in clinic ${clinicId}`);
      }

      // Transform appointmentDate + appointmentTime into scheduledDate timestamp
      const updateData: any = { ...input };
      
      // If BOTH date and time provided, combine into scheduledDate
      if (input.appointmentDate && input.appointmentTime) {
        updateData.scheduledDate = new Date(`${input.appointmentDate}T${input.appointmentTime}:00Z`);
        delete updateData.appointmentDate;
        delete updateData.appointmentTime;
      } 
      // If only one provided, remove it (partial updates not supported for date/time)
      else if (input.appointmentDate || input.appointmentTime) {
        delete updateData.appointmentDate;
        delete updateData.appointmentTime;
      }

      console.log(`💥 UPDATE DATA TO DB:`, updateData);

      // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
      const appointment = await _context.database.updateAppointment(id, updateData);
      console.log(`✅ GATE 3 (Transacción DB) - Updated appointment ${id} in clinic ${clinicId}`);

      // ✅ GATE 4: AUDITORÍA - Log to audit trail
      if (_context.auditLogger) {
        await _context.auditLogger.logMutation({
          entityType: 'AppointmentV3',
          entityId: id,
          operationType: 'UPDATE',
          userId: _context.user?.id,
          userEmail: _context.user?.email,
          ipAddress: _context.ip,
          oldValues: { ...oldAppointment, clinicId },
          newValues: { ...appointment, clinicId },
          changedFields: Object.keys(input),
        });
        console.log("✅ GATE 4 (Auditoría) - Mutation logged");
      }

      console.log("💥 APPOINTMENT OBJECT RETURNED FROM DB:", JSON.stringify(appointment, null, 2));
      return appointment;
    } catch (error) {
      console.error("❌ updateAppointmentV3 error:", error as Error);
      throw new Error(`Failed to update appointmentV3: ${(error as Error).message}`);
    }
  },

  // 🔥 DELETE APPOINTMENTV3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4)
  // 🔥 DELETE APPOINTMENTV3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4) + EMPIRE V2
  deleteAppointmentV3: async (_: any, { id }: any, _context: GraphQLContext) => {
    console.log("🎯 [APPOINTMENTS] deleteAppointmentV3 - Deleting with FOUR-GATE + EMPIRE V2");
    
    try {
      // 🏛️ EMPIRE V2: GATE 0 - Require clinic access
      const clinicId = requireClinicAccess({ user: _context.user }, false);
      console.log(`🏛️ Verifying appointment ${id} belongs to clinic ${clinicId}`);
      
      // ✅ GATE 1: VERIFICACIÓN - Input validation
      if (!id) {
        throw new Error('Validation failed: id is required');
      }
      console.log("✅ GATE 1 (Verificación) - Input validated");

      // 🏛️ EMPIRE V2: Verify appointment belongs to this clinic
      const appointmentCheck = await _context.database.executeQuery(`
        SELECT * FROM appointments
        WHERE id = $1 AND clinic_id = $2 AND is_active = TRUE AND deleted_at IS NULL
      `, [id, clinicId]);
      
      if (appointmentCheck.rows.length === 0) {
        throw new Error(
          `Appointment ${id} not found or not accessible in clinic ${clinicId}. ` +
          `Cannot delete appointment from another clinic.`
        );
      }
      console.log(`✅ EMPIRE V2 - Appointment ${id} belongs to clinic ${clinicId}`);

      // Capture old values for audit trail
      const oldAppointment = appointmentCheck.rows[0];

      // ✅ GATE 3: TRANSACCIÓN DB - Real database operation (soft delete)
      const deleted = await _context.database.deleteAppointment(id);
      console.log(`✅ GATE 3 (Transacción DB) - Deleted appointment ${id} from clinic ${clinicId}`);
      
      if (!deleted) {
        throw new Error("Appointment not found or already deleted");
      }

      // ✅ GATE 4: AUDITORÍA - Log to audit trail
      if (_context.auditLogger) {
        await _context.auditLogger.logMutation({
          entityType: 'AppointmentV3',
          entityId: id,
          operationType: 'DELETE',
          userId: _context.user?.id,
          userEmail: _context.user?.email,
          ipAddress: _context.ip,
          oldValues: { ...oldAppointment, clinicId },
        });
        console.log("✅ GATE 4 (Auditoría) - Mutation logged");
      }

      return { 
        success: true, 
        message: `Appointment ${id} deleted from clinic ${clinicId}`,
        id 
      };
    } catch (error) {
      console.error("❌ deleteAppointmentV3 error:", error as Error);
      throw new Error(`Failed to delete appointmentV3: ${(error as Error).message}`);
    }
  },
};


