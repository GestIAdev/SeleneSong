import { GraphQLContext } from "../../types.js";


// ============================================================================
// 🎯 APPOINTMENT V3 MUTATION RESOLVERS - VERITAS ENHANCED
// ============================================================================

export const appointmentMutations = {
  // 🔥 CREATE APPOINTMENTV3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4)
  createAppointmentV3: async (
    _: any,
    { input }: any,
    _context: GraphQLContext,
  ) => {
    console.log("🎯 [APPOINTMENTS] createAppointmentV3 - Creating with FOUR-GATE protection");
    
    try {
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

      // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
      const appointment = await _context.database.createAppointment(input);
      console.log("✅ GATE 3 (Transacción DB) - Created:", appointment.id);

      // ✅ GATE 4: AUDITORÍA - Log to audit trail
      if (_context.auditLogger) {
        await _context.auditLogger.logMutation({
          entityType: 'AppointmentV3',
          entityId: appointment.id,
          operationType: 'CREATE',
          userId: _context.user?.id,
          userEmail: _context.user?.email,
          ipAddress: _context.ip,
          newValues: appointment,
        });
        console.log("✅ GATE 4 (Auditoría) - Mutation logged");
      }

      return appointment;
    } catch (error) {
      console.error("❌ createAppointmentV3 error:", error as Error);
      throw new Error(`Failed to create appointmentV3: ${(error as Error).message}`);
    }
  },

  // 🔥 UPDATE APPOINTMENTV3 - FOUR-GATE PATTERN (GATE 1 + 3 + 4)
  updateAppointmentV3: async (
    _: any,
    { id, input }: any,
    _context: GraphQLContext,
  ) => {
    console.log("🎯 [APPOINTMENTS] updateAppointmentV3 - Updating with FOUR-GATE protection");
    
    try {
      // ✅ GATE 1: VERIFICACIÓN - Input validation
      if (!id) {
        throw new Error('Validation failed: id is required');
      }
      if (!input || typeof input !== 'object') {
        throw new Error('Validation failed: input must be a non-null object');
      }
      console.log("✅ GATE 1 (Verificación) - Input validated");

      // Capture old values for audit trail
      const oldAppointment = await _context.database.appointments.getAppointmentByIdV3(id);
      if (!oldAppointment) {
        throw new Error(`Appointment ${id} not found`);
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
      console.log("✅ GATE 3 (Transacción DB) - Updated:", appointment.id);

      // ✅ GATE 4: AUDITORÍA - Log to audit trail
      if (_context.auditLogger) {
        await _context.auditLogger.logMutation({
          entityType: 'AppointmentV3',
          entityId: id,
          operationType: 'UPDATE',
          userId: _context.user?.id,
          userEmail: _context.user?.email,
          ipAddress: _context.ip,
          oldValues: oldAppointment,
          newValues: appointment,
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
  deleteAppointmentV3: async (_: any, { id }: any, _context: GraphQLContext) => {
    console.log("🎯 [APPOINTMENTS] deleteAppointmentV3 - Deleting with FOUR-GATE protection");
    
    try {
      // ✅ GATE 1: VERIFICACIÓN - Input validation
      if (!id) {
        throw new Error('Validation failed: id is required');
      }
      console.log("✅ GATE 1 (Verificación) - Input validated");

      // Capture old values for audit trail
      const oldAppointment = await _context.database.appointments.getAppointmentByIdV3(id);
      if (!oldAppointment) {
        throw new Error(`Appointment ${id} not found`);
      }

      // ✅ GATE 3: TRANSACCIÓN DB - Real database operation
      const deleted = await _context.database.deleteAppointment(id);
      console.log("✅ GATE 3 (Transacción DB) - Deleted (soft delete):", id);
      
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
          oldValues: oldAppointment,
        });
        console.log("✅ GATE 4 (Auditoría) - Mutation logged");
      }

      console.log("✅ AppointmentV3 deleted:", id);
      return { success: true, message: "Appointment deleted successfully" };
    } catch (error) {
      console.error("❌ deleteAppointmentV3 error:", error as Error);
      throw new Error(`Failed to delete appointmentV3: ${(error as Error).message}`);
    }
  },
};


