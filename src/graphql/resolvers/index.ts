// ============================================================================
// 📄 DOCUMENT & PATIENT DOMAIN RESOLVERS - MODULAR ARCHITECTURE
// export { medicalRecordSubscriptions } from "./Subscription/medicalRecord.js";
export { MedicalRecordV3 } from "./FieldResolvers/medicalRecord.js";

// Consolidated Billing domain exports
export {
  billingDataV3,
  billingDatumV3
} from './Query/billing.js';
export {
  createBillingDataV3,
  updateBillingDataV3,
  deleteBillingDataV3
} from './Mutation/billing.js';
export { BillingDataV3 } from "./FieldResolvers/billing.js";

// Consolidated Compliance domain exports
export {
  compliancesV3,
  complianceV3
} from './Query/compliance.js';
export {
  createComplianceV3,
  updateComplianceV3,
  deleteComplianceV3
} from './Mutation/compliance.js';
export { ComplianceV3 } from "./FieldResolvers/compliance.js";

// Import all Document domain resolvers
import {
  documentsV3,
  documentV3,
  unifiedDocumentsV3,
  unifiedDocumentV3
} from './Query/document.js';
import {
  createDocumentV3,
  updateDocumentV3,
  deleteDocumentV3,
  uploadUnifiedDocumentV3
} from './Mutation/document.js';
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
  treatments,
  treatment,
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

// Import all Billing domain resolvers
import {
  billingDataV3,
  billingDatumV3
} from './Query/billing.js';
import {
  createBillingDataV3,
  updateBillingDataV3,
  deleteBillingDataV3
} from './Mutation/billing.js';
import { BillingDataV3 } from "./FieldResolvers/billing.js";

// Import all Compliance domain resolvers
import {
  compliancesV3,
  complianceV3
} from './Query/compliance.js';
import {
  createComplianceV3,
  updateComplianceV3,
  deleteComplianceV3
} from './Mutation/compliance.js';
import { ComplianceV3 } from "./FieldResolvers/compliance.js";

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

// Import all Inventory domain resolvers - SUBMODULE 2A
import {
  inventoriesV3,
  inventoryV3,
  materialsV3,
  materialV3,
  inventoryDashboardV3,
  inventoryAlertsV3
} from "./Query/inventory.js";
import {
  createInventoryV3,
  updateInventoryV3,
  deleteInventoryV3,
  adjustInventoryStockV3,
  createMaterialV3,
  updateMaterialV3,
  deleteMaterialV3,
  reorderMaterialV3,
  acknowledgeInventoryAlertV3
} from "./Mutation/inventory.js";
import {
  InventoryV3,
  MaterialV3,
  InventoryDashboardV3
} from "./FieldResolvers/inventory.js";

// Import all Inventory domain resolvers - SUBMODULE 2B (Equipment + Maintenance)
import {
  equipmentsV3,
  equipmentV3,
  maintenancesV3,
  maintenanceV3,
  maintenanceHistoryV3
} from "./Query/inventory.js";
import {
  createEquipmentV3,
  updateEquipmentV3,
  deleteEquipmentV3,
  scheduleMaintenanceV3,
  completeMaintenanceV3,
  cancelMaintenanceV3
} from "./Mutation/inventory.js";
import {
  EquipmentV3,
  MaintenanceV3
} from "./FieldResolvers/inventory.js";

// Import all Inventory domain resolvers - SUBMODULE 2C (Suppliers + Purchase Orders)
import {
  suppliersV3,
  supplierV3,
  purchaseOrdersV3,
  purchaseOrderV3,
  supplierPurchaseOrdersV3,
  purchaseOrderItemsV3
} from "./Query/inventory.js";
import {
  createSupplierV3,
  updateSupplierV3,
  deleteSupplierV3,
  createPurchaseOrderV3,
  updatePurchaseOrderV3,
  approvePurchaseOrderV3,
  cancelPurchaseOrderV3,
  receivePurchaseOrderV3,
  addPurchaseOrderItemV3,
  updatePurchaseOrderItemV3,
  removePurchaseOrderItemV3
} from "./Mutation/inventory.js";
import {
  SupplierV3,
  PurchaseOrderV3,
  PurchaseOrderItemV3
} from "./FieldResolvers/inventory.js";

