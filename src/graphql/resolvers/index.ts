// ============================================================================
// 📄 DOCUMENT & PATIENT DOMAIN RESOLVERS - MODULAR ARCHITECTURE
// ============================================================================

// Import all Document domain resolvers
import { documentQueries } from "./Query/document.js";
import { documentMutations } from "./Mutation/document.js";
import { documentSubscriptions } from "./Subscription/document.js";
import { DocumentV3 } from "./FieldResolvers/document.js";

// Import all Patient domain resolvers
import { patientQueries } from "./Query/patient.js";
import { patientMutations } from "./Mutation/patient.js";
import { patientSubscriptions } from "./Subscription/patient.js";
import { PatientV3 } from "./FieldResolvers/patient.js";

// Import all Appointment domain resolvers
import { appointmentQueries } from "./Query/appointment.js";
import { appointmentMutations } from "./Mutation/appointment.js";
import { appointmentSubscriptions } from "./Subscription/appointment.js";
import { AppointmentV3 } from "./FieldResolvers/appointment.js";

// Import all Treatment domain resolvers
import {
  treatmentsV3,
  treatmentV3,
  treatmentRecommendationsV3,
} from "./Query/treatment.js";
import {
  createTreatmentV3,
  updateTreatmentV3,
  deleteTreatmentV3,
  generateTreatmentPlanV3,
} from "./Mutation/treatment.js";
import {
  treatmentV3Created,
  treatmentV3Updated,
} from "./Subscription/treatment.js";
import { TreatmentV3 } from "./FieldResolvers/treatment.js";

// Import all Medical Records domain resolvers
import {
  medicalRecords,
  medicalRecord,
  medicalRecordsV3,
  medicalRecordV3,
} from "./Query/medicalRecord.js";
import {
  createMedicalRecordV3,
  updateMedicalRecordV3,
  deleteMedicalRecordV3,
} from "./Mutation/medicalRecord.js";
import { medicalRecordSubscriptions } from "./Subscription/medicalRecord.js";
import { MedicalRecordV3 } from "./FieldResolvers/medicalRecord.js";

// Import Quantum Subscription Engine - ⚛️ PHASE E
import { quantumSubscriptionResolvers } from "../../Quantum/QuantumSubscriptionEngine.js";

// Re-export individual resolvers
export { documentQueries } from "./Query/document.js";
export { documentMutations } from "./Mutation/document.js";
export { documentSubscriptions } from "./Subscription/document.js";
export { DocumentV3 } from "./FieldResolvers/document.js";

export { patientQueries } from "./Query/patient.js";
export { patientMutations } from "./Mutation/patient.js";
export { patientSubscriptions } from "./Subscription/patient.js";
export { PatientV3 } from "./FieldResolvers/patient.js";

export { appointmentQueries } from "./Query/appointment.js";
export { appointmentMutations } from "./Mutation/appointment.js";
export { appointmentSubscriptions } from "./Subscription/appointment.js";
export { AppointmentV3 } from "./FieldResolvers/appointment.js";

export {
  treatmentsV3,
  treatmentV3,
  treatmentRecommendationsV3,
} from "./Query/treatment.js";
export {
  createTreatmentV3,
  updateTreatmentV3,
  deleteTreatmentV3,
  generateTreatmentPlanV3,
} from "./Mutation/treatment.js";
export {
  treatmentV3Created,
  treatmentV3Updated,
} from "./Subscription/treatment.js";
export { TreatmentV3 } from "./FieldResolvers/treatment.js";

export {
  medicalRecords,
  medicalRecord,
  medicalRecordsV3,
  medicalRecordV3,
} from "./Query/medicalRecord.js";
export {
  createMedicalRecordV3,
  updateMedicalRecordV3,
  deleteMedicalRecordV3,
} from "./Mutation/medicalRecord.js";
export { medicalRecordSubscriptions } from "./Subscription/medicalRecord.js";
export { MedicalRecordV3 } from "./FieldResolvers/medicalRecord.js";

// Consolidated Document domain exports
export const DocumentResolvers = {
  Query: documentQueries,
  Mutation: documentMutations,
  Subscription: documentSubscriptions,
  DocumentV3,
};

// Consolidated Patient domain exports
export const PatientResolvers = {
  Query: patientQueries,
  Mutation: patientMutations,
  Subscription: patientSubscriptions,
  PatientV3,
};

// Consolidated Appointment domain exports
export const AppointmentResolvers = {
  Query: appointmentQueries,
  Mutation: appointmentMutations,
  Subscription: appointmentSubscriptions,
  AppointmentV3,
};

// Consolidated Treatment domain exports
export const TreatmentResolvers = {
  Query: {
    treatmentsV3,
    treatmentV3,
    treatmentRecommendationsV3,
  },
  Mutation: {
    createTreatmentV3,
    updateTreatmentV3,
    deleteTreatmentV3,
    generateTreatmentPlanV3,
  },
  Subscription: {
    treatmentV3Created,
    treatmentV3Updated,
  },
  TreatmentV3,
};

// Consolidated Medical Records domain exports
export const MedicalRecordResolvers = {
  Query: {
    medicalRecords,
    medicalRecord,
    medicalRecordsV3,
    medicalRecordV3,
  },
  Mutation: {
    createMedicalRecordV3,
    updateMedicalRecordV3,
    deleteMedicalRecordV3,
  },
  Subscription: medicalRecordSubscriptions,
  MedicalRecordV3,
};

// Consolidated all domain exports
export const AllResolvers = {
  Query: {
    ...documentQueries,
    ...patientQueries,
    ...appointmentQueries,
    treatmentsV3,
    treatmentV3,
    treatmentRecommendationsV3,
    medicalRecords,
    medicalRecord,
    medicalRecordsV3,
    medicalRecordV3,
  },
  Mutation: {
    ...documentMutations,
    ...patientMutations,
    ...appointmentMutations,
    createTreatmentV3,
    updateTreatmentV3,
    deleteTreatmentV3,
    generateTreatmentPlanV3,
    createMedicalRecordV3,
    updateMedicalRecordV3,
    deleteMedicalRecordV3,
  },
  Subscription: {
    ...documentSubscriptions,
    ...patientSubscriptions,
    ...appointmentSubscriptions,
    ...medicalRecordSubscriptions,
    ...quantumSubscriptionResolvers, // ⚛️ PHASE E: Add quantum subscription resolvers
    treatmentV3Created,
    treatmentV3Updated,
  },
  DocumentV3,
  PatientV3,
  AppointmentV3,
  TreatmentV3,
  MedicalRecordV3,
};

export default AllResolvers;


