import { GraphQLContext } from "../graphql/types.js";

// V169 Schema Bridge: Resolver para Appointment con date/time mapping
export const Appointment = {
  // V169 Bridge: date desde scheduled_date o appointmentDate
  date: async (parent: any) => {
    if (parent.date) return parent.date; // Si ya viene de apollo_appointments view
    if (parent.scheduled_date)
      return parent.scheduled_date.toISOString().split("T")[0]; // Extract date
    if (parent.appointmentDate) return parent.appointmentDate;
    return null;
  },
  // V169 Bridge: time desde scheduled_date o appointmentTime
  time: async (parent: any) => {
    if (parent.time) return parent.time; // Si ya viene de apollo_appointments view
    if (parent.scheduled_date) {
      const time = parent.scheduled_date.toISOString().split("T")[1];
      return time ? time.substring(0, 8) : null; // Extract HH:MM:SS
    }
    if (parent.appointmentTime) return parent.appointmentTime;
    return null;
  },
};

export const AppointmentV3 = {
  appointmentDate: async (_p: any) => _p.appointmentDate,
  appointmentDate_veritas: async (p: any, _: any, _ctx: GraphQLContext) => {
    if (!p.appointmentDate)
      return {
        verified: false,
        confidence: 0,
        level: "HIGH",
        certificate: null,
        error: "Field is null/undefined",
        verifiedAt: new Date().toISOString(),
        algorithm: "CRITICAL_VERIFICATION_V3",
      };
    const v = await _ctx.veritas.verifyDataIntegrity(
      p.appointmentDate,
      "appointment",
      p.id,
    );
    return {
      verified: v.verified,
      confidence: v.confidence,
      level: "HIGH",
      certificate: v.certificate?.dataHash,
      error: null,
      verifiedAt: new Date().toISOString(),
      algorithm: "CRITICAL_VERIFICATION_V3",
    };
  },
  appointmentTime: async (_p: any) => _p.appointmentTime,
  appointmentTime_veritas: async (p: any, _: any, _ctx: GraphQLContext) => {
    if (!p.appointmentTime)
      return {
        verified: false,
        confidence: 0,
        level: "HIGH",
        certificate: null,
        error: "Field is null/undefined",
        verifiedAt: new Date().toISOString(),
        algorithm: "CRITICAL_VERIFICATION_V3",
      };
    const v = await _ctx.veritas.verifyDataIntegrity(
      p.appointmentTime,
      "appointment",
      p.id,
    );
    return {
      verified: v.verified,
      confidence: v.confidence,
      level: "HIGH",
      certificate: v.certificate?.dataHash,
      error: null,
      verifiedAt: new Date().toISOString(),
      algorithm: "CRITICAL_VERIFICATION_V3",
    };
  },
  status: async (_p: any) => _p.status,
  status_veritas: async (p: any, _: any, _ctx: GraphQLContext) => {
    if (!p.status)
      return {
        verified: false,
        confidence: 0,
        level: "MEDIUM",
        certificate: null,
        error: "Field is null/undefined",
        verifiedAt: new Date().toISOString(),
        algorithm: "CRITICAL_VERIFICATION_V3",
      };
    const v = await _ctx.veritas.verifyDataIntegrity(
      p.status,
      "appointment",
      p.id,
    );
    return {
      verified: v.verified,
      confidence: v.confidence,
      level: "MEDIUM",
      certificate: v.certificate?.dataHash,
      error: null,
      verifiedAt: new Date().toISOString(),
      algorithm: "CRITICAL_VERIFICATION_V3",
    };
  },
  treatmentDetails: async (_p: any) => _p.treatmentDetails,
  treatmentDetails_veritas: async (p: any, _: any, _ctx: GraphQLContext) => {
    if (!p.treatmentDetails)
      return {
        verified: false,
        confidence: 0,
        level: "HIGH",
        certificate: null,
        error: "Field is null/undefined",
        verifiedAt: new Date().toISOString(),
        algorithm: "CRITICAL_VERIFICATION_V3",
      };
    const v = await _ctx.veritas.verifyDataIntegrity(
      p.treatmentDetails,
      "appointment",
      p.id,
    );
    return {
      verified: v.verified,
      confidence: v.confidence,
      level: "HIGH",
      certificate: v.certificate?.dataHash,
      error: null,
      verifiedAt: new Date().toISOString(),
      algorithm: "CRITICAL_VERIFICATION_V3",
    };
  },
};

export const AppointmentQuery = {
  appointments: async (
    _: any,
    { limit = 50, offset = 0, patientId }: any,
    _ctx: GraphQLContext,
  ) => {
    const all = await _ctx.database.getAppointments();
    const filtered = patientId
      ? all.filter((_a: any) => _a.patientId === patientId)
      : all;
    return filtered.slice(offset, offset + limit);
  },
  appointment: async (_: any, { id }: any, _ctx: GraphQLContext) => {
    const list = await _ctx.database.getAppointments();
    return list.find((_a: any) => _a.id === id) || null;
  },
  appointmentsV3: async (
    _: any,
    { limit = 50, offset = 0, patientId }: any,
    _ctx: GraphQLContext,
  ) => {
    const all = await _ctx.database.getAppointments();
    const filtered = patientId
      ? all.filter((_a: any) => _a.patientId === patientId)
      : all;
    return filtered.slice(offset, offset + limit);
  },
  appointmentV3: async (_: any, { id }: any, _ctx: GraphQLContext) => {
    const list = await _ctx.database.getAppointments();
    return list.find((_a: any) => _a.id === id) || null;
  },
  appointmentsByDate: async (_: any, { date }: any, _ctx: GraphQLContext) => {
    const list = await _ctx.database.getAppointments();
    return list.filter((_a: any) => _a.appointmentDate === date);
  },
  appointmentsV3ByDate: async (_: any, { date }: any, _ctx: GraphQLContext) => {
    const list = await _ctx.database.getAppointments();
    return list.filter((_a: any) => _a.appointmentDate === date);
  },
};

export const AppointmentMutation = {
  createAppointment: async (_: any, { input }: any, _ctx: GraphQLContext) =>
    _ctx.database.createAppointment(input),
  updateAppointment: async (_: any, { id, input }: any) => ({
    id,
    ...input,
    updatedAt: new Date().toISOString(),
  }),
  deleteAppointment: async () => true,
  createAppointmentV3: async (_: any, { input }: any, _ctx: GraphQLContext) =>
    _ctx.database.createAppointment(input),
  updateAppointmentV3: async (_: any, { id, input }: any) => ({
    id,
    ...input,
    updatedAt: new Date().toISOString(),
  }),
  deleteAppointmentV3: async () => true,
};