// Import all Marketplace domain resolvers - B2B DENTAL SUPPLY SYSTEM
import {
  marketplaceProductsV3,
  marketplaceProductV3,
  suppliersV3 as marketplaceSuppliersV3,
  supplierV3 as marketplaceSupplierV3,
  purchaseOrdersV3 as marketplacePurchaseOrdersV3,
  purchaseOrderV3 as marketplacePurchaseOrderV3,
  cartItemsV3
} from "./Query/marketplace.js";
import {
  createPurchaseOrderV3 as marketplaceCreatePurchaseOrderV3,
  updatePurchaseOrderV3 as marketplaceUpdatePurchaseOrderV3,
  deletePurchaseOrderV3 as marketplaceDeletePurchaseOrderV3,
  addToCartV3,
  updateCartItemV3,
  removeFromCartV3,
  clearCartV3,
  createSupplierV3 as marketplaceCreateSupplierV3,
  updateSupplierV3 as marketplaceUpdateSupplierV3
} from "./Mutation/marketplace.js";
import {
  MarketplaceProductV3,
  SupplierV3 as MarketplaceSupplierV3,
  PurchaseOrderV3 as MarketplacePurchaseOrderV3,
  PurchaseOrderItemV3 as MarketplacePurchaseOrderItemV3,
  CartItemV3
} from "./FieldResolvers/marketplace.js";

// Import all Subscriptions domain resolvers - NETFLIX-DENTAL SYSTEM
import {
  subscriptionPlansV3,
  subscriptionPlanV3,
  subscriptionsV3,
  subscriptionV3,
  billingCyclesV3,
  usageTrackingV3
} from "./Query/subscription.js";
import {
  createSubscriptionV3,
  updateSubscriptionV3,
  cancelSubscriptionV3,
  renewSubscriptionV3,
  createSubscriptionPlanV3,
  updateSubscriptionPlanV3,
  processBillingCycleV3,
  trackServiceUsageV3
} from "./Mutation/subscription.js";
import { subscriptionSubscriptions } from "./Subscription/subscription.js";
import {
  SubscriptionV3,
  BillingCycleV3,
  SubscriptionPlanV3,
  UsageTrackingV3,
  SubscriptionFeatureV3
} from "./FieldResolvers/subscription.js";

// Import all CustomCalendar domain resolvers - AINARKLENDAR SYSTEM
import {
  customCalendarViewsV3,
  customCalendarViewV3
} from "./Query/customcalendar.js";
import {
  createCustomCalendarViewV3,
  updateCustomCalendarViewV3,
  deleteCustomCalendarViewV3
} from "./Mutation/customcalendar.js";
import { customCalendarSubscriptions } from "./Subscription/customcalendar.js";
import {
  CustomCalendarViewV3,
  CalendarSettingsV3,
  CalendarFilterV3,
  CalendarEventV3
} from "./FieldResolvers/customcalendar.js";

// Import Quantum Subscription Engine - ⚛️ PHASE E
import { quantumSubscriptionResolvers } from "../../Quantum/QuantumSubscriptionEngine.js";

// Re-export individual resolvers
export {
  documentsV3,
  documentV3,
  unifiedDocumentsV3,
  unifiedDocumentV3
} from "./Query/document.js";
export {
  createDocumentV3,
  updateDocumentV3,
  deleteDocumentV3,
  uploadUnifiedDocumentV3
} from "./Mutation/document.js";
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
  treatments,
  treatment,
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

// Consolidated Inventory domain exports - SUBMODULE 2A
export {
  inventoriesV3,
  inventoryV3,
  materialsV3,
  materialV3,
  inventoryDashboardV3,
  inventoryAlertsV3
} from "./Query/inventory.js";
export {
  createInventoryV3,
  updateInventoryV3,
  deleteInventoryV3,
  adjustInventoryStockV3,
  createMaterialV3,
  updateMaterialV3,
  deleteMaterialV3,
  reorderMaterialV3,
  acknowledgeInventoryAlertV3
} from "./Mutation/inventory.js";
export {
  InventoryV3,
  MaterialV3,
  InventoryDashboardV3
} from "./FieldResolvers/inventory.js";

// Consolidated Inventory domain exports - SUBMODULE 2B (Equipment + Maintenance)
export {
  equipmentsV3,
  equipmentV3,
  maintenancesV3,
  maintenanceV3,
  maintenanceHistoryV3
} from "./Query/inventory.js";
export {
  createEquipmentV3,
  updateEquipmentV3,
  deleteEquipmentV3,
  scheduleMaintenanceV3,
  completeMaintenanceV3,
  cancelMaintenanceV3
} from "./Mutation/inventory.js";
export {
  EquipmentV3,
  MaintenanceV3
} from "./FieldResolvers/inventory.js";

