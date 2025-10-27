import {
  Patient,
  PatientQuery,
  PatientMutation,
} from "../Patients/resolvers.js";
import {
  Appointment,
  AppointmentV3,
  AppointmentQuery,
  AppointmentMutation,
} from "../Calendar/resolvers.js";
import {
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
  ...ReactorQuery,
  ...PatientQuery,
  ...AppointmentQuery,
  ...TreatmentQuery,
  ...MedicalRecordQuery,
  ...DocumentQuery,
  ...InventoryQuery,
  ...BillingDataQuery,
  ...ComplianceQuery,
};

export const Mutation = {
  ...ReactorMutation,
  ...PatientMutation,
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
};

export default resolvers;


