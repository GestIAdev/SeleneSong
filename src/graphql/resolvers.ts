import {
  Patient,
  PatientQuery,
  PatientMutation,
} from "../Patients/resolvers.js";
import { patientQueries, patientMutations } from "./resolvers/index.js";
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
} from "../Treatments/odontogramResolvers.js";
import { DateString } from "./scalars/DateString.js";

// ✅ PHASE 2: All medical records, documents, inventory, billing imports from SSoT (FieldResolvers/)
import {
  medicalRecords,
  medicalRecord,
  medicalRecordsV3,
  medicalRecordV3,
} from "./resolvers/Query/medicalRecord.js";
import {
  createMedicalRecordV3,
  updateMedicalRecordV3,
  deleteMedicalRecordV3,
} from "./resolvers/Mutation/medicalRecord.js";
import { medicalRecordSubscriptions } from "./resolvers/Subscription/medicalRecord.js";
import { MedicalRecordV3 } from "./resolvers/FieldResolvers/medicalRecord.js";

import {
  documentsV3,
  documentV3,
  unifiedDocumentsV3,
  unifiedDocumentV3
} from './resolvers/Query/document.js';
import {
  createDocumentV3,
  updateDocumentV3,
  deleteDocumentV3,
  uploadUnifiedDocumentV3
} from './resolvers/Mutation/document.js';
import { documentSubscriptions } from "./resolvers/Subscription/document.js";
import { DocumentV3 } from "./resolvers/FieldResolvers/document.js";

import {
  inventoriesV3,
  inventoryV3,
  materialsV3,
  materialV3,
  equipmentsV3,
  equipmentV3,
  maintenancesV3,
  maintenanceV3,
  maintenanceHistoryV3,
  equipmentMaintenanceScheduleV3,
  suppliersV3,
  supplierV3,
  purchaseOrdersV3,
  purchaseOrderV3,
  supplierPurchaseOrdersV3,
  purchaseOrderItemsV3,
  inventoryDashboardV3,
  inventoryAlertsV3
} from "./resolvers/Query/inventory.js";
import {
  createInventoryV3,
  updateInventoryV3,
  deleteInventoryV3,
  adjustInventoryStockV3,
  createMaterialV3,
  updateMaterialV3,
  deleteMaterialV3,
  reorderMaterialV3,
  createEquipmentV3,
  updateEquipmentV3,
  deleteEquipmentV3,
  createMaintenanceV3,
  updateMaintenanceV3,
  createSupplierV3,
  updateSupplierV3,
  deleteSupplierV3,
  createPurchaseOrderV3,
  updatePurchaseOrderV3,
  acknowledgeInventoryAlertV3
} from "./resolvers/Mutation/inventory.js";
import {
  InventoryV3,
  MaterialV3,
  EquipmentV3,
  MaintenanceV3,
  SupplierV3,
  PurchaseOrderV3,
  PurchaseOrderItemV3,
  InventoryDashboardV3
} from "./resolvers/FieldResolvers/inventory.js";
import { inventorySubscriptions } from "./resolvers/Subscription/inventory.js";

import {
  billingDataV3,
  billingDatumV3
} from './resolvers/Query/billing.js';
import {
  createBillingDataV3,
  updateBillingDataV3,
  deleteBillingDataV3
} from './resolvers/Mutation/billing.js';
import { BillingDataV3 } from "./resolvers/FieldResolvers/billing.js";

import {
  compliancesV3,
  complianceV3
} from './resolvers/Query/compliance.js';
import {
  createComplianceV3,
  updateComplianceV3,
  deleteComplianceV3
} from './resolvers/Mutation/compliance.js';
import { ComplianceV3 } from "./resolvers/FieldResolvers/compliance.js";

import { ReactorQuery, ReactorMutation } from "../Reactor/resolvers.js";
import { AuthQuery, AuthMutation, User } from "./resolvers/Auth/index.js";
import { marketplaceQueries } from './resolvers/Query/marketplace.js';
import { marketplaceMutations } from './resolvers/Mutation/marketplace.js';
import { auditQueryResolvers } from './resolvers/Query/audit.js';

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

// ============================================================================
// DEFINE DOMAIN QUERY/MUTATION/SUBSCRIPTION OBJECTS
// ============================================================================