// Consolidated Inventory domain exports - SUBMODULE 2C (Suppliers + Purchase Orders)
export {
  suppliersV3,
  supplierV3,
  purchaseOrdersV3,
  purchaseOrderV3,
  supplierPurchaseOrdersV3,
  purchaseOrderItemsV3
} from "./Query/inventory.js";
export {
  createSupplierV3,
  updateSupplierV3,
  deleteSupplierV3,
  createPurchaseOrderV3,
  updatePurchaseOrderV3,
  approvePurchaseOrderV3,
  cancelPurchaseOrderV3,
  receivePurchaseOrderV3,
  addPurchaseOrderItemV3,
  updatePurchaseOrderItemV3,
  removePurchaseOrderItemV3
} from "./Mutation/inventory.js";
export {
  SupplierV3,
  PurchaseOrderV3,
  PurchaseOrderItemV3
} from "./FieldResolvers/inventory.js";

// Consolidated Marketplace domain exports - B2B DENTAL SUPPLY SYSTEM
export {
  marketplaceProductsV3,
  marketplaceProductV3,
  suppliersV3 as marketplaceSuppliersV3,
  supplierV3 as marketplaceSupplierV3,
  purchaseOrdersV3 as marketplacePurchaseOrdersV3,
  purchaseOrderV3 as marketplacePurchaseOrderV3,
  cartItemsV3
} from "./Query/marketplace.js";
export {
  createPurchaseOrderV3 as marketplaceCreatePurchaseOrderV3,
  updatePurchaseOrderV3 as marketplaceUpdatePurchaseOrderV3,
  deletePurchaseOrderV3 as marketplaceDeletePurchaseOrderV3,
  addToCartV3,
  updateCartItemV3,
  removeFromCartV3,
  clearCartV3,
  createSupplierV3 as marketplaceCreateSupplierV3,
  updateSupplierV3 as marketplaceUpdateSupplierV3
} from "./Mutation/marketplace.js";
export {
  MarketplaceProductV3,
  SupplierV3 as MarketplaceSupplierV3,
  PurchaseOrderV3 as MarketplacePurchaseOrderV3,
  PurchaseOrderItemV3 as MarketplacePurchaseOrderItemV3,
  CartItemV3
} from "./FieldResolvers/marketplace.js";

// Consolidated Subscriptions domain exports - NETFLIX-DENTAL SYSTEM
export {
  subscriptionPlansV3,
  subscriptionPlanV3,
  subscriptionsV3,
  subscriptionV3,
  billingCyclesV3,
  usageTrackingV3
} from "./Query/subscription.js";
export {
  createSubscriptionV3,
  updateSubscriptionV3,
  cancelSubscriptionV3,
  renewSubscriptionV3,
  createSubscriptionPlanV3,
  updateSubscriptionPlanV3,
  processBillingCycleV3,
  trackServiceUsageV3
} from "./Mutation/subscription.js";
export {
  SubscriptionV3,
  BillingCycleV3,
  SubscriptionPlanV3,
  UsageTrackingV3,
  SubscriptionFeatureV3
} from "./FieldResolvers/subscription.js";

// Consolidated CustomCalendar domain exports - AINARKLENDAR SYSTEM
export {
  customCalendarViewsV3,
  customCalendarViewV3
} from "./Query/customcalendar.js";
export {
  createCustomCalendarViewV3,
  updateCustomCalendarViewV3,
  deleteCustomCalendarViewV3
} from "./Mutation/customcalendar.js";
export {
  CustomCalendarViewV3,
  CalendarSettingsV3,
  CalendarFilterV3,
  CalendarEventV3
} from "./FieldResolvers/customcalendar.js";

