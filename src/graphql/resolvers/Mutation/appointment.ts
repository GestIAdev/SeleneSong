import { GraphQLContext } from "../../types.js";


// ============================================================================
// 🎯 APPOINTMENT V3 MUTATION RESOLVERS - VERITAS ENHANCED
// ============================================================================

export const appointmentMutations = {
  // AppointmentsV3 - Veritas Enhanced
  createAppointmentV3: async (
    _: any,
    { input }: any,
    _context: GraphQLContext,
  ) => {
    try {
      const appointment = await _context.database.createAppointment(input);
      return appointment;
    } catch (error) {
      console.error("Create appointmentV3 error:", error as Error);
      throw new Error("Failed to create appointmentV3");
    }
  },

  updateAppointmentV3: async (
    _: any,
    { id, input }: any,
    _context: GraphQLContext,
  ) => {
    try {
      console.log(`✏️ UPDATE APPOINTMENT V3 mutation called with id: ${id}, input:`, input);
      
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

      const appointment = await _context.database.updateAppointment(id, updateData);
      console.log("✅ AppointmentV3 updated:", appointment.id);
      console.log("💥 APPOINTMENT OBJECT RETURNED FROM DB:", JSON.stringify(appointment, null, 2));
      return appointment;
    } catch (error) {
      console.error("Update appointmentV3 error:", error as Error);
      throw new Error(`Failed to update appointmentV3: ${(error as Error).message}`);
    }
  },

  deleteAppointmentV3: async (_: any, { id }: any, _context: GraphQLContext) => {
    try {
      console.log(`🗑️ DELETE APPOINTMENT V3 mutation called with id: ${id}`);
      const deleted = await _context.database.deleteAppointment(id);
      
      if (!deleted) {
        throw new Error("Appointment not found or already deleted");
      }
      
      console.log("✅ AppointmentV3 deleted:", id);
      return { success: true, message: "Appointment deleted successfully" };
    } catch (error) {
      console.error("Delete appointmentV3 error:", error as Error);
      throw new Error(`Failed to delete appointmentV3: ${(error as Error).message}`);
    }
  },
};


