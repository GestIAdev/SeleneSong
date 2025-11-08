import { GraphQLContext } from "../graphql/types.js";
import { appointmentMutations } from "../graphql/resolvers/Mutation/appointment.js"; // ✅ Import V3 mutations

// V169 Schema Bridge: Resolver para Appointment con date/time mapping
export const Appointment = {
  // 🔥 ORACLE FIX: Explicit field resolvers para evitar nulls
  id: (_parent: any) => _parent.id,
  patientId: (_parent: any) => _parent.patientId, // ← EL RESOLVER FALTANTE CRÍTICO
  practitionerId: (_parent: any) => _parent.practitionerId,
  status: (_parent: any) => _parent.status,
  notes: (_parent: any) => _parent.notes,
  duration: (_parent: any) => _parent.duration,
  type: (_parent: any) => _parent.type,
  createdAt: (_parent: any) => _parent.createdAt,
  updatedAt: (_parent: any) => _parent.updatedAt,

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
    ctx: GraphQLContext,
  ) => {
    console.log("🔥🔥🔥 CALENDAR RESOLVER EXECUTING!!! 🔥🔥🔥");
    console.log("🔍 ctx.database type:", typeof ctx.database);
    console.log(
      "🔍 ctx.database constructor:",
      ctx.database?.constructor?.name,
    );
    console.log(
      "🔍 ctx.database.getAppointments type:",
      typeof ctx.database?.getAppointments,
    );
    const all = await ctx.database.getAppointments();
    const filtered = patientId
      ? all.filter((_a: any) => _a.patientId === patientId)
      : all;
    const result = filtered.slice(offset, offset + limit);

    // 🔮 ORACLE DEBUG: Verificar qué se devuelve exactamente
    console.log(
      "🔍 APPOINTMENTS RETURNED:",
      JSON.stringify(result.slice(0, 1)),
    );
    console.log("🔍 TOTAL RETURNED:", result.length);

    return result;
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
  // ✅ V3 MUTATIONS - Use proper resolvers from graphql/resolvers/Mutation/appointment.ts
  ...appointmentMutations,
};

export const AppointmentSubscription = {
  appointmentV3Created: {
    subscribe: (_: any, __: any, { pubsub }: any) =>
      pubsub
        ? pubsub.asyncIterator(["APPOINTMENT_V3_CREATED"])
        : { [Symbol.asyncIterator]: async function* () {} },
  },
  appointmentV3Updated: {
    subscribe: (_: any, __: any, { pubsub }: any) =>
      pubsub
        ? pubsub.asyncIterator(["APPOINTMENT_V3_UPDATED"])
        : { [Symbol.asyncIterator]: async function* () {} },
  },
  appointmentV3Cancelled: {
    subscribe: (_: any, __: any, { pubsub }: any) =>
      pubsub
        ? pubsub.asyncIterator(["APPOINTMENT_V3_CANCELLED"])
        : { [Symbol.asyncIterator]: async function* () {} },
  },
};


