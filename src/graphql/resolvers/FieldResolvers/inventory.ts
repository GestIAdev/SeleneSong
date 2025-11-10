import { GraphQLContext } from "../../types.js";

/**
 * 🔥 PHASE 1: INVENTORY FIELD RESOLVERS RECONSTRUCTION
 * Direct 1:1 mapping from PostgreSQL columns to GraphQL fields
 * Based on BATTLE_REPORT_VERITAS_APOCALYPSE.md DATABASE RECONSTRUCTION BLUEPRINT
 *
 * STRATEGY: Minimal field resolver logic, delegate to InventoryDatabase methods
 * STATUS: ACTIVE - All 8 types reconstructed with full field mappings
 */

// ========================================
// 1️⃣ InventoryV3 - Main stock table
// ========================================
export const InventoryV3 = {
  // Direct field mappings (1:1 from inventory table)
  id: async (parent: any) => parent.id,
  itemName: async (parent: any) => parent.item_name || parent.itemName,
  itemCode: async (parent: any) => parent.item_code || parent.itemCode,
  supplierId: async (parent: any) => parent.supplier_id || parent.supplierId,
  category: async (parent: any) => parent.category,
  quantity: async (parent: any) => parent.quantity,
  unitPrice: async (parent: any) => parent.unit_price || parent.unitPrice,
  description: async (parent: any) => parent.description,
  isActive: async (parent: any) => parent.is_active !== false,
  createdAt: async (parent: any) => parent.created_at || parent.createdAt,
  updatedAt: async (parent: any) => parent.updated_at || parent.updatedAt,
};

// ========================================
// 2️⃣ MaterialV3 - Dental materials from suppliers
// ========================================
export const MaterialV3 = {
  // Direct field mappings (1:1 from dental_materials table)
  id: async (parent: any) => parent.id,
  name: async (parent: any) => parent.name,
  description: async (parent: any) => parent.description,
  category: async (parent: any) => parent.category,
  unitCost: async (parent: any) => parent.unit_cost || parent.unitCost,
  unit: async (parent: any) => parent.unit,
  quantityInStock: async (parent: any) => parent.quantity_in_stock || parent.quantityInStock,
  reorderPoint: async (parent: any) => parent.reorder_point || parent.reorderPoint,
  supplierId: async (parent: any) => parent.supplier_id || parent.supplierId,
  createdAt: async (parent: any) => parent.created_at || parent.createdAt,
  updatedAt: async (parent: any) => parent.updated_at || parent.updatedAt,

  // Nested resolver - fetch supplier data
  supplier: async (parent: any, _: any, ctx: GraphQLContext) => {
    if (!parent.supplier_id && !parent.supplierId) return null;
    const supplierId = parent.supplier_id || parent.supplierId;
    return ctx.database.inventory.getSupplierById(supplierId);
  },

  // Nested resolver - fetch supplier list
  suppliers: async (parent: any, _: any, ctx: GraphQLContext) => {
    return ctx.database.inventory.getMaterialSuppliersV3(parent.id);
  },
};

// ========================================
// 3️⃣ EquipmentV3 - Dental equipment/machinery
// ========================================
export const EquipmentV3 = {
  // Direct field mappings (1:1 from dental_equipment table)
  id: async (parent: any) => parent.id,
  name: async (parent: any) => parent.name,
  model: async (parent: any) => parent.model,
  serialNumber: async (parent: any) => parent.serial_number || parent.serialNumber,
  manufacturer: async (parent: any) => parent.manufacturer,
  equipmentType: async (parent: any) => parent.equipment_type || parent.equipmentType,
  roomId: async (parent: any) => parent.room_id || parent.roomId,
  status: async (parent: any) => parent.status,
  purchaseDate: async (parent: any) => parent.purchase_date || parent.purchaseDate,
  warrantyExpiry: async (parent: any) => parent.warranty_expiry || parent.warrantyExpiry,
  lastMaintenance: async (parent: any) => parent.last_maintenance || parent.lastMaintenance,
  nextMaintenanceDue: async (parent: any) => parent.next_maintenance_due || parent.nextMaintenanceDue,
  purchaseCost: async (parent: any) => parent.purchase_cost || parent.purchaseCost,
  currentValue: async (parent: any) => parent.current_value || parent.currentValue,
  depreciationRate: async (parent: any) => parent.depreciation_rate || parent.depreciationRate,
  powerRequirements: async (parent: any) => parent.power_requirements || parent.powerRequirements,
  maintenanceIntervalDays: async (parent: any) =>
    parent.maintenance_interval_days || parent.maintenanceIntervalDays,
  operatingHours: async (parent: any) => parent.operating_hours || parent.operatingHours,
  isActive: async (parent: any) => parent.is_active !== false,
  notes: async (parent: any) => parent.notes,
  createdAt: async (parent: any) => parent.created_at || parent.createdAt,
  updatedAt: async (parent: any) => parent.updated_at || parent.updatedAt,
};

