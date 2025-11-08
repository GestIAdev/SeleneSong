import {
  Patient,
  PatientQuery,
  PatientMutation,
} from "../Patients/resolvers.js";
import { patientQueries, patientMutations } from "./resolvers/index.js"; // ✅ V3 Patient queries + mutations
import {
  Appointment,
  AppointmentV3,
  AppointmentQuery,
  AppointmentMutation,
} from "../Calendar/resolvers.js";
import {
  treatments,
  treatment,
  treatmentsV3,
  treatmentV3,
  treatmentRecommendationsV3,
  createTreatmentV3,
  updateTreatmentV3,
  deleteTreatmentV3,
  generateTreatmentPlanV3,
  treatmentV3Created,
  treatmentV3Updated,
  TreatmentV3,
} from "./resolvers/index.js";
import {
  medicalRecords,
  medicalRecord,
} from "./resolvers/Query/medicalRecord.js";
import { DateString } from "./scalars/DateString.js";  // ✅ Custom scalar for YYYY-MM-DD dates
import {
  MedicalRecord,
  MedicalRecordV3,
  MedicalRecordQuery,
  MedicalRecordMutation,
  MedicalRecordSubscription,
} from "../MedicalRecords/resolvers.js";
import {
  DocumentV3,
  DocumentQuery,
  DocumentMutation,
  DocumentSubscription,
} from "../Documents/resolvers.js";
import { ReactorQuery, ReactorMutation } from "../Reactor/resolvers.js";
import {
  InventoryV3,
  InventoryQuery,
  InventoryMutation,
  InventorySubscription,
} from "../Inventory/resolvers.js";
import {
  BillingDataV3,
  BillingDataQuery,
  BillingDataMutation,
} from "../BillingData/resolvers.js";
import {
  ComplianceV3,
  ComplianceQuery,
  ComplianceMutation,
} from "../Compliance/resolvers.js";
import { AuthQuery, AuthMutation, User } from "./resolvers/Auth/index.js";

console.log("🔥 MAIN RESOLVERS LOADED - CHECKING QUANTUM RESURRECTION...");
console.log("🔍 ReactorMutation available?", !!ReactorMutation);
console.log(
  "🔍 ReactorMutation keys:",
  ReactorMutation ? Object.keys(ReactorMutation) : "null",
);
console.log(
  "🔍 quantumResurrection in ReactorMutation?",
  ReactorMutation && "quantumResurrection" in ReactorMutation,
);

// Define Treatment domain resolvers
const TreatmentQuery = {
  treatments, // ✅ Legacy resolver for migration
  treatment, // ✅ Legacy resolver for migration
  treatmentsV3,
  treatmentV3,
  treatmentRecommendationsV3,
};

const TreatmentMutation = {
  createTreatmentV3,
  updateTreatmentV3,
  deleteTreatmentV3,
  generateTreatmentPlanV3,
};

const TreatmentSubscription = {
  treatmentV3Created,
  treatmentV3Updated,
};

export const Query = {
  ...AuthQuery, // 🔥 V3 Authentication
  ...ReactorQuery,
  ...PatientQuery, // Legacy patients queries
  ...patientQueries, // ✅ V3 patients queries (patientsV3, patientV3)
  ...AppointmentQuery,
  ...TreatmentQuery,
  medicalRecords, // ✅ Legacy resolver for migration
  medicalRecord, // ✅ Legacy resolver for migration
  ...MedicalRecordQuery,
  ...DocumentQuery,
  ...InventoryQuery,
  ...BillingDataQuery,
  ...ComplianceQuery,
};

export const Mutation = {
  ...AuthMutation, // 🔥 V3 Authentication
  ...ReactorMutation,
  ...PatientMutation, // Legacy patient mutations
  ...patientMutations, // ✅ V3 patient mutations (createPatientV3, updatePatientV3, deletePatientV3)
  ...AppointmentMutation,
  ...TreatmentMutation,
  ...MedicalRecordMutation,
  ...DocumentMutation,
  ...InventoryMutation,
  ...BillingDataMutation,
  ...ComplianceMutation,
};

export const Subscription = {
  ...DocumentSubscription,
  ...MedicalRecordSubscription,
  ...TreatmentSubscription,
};

export const resolvers = {
  Query,
  Mutation,
  Subscription,
  User, // 🔥 V3 Auth - User type resolver
  Patient,
  Appointment, // V169 Schema Bridge resolver
  AppointmentV3,
  TreatmentV3,
  MedicalRecord, // V169 Schema Bridge resolver
  MedicalRecordV3,
  DocumentV3,
  InventoryV3,
  BillingDataV3,
  ComplianceV3,
  DateString,  // ✅ Custom scalar for YYYY-MM-DD dates
};

export default resolvers;