const MedicalRecordQuery = {
  medicalRecords,
  medicalRecord,
  medicalRecordsV3,
  medicalRecordV3,
};

const MedicalRecordMutation = {
  createMedicalRecordV3,
  updateMedicalRecordV3,
  deleteMedicalRecordV3,
};

const DocumentQuery = {
  documentsV3,
  documentV3,
  unifiedDocumentsV3,
  unifiedDocumentV3
};

const DocumentMutation = {
  createDocumentV3,
  updateDocumentV3,
  deleteDocumentV3,
  uploadUnifiedDocumentV3
};

const InventoryQuery = {
  inventoriesV3,
  inventoryV3,
  materialsV3,
  materialV3,
  equipmentsV3,
  equipmentV3,
  maintenancesV3,
  maintenanceV3,
  maintenanceHistoryV3,
  equipmentMaintenanceScheduleV3,
  suppliersV3,
  supplierV3,
  purchaseOrdersV3,
  purchaseOrderV3,
  supplierPurchaseOrdersV3,
  purchaseOrderItemsV3,
  inventoryDashboardV3,
  inventoryAlertsV3
};

const InventoryMutation = {
  createInventoryV3,
  updateInventoryV3,
  deleteInventoryV3,
  adjustInventoryStockV3,
  createMaterialV3,
  updateMaterialV3,
  deleteMaterialV3,
  reorderMaterialV3,
  createEquipmentV3,
  updateEquipmentV3,
  deleteEquipmentV3,
  createMaintenanceV3,
  updateMaintenanceV3,
  createSupplierV3,
  updateSupplierV3,
  deleteSupplierV3,
  createPurchaseOrderV3,
  updatePurchaseOrderV3,
  acknowledgeInventoryAlertV3
};

const BillingQuery = {
  billingDataV3,
  billingDatumV3
};

const BillingMutation = {
  createBillingDataV3,
  updateBillingDataV3,
  deleteBillingDataV3
};

const ComplianceQuery = {
  compliancesV3,
  complianceV3
};

const ComplianceMutation = {
  createComplianceV3,
  updateComplianceV3,
  deleteComplianceV3
};

const TreatmentQuery = {
  treatments,
  treatment,
  treatmentsV3,
  treatmentV3,
  treatmentRecommendationsV3,
  ...odontogramQueryResolvers,
};

const TreatmentMutation = {
  createTreatmentV3,
  updateTreatmentV3,
  deleteTreatmentV3,
  generateTreatmentPlanV3,
  ...odontogramMutationResolvers,
};

const TreatmentSubscription = {
  treatmentV3Created,
  treatmentV3Updated,
};

// ============================================================================
// CONSOLIDATE ALL QUERIES/MUTATIONS/SUBSCRIPTIONS
// ============================================================================

export const Query = {
  ...AuthQuery,
  ...ReactorQuery,
  ...PatientQuery,
  ...patientQueries,
  ...AppointmentQuery,
  ...TreatmentQuery,
  ...MedicalRecordQuery,
  ...DocumentQuery,
  ...InventoryQuery,
  ...BillingQuery,
  ...ComplianceQuery,
  ...marketplaceQueries,
  ...auditQueryResolvers,
};

export const Mutation = {
  ...AuthMutation,
  ...ReactorMutation,
  ...PatientMutation,
  ...patientMutations,
  ...AppointmentMutation,
  ...TreatmentMutation,
  ...MedicalRecordMutation,
  ...DocumentMutation,
  ...InventoryMutation,
  ...BillingMutation,
  ...ComplianceMutation,
  ...marketplaceMutations,
};

export const Subscription = {
  ...documentSubscriptions,
  ...medicalRecordSubscriptions,
  ...TreatmentSubscription,
  ...inventorySubscriptions,
};

export const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Patient,
  Appointment,
  AppointmentV3,
  TreatmentV3,
  ToothDataV3,
  ToothSurfaceV3,
  
  // ✅ PHASE 2: ALL FIELD RESOLVERS FROM SSoT (FieldResolvers/)
  MedicalRecordV3,
  DocumentV3,
  InventoryV3,
  MaterialV3,
  EquipmentV3,
  MaintenanceV3,
  SupplierV3,
  PurchaseOrderV3,
  PurchaseOrderItemV3,
  InventoryDashboardV3,
  BillingDataV3,
  ComplianceV3,
  
  DateString,
};

export default resolvers;


