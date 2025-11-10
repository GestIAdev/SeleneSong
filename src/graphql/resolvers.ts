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
  ToothDataV3,
  ToothSurfaceV3,
  odontogramQueryResolvers,
  odontogramMutationResolvers,
  odontogramSubscriptionResolvers,
} from "../Treatments/odontogramResolvers.js";
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
} from "../Inventory/resolvers.js";
import {
  BillingDataV3,
} from "../BillingData/resolvers.js";
import {
  ComplianceV3,
} from "../Compliance/resolvers.js";
import { AuthQuery, AuthMutation, User } from "./resolvers/Auth/index.js";
import { inventorySubscriptions } from "./resolvers/Subscription/inventory.js";
import { inventoryQueries } from './resolvers/Query/inventory.js';
import { inventoryMutations } from './resolvers/Mutation/inventory.js';
import { marketplaceQueries } from './resolvers/Query/marketplace.js';
import { marketplaceMutations } from './resolvers/Mutation/marketplace.js';
import { billingQueries } from './resolvers/Query/billing.js';
import { billingMutations } from './resolvers/Mutation/billing.js';
import { complianceQueries } from './resolvers/Query/compliance.js';
import { complianceMutations } from './resolvers/Mutation/compliance.js';

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
  ...odontogramQueryResolvers, // 🦷💀 Odontogram 3D V3
};

const TreatmentMutation = {
  createTreatmentV3,
  updateTreatmentV3,
  deleteTreatmentV3,
  generateTreatmentPlanV3,
  ...odontogramMutationResolvers, // 🦷💀 Odontogram 3D V3
};

const TreatmentSubscription = {
  treatmentV3Created,
  treatmentV3Updated,
  ...odontogramSubscriptionResolvers, // 🦷💀 Odontogram 3D V3
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
  ...inventoryQueries,
  ...marketplaceQueries,
  ...billingQueries,
  ...complianceQueries,
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
  ...inventoryMutations,
  ...marketplaceMutations,
  ...billingMutations,
  ...complianceMutations,
};

export const Subscription = {
  ...DocumentSubscription,
  ...MedicalRecordSubscription,
  ...TreatmentSubscription,
  ...inventorySubscriptions,
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
  ToothDataV3, // 🦷💀 Odontogram 3D V3
  ToothSurfaceV3, // 🦷💀 Odontogram 3D V3
  MedicalRecord, // V169 Schema Bridge resolver
  MedicalRecordV3,
  DocumentV3,
  InventoryV3,
  BillingDataV3,
  ComplianceV3,
  DateString,  // ✅ Custom scalar for YYYY-MM-DD dates
};

export default resolvers;