// ========================================
// 4️⃣ MaintenanceV3 - Equipment maintenance records
// ========================================
export const MaintenanceV3 = {
  // Direct field mappings (1:1 from equipment_maintenance table)
  id: async (parent: any) => parent.id,
  equipmentId: async (parent: any) => parent.equipment_id || parent.equipmentId,
  maintenanceType: async (parent: any) => parent.maintenance_type || parent.maintenanceType,
  description: async (parent: any) => parent.description,
  performedBy: async (parent: any) => parent.performed_by || parent.performedBy,
  cost: async (parent: any) => parent.cost,
  scheduledDate: async (parent: any) => parent.scheduled_date || parent.scheduledDate,
  completedDate: async (parent: any) => parent.completed_date || parent.completedDate,
  nextMaintenanceDate: async (parent: any) =>
    parent.next_maintenance_date || parent.nextMaintenanceDate,
  status: async (parent: any) => parent.status,
  findings: async (parent: any) => parent.findings,
  recommendations: async (parent: any) => parent.recommendations,
  createdAt: async (parent: any) => parent.created_at || parent.createdAt,
  updatedAt: async (parent: any) => parent.updated_at || parent.updatedAt,

  // Nested resolver - fetch equipment data
  equipment: async (parent: any, _: any, ctx: GraphQLContext) => {
    if (!parent.equipment_id && !parent.equipmentId) return null;
    const equipmentId = parent.equipment_id || parent.equipmentId;
    return ctx.database.inventory.getEquipmentV3ById(equipmentId);
  },
};

// ========================================
// 5️⃣ SupplierV3 - Medical supply vendors
// ========================================
export const SupplierV3 = {
  // Direct field mappings (1:1 from suppliers table)
  id: async (parent: any) => parent.id,
  name: async (parent: any) => parent.name,
  contactPerson: async (parent: any) => parent.contact_person || parent.contactPerson,
  email: async (parent: any) => parent.email,
  phone: async (parent: any) => parent.phone,
  address: async (parent: any) => parent.address,
  paymentTerms: async (parent: any) => parent.payment_terms || parent.paymentTerms,
  deliveryTimeDays: async (parent: any) => parent.delivery_time_days || parent.deliveryTimeDays,
  minimumOrderValue: async (parent: any) =>
    parent.minimum_order_value || parent.minimumOrderValue,
  rating: async (parent: any) => parent.rating,
  isActive: async (parent: any) => parent.is_active !== false,
  notes: async (parent: any) => parent.notes,
  createdAt: async (parent: any) => parent.created_at || parent.createdAt,
  updatedAt: async (parent: any) => parent.updated_at || parent.updatedAt,

  // Nested resolver - fetch supplier's materials
  materials: async (parent: any, _: any, ctx: GraphQLContext) => {
    return ctx.database.inventory.getSupplierMaterials(parent.id);
  },

  // Nested resolver - fetch supplier's purchase orders
  purchaseOrders: async (parent: any, _: any, ctx: GraphQLContext) => {
    return ctx.database.inventory.getSupplierPurchaseOrders({ supplierId: parent.id });
  },
};