// Consolidated Document domain exports
export const DocumentResolvers = {
  Query: {
    documentsV3,
    documentV3,
    unifiedDocumentsV3,
    unifiedDocumentV3,
  },
  Mutation: {
    createDocumentV3,
    updateDocumentV3,
    deleteDocumentV3,
    uploadUnifiedDocumentV3,
  },
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
    treatments,
    treatment,
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

// Consolidated Billing domain exports
export const BillingResolvers = {
  Query: {
    billingDataV3,
    billingDatumV3,
  },
  Mutation: {
    createBillingDataV3,
    updateBillingDataV3,
    deleteBillingDataV3,
  },
  BillingDataV3,
};

// Consolidated Compliance domain exports
export const ComplianceResolvers = {
  Query: {
    compliancesV3,
    complianceV3,
  },
  Mutation: {
    createComplianceV3,
    updateComplianceV3,
    deleteComplianceV3,
  },
  ComplianceV3,
};

// Consolidated Inventory domain exports - SUBMODULE 2A+2B+2C (COMPLETE)
export const InventoryResolvers = {
  Query: {
    inventoriesV3,
    inventoryV3,
    materialsV3,
    materialV3,
    inventoryDashboardV3,
    inventoryAlertsV3,
    equipmentsV3,
    equipmentV3,
    maintenancesV3,
    maintenanceV3,
    maintenanceHistoryV3,
    suppliersV3,
    supplierV3,
    purchaseOrdersV3,
    purchaseOrderV3,
    supplierPurchaseOrdersV3,
    purchaseOrderItemsV3,
  },
  Mutation: {
    createInventoryV3,
    updateInventoryV3,
    deleteInventoryV3,
    adjustInventoryStockV3,
    createMaterialV3,
    updateMaterialV3,
    deleteMaterialV3,
    reorderMaterialV3,
    acknowledgeInventoryAlertV3,
    createEquipmentV3,
    updateEquipmentV3,
    deleteEquipmentV3,
    scheduleMaintenanceV3,
    completeMaintenanceV3,
    cancelMaintenanceV3,
    createSupplierV3,
    updateSupplierV3,
    deleteSupplierV3,
    createPurchaseOrderV3,
    updatePurchaseOrderV3,
    approvePurchaseOrderV3,
    cancelPurchaseOrderV3,
    receivePurchaseOrderV3,
    addPurchaseOrderItemV3,
    updatePurchaseOrderItemV3,
    removePurchaseOrderItemV3,
  },
  InventoryV3,
  MaterialV3,
  InventoryDashboardV3,
  EquipmentV3,
  MaintenanceV3,
  SupplierV3,
  PurchaseOrderV3,
  PurchaseOrderItemV3,
};

// Consolidated Marketplace domain exports - B2B DENTAL SUPPLY SYSTEM
export const MarketplaceResolvers = {
  Query: {
    marketplaceProductsV3,
    marketplaceProductV3,
    marketplaceSuppliersV3,
    marketplaceSupplierV3,
    marketplacePurchaseOrdersV3,
    marketplacePurchaseOrderV3,
    cartItemsV3,
  },
  Mutation: {
    marketplaceCreatePurchaseOrderV3,
    marketplaceUpdatePurchaseOrderV3,
    marketplaceDeletePurchaseOrderV3,
    addToCartV3,
    updateCartItemV3,
    removeFromCartV3,
    clearCartV3,
    marketplaceCreateSupplierV3,
    marketplaceUpdateSupplierV3,
  },
  MarketplaceProductV3,
  MarketplaceSupplierV3,
  MarketplacePurchaseOrderV3,
  MarketplacePurchaseOrderItemV3,
  CartItemV3,
};

// Consolidated Subscriptions domain exports - NETFLIX-DENTAL SYSTEM
export const SubscriptionResolvers = {
  Query: {
    subscriptionPlansV3,
    subscriptionPlanV3,
    subscriptionsV3,
    subscriptionV3,
    billingCyclesV3,
    usageTrackingV3,
  },
  Mutation: {
    createSubscriptionV3,
    updateSubscriptionV3,
    cancelSubscriptionV3,
    renewSubscriptionV3,
    createSubscriptionPlanV3,
    updateSubscriptionPlanV3,
    processBillingCycleV3,
    trackServiceUsageV3,
  },
  Subscription: subscriptionSubscriptions,
  SubscriptionV3,
  BillingCycleV3,
  SubscriptionPlanV3,
  UsageTrackingV3,
  SubscriptionFeatureV3,
};

// Consolidated CustomCalendar domain exports - AINARKLENDAR SYSTEM
export const CustomCalendarResolvers = {
  Query: {
    customCalendarViewsV3,
    customCalendarViewV3,
  },
  Mutation: {
    createCustomCalendarViewV3,
    updateCustomCalendarViewV3,
    deleteCustomCalendarViewV3,
  },
  Subscription: customCalendarSubscriptions,
  CustomCalendarViewV3,
  CalendarSettingsV3,
  CalendarFilterV3,
  CalendarEventV3,
};

// Consolidated all domain exports
export const AllResolvers = {
  Query: {
    documentsV3,
    documentV3,
    unifiedDocumentsV3,
    unifiedDocumentV3,
    ...patientQueries,
    ...appointmentQueries,
    treatments,
    treatment,
    treatmentsV3,
    treatmentV3,
    treatmentRecommendationsV3,
    medicalRecords,
    medicalRecord,
    medicalRecordsV3,
    medicalRecordV3,
    billingDataV3,
    billingDatumV3,
    compliancesV3,
    complianceV3,
    inventoriesV3,
    inventoryV3,
    materialsV3,
    materialV3,
    inventoryDashboardV3,
    inventoryAlertsV3,
    equipmentsV3,
    equipmentV3,
    maintenancesV3,
    maintenanceV3,
    maintenanceHistoryV3,
    suppliersV3,
    supplierV3,
    purchaseOrdersV3,
    purchaseOrderV3,
    supplierPurchaseOrdersV3,
    purchaseOrderItemsV3,
    // Marketplace V3 - B2B Dental Supply System
    marketplaceProductsV3,
    marketplaceProductV3,
    marketplaceSuppliersV3,
    marketplaceSupplierV3,
    marketplacePurchaseOrdersV3,
    marketplacePurchaseOrderV3,
    cartItemsV3,
    // Subscriptions V3 - Netflix-Dental System
    subscriptionPlansV3,
    subscriptionPlanV3,
    subscriptionsV3,
    subscriptionV3,
    billingCyclesV3,
    usageTrackingV3,
    // CustomCalendar V3 - AinarkLendar System
    customCalendarViewsV3,
    customCalendarViewV3,
  },
  Mutation: {
    createDocumentV3,
    updateDocumentV3,
    deleteDocumentV3,
    uploadUnifiedDocumentV3,
    ...patientMutations,
    ...appointmentMutations,
    createTreatmentV3,
    updateTreatmentV3,
    deleteTreatmentV3,
    generateTreatmentPlanV3,
    createMedicalRecordV3,
    updateMedicalRecordV3,
    deleteMedicalRecordV3,
    createBillingDataV3,
    updateBillingDataV3,
    deleteBillingDataV3,
    createComplianceV3,
    updateComplianceV3,
    deleteComplianceV3,
    createInventoryV3,
    updateInventoryV3,
    deleteInventoryV3,
    adjustInventoryStockV3,
    createMaterialV3,
    updateMaterialV3,
    deleteMaterialV3,
    reorderMaterialV3,
    acknowledgeInventoryAlertV3,
    createEquipmentV3,
    updateEquipmentV3,
    deleteEquipmentV3,
    scheduleMaintenanceV3,
    completeMaintenanceV3,
    cancelMaintenanceV3,
    createSupplierV3,
    updateSupplierV3,
    deleteSupplierV3,
    createPurchaseOrderV3,
    updatePurchaseOrderV3,
    approvePurchaseOrderV3,
    cancelPurchaseOrderV3,
    receivePurchaseOrderV3,
    addPurchaseOrderItemV3,
    updatePurchaseOrderItemV3,
    removePurchaseOrderItemV3,
    // Marketplace V3 - B2B Dental Supply System
    marketplaceCreatePurchaseOrderV3,
    marketplaceUpdatePurchaseOrderV3,
    marketplaceDeletePurchaseOrderV3,
    addToCartV3,
    updateCartItemV3,
    removeFromCartV3,
    clearCartV3,
    marketplaceCreateSupplierV3,
    marketplaceUpdateSupplierV3,
    // Subscriptions V3 - Netflix-Dental System
    createSubscriptionV3,
    updateSubscriptionV3,
    cancelSubscriptionV3,
    renewSubscriptionV3,
    createSubscriptionPlanV3,
    updateSubscriptionPlanV3,
    processBillingCycleV3,
    trackServiceUsageV3,
    // CustomCalendar V3 - AinarkLendar System
    createCustomCalendarViewV3,
    updateCustomCalendarViewV3,
    deleteCustomCalendarViewV3,
  },
  Subscription: {
    ...documentSubscriptions,
    ...patientSubscriptions,
    ...appointmentSubscriptions,
    ...medicalRecordSubscriptions,
    ...quantumSubscriptionResolvers, // ⚛️ PHASE E: Add quantum subscription resolvers
    treatmentV3Created,
    treatmentV3Updated,
    ...subscriptionSubscriptions,
    ...customCalendarSubscriptions,
  },
  DocumentV3,
  PatientV3,
  AppointmentV3,
  TreatmentV3,
  MedicalRecordV3,
  BillingDataV3,
  ComplianceV3,
  InventoryV3,
  MaterialV3,
  InventoryDashboardV3,
  EquipmentV3,
  MaintenanceV3,
  SupplierV3,
  PurchaseOrderV3,
  PurchaseOrderItemV3,
  // Marketplace V3 - B2B Dental Supply System
  MarketplaceProductV3,
  MarketplaceSupplierV3,
  MarketplacePurchaseOrderV3,
  MarketplacePurchaseOrderItemV3,
  CartItemV3,
  // Subscriptions V3 - Netflix-Dental System
  SubscriptionV3,
  BillingCycleV3,
  SubscriptionPlanV3,
  UsageTrackingV3,
  SubscriptionFeatureV3,
};

export default AllResolvers;