// ========================================
// 6️⃣ PurchaseOrderV3 - Supplier orders
// ========================================
export const PurchaseOrderV3 = {
  // Direct field mappings (1:1 from purchase_orders table)
  id: async (parent: any) => parent.id,
  orderNumber: async (parent: any) => parent.order_number || parent.orderNumber,
  supplierId: async (parent: any) => parent.supplier_id || parent.supplierId,
  orderDate: async (parent: any) => parent.order_date || parent.orderDate,
  expectedDeliveryDate: async (parent: any) =>
    parent.expected_delivery_date || parent.expectedDeliveryDate,
  actualDeliveryDate: async (parent: any) =>
    parent.actual_delivery_date || parent.actualDeliveryDate,
  status: async (parent: any) => parent.status,
  totalAmount: async (parent: any) => parent.total_amount || parent.totalAmount,
  taxAmount: async (parent: any) => parent.tax_amount || parent.taxAmount,
  discountAmount: async (parent: any) => parent.discount_amount || parent.discountAmount,
  notes: async (parent: any) => parent.notes,
  approvedBy: async (parent: any) => parent.approved_by || parent.approvedBy,
  receivedBy: async (parent: any) => parent.received_by || parent.receivedBy,
  createdAt: async (parent: any) => parent.created_at || parent.createdAt,
  updatedAt: async (parent: any) => parent.updated_at || parent.updatedAt,

  // Nested resolver - fetch supplier data
  supplier: async (parent: any, _: any, ctx: GraphQLContext) => {
    if (!parent.supplier_id && !parent.supplierId) return null;
    const supplierId = parent.supplier_id || parent.supplierId;
    return ctx.database.inventory.getSupplierById(supplierId);
  },

  // Nested resolver - fetch purchase order items
  items: async (parent: any, _: any, ctx: GraphQLContext) => {
    return ctx.database.inventory.getPurchaseOrderItems(parent.id);
  },
};

// ========================================
// 7️⃣ PurchaseOrderItemV3 - Individual items in PO
// ========================================
export const PurchaseOrderItemV3 = {
  // Direct field mappings (1:1 from purchase_order_items table)
  id: async (parent: any) => parent.id,
  purchaseOrderId: async (parent: any) => parent.purchase_order_id || parent.purchaseOrderId,
  productId: async (parent: any) => parent.product_id || parent.productId,
  quantity: async (parent: any) => parent.quantity,
  unitPrice: async (parent: any) => parent.unit_price || parent.unitPrice,
  totalPrice: async (parent: any) => parent.total_price || parent.totalPrice,
  deliveredQuantity: async (parent: any) => parent.delivered_quantity || parent.deliveredQuantity,
  notes: async (parent: any) => parent.notes,

  // Nested resolver - fetch material/product data
  product: async (parent: any, _: any, ctx: GraphQLContext) => {
    if (!parent.product_id && !parent.productId) return null;
    const productId = parent.product_id || parent.productId;
    return ctx.database.inventory.getMaterialV3ById(productId);
  },
};

// ========================================
// 8️⃣ InventoryDashboardV3 - Summary statistics
// ========================================
export const InventoryDashboardV3 = {
  // Direct field mappings (1:1 from inventory_dashboard table)
  totalMaterials: async (parent: any) => parent.total_materials || parent.totalMaterials,
  totalEquipment: async (parent: any) => parent.total_equipment || parent.totalEquipment,
  lowStockMaterials: async (parent: any) =>
    parent.low_stock_materials || parent.lowStockMaterials,
  expiredMaterials: async (parent: any) => parent.expired_materials || parent.expiredMaterials,
  maintenanceDueEquipment: async (parent: any) =>
    parent.maintenance_due_equipment || parent.maintenanceDueEquipment,
  totalInventoryValue: async (parent: any) =>
    parent.total_inventory_value || parent.totalInventoryValue,

  // Nested resolvers - fetch related data
  recentPurchaseOrders: async (parent: any, _: any, ctx: GraphQLContext) => {
    return ctx.database.inventory.getPurchaseOrdersV3({ limit: 10 });
  },

  topSuppliers: async (parent: any, _: any, ctx: GraphQLContext) => {
    return ctx.database.inventory.getSuppliersV3({ limit: 5 });
  },
};