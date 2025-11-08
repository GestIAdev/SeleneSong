import { BaseDatabase } from './BaseDatabase.js';

export class InventoryDatabase extends BaseDatabase {
  // ============================================================================
  // INVENTORY V3 METHODS
  // ============================================================================

  async getInventoriesV3(args: {
    limit?: number;
    offset?: number;
    category?: string;
  }): Promise<any[]> {
    const { limit = 50, offset = 0, category } = args;

    let query = `
      SELECT
        id, name, category, current_stock, minimum_stock,
        unit, location, supplier_id, last_restocked, expiry_date,
        created_at, updated_at
      FROM inventory
    `;

    const params: any[] = [];

    if (category) {
      query += ` WHERE category = $1`;
      params.push(category);
      query += ` LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }

    query += ` ORDER BY name ASC`;

    return this.getAll(query, params);
  }

  async getInventoryV3ById(id: string): Promise<any> {
    const query = `SELECT * FROM inventory WHERE id = $1`;
    return this.getOne(query, [id]);
  }

  async createInventoryV3(input: any): Promise<any> {
    const {
      name,
      category,
      currentStock,
      minimumStock,
      unit,
      location,
      supplierId,
      expiryDate
    } = input;

    const query = `
      INSERT INTO inventory (
        name, category, current_stock, minimum_stock,
        unit, location, supplier_id, expiry_date, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const result = await this.runQuery(query, [
      name, category, currentStock, minimumStock, unit, location, supplierId, expiryDate
    ]);

    return result.rows[0];
  }

  async updateInventoryV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(input.category);
    }
    if (input.currentStock !== undefined) {
      updates.push(`current_stock = $${paramIndex++}`);
      values.push(input.currentStock);
    }
    if (input.minimumStock !== undefined) {
      updates.push(`minimum_stock = $${paramIndex++}`);
      values.push(input.minimumStock);
    }
    if (input.unit !== undefined) {
      updates.push(`unit = $${paramIndex++}`);
      values.push(input.unit);
    }
    if (input.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(input.location);
    }
    if (input.supplierId !== undefined) {
      updates.push(`supplier_id = $${paramIndex++}`);
      values.push(input.supplierId);
    }
    if (input.expiryDate !== undefined) {
      updates.push(`expiry_date = $${paramIndex++}`);
      values.push(input.expiryDate);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE inventory
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.runQuery(query, values);
    return result.rows[0];
  }

  async deleteInventoryV3(id: string): Promise<void> {
    const query = `DELETE FROM inventory WHERE id = $1`;
    await this.runQuery(query, [id]);
  }

  async adjustInventoryStockV3(id: string, adjustment: number, reason: string): Promise<any> {
    // First get current stock
    const current = await this.getOne(
      `SELECT current_stock FROM inventory WHERE id = $1`,
      [id]
    );

    if (!current) {
      throw new Error(`Inventory item not found: ${id}`);
    }

    const newStock = current.current_stock + adjustment;

    // Update stock and record adjustment
    await this.runQuery(
      `UPDATE inventory SET current_stock = $1, last_restocked = NOW(), updated_at = NOW() WHERE id = $2`,
      [newStock, id]
    );

    // Record the adjustment (assuming there's an inventory_adjustments table)
    await this.runQuery(
      `INSERT INTO inventory_adjustments (inventory_id, adjustment, reason, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [id, adjustment, reason]
    );

    // Return updated inventory item
    return this.getInventoryV3ById(id);
  }

  // ============================================================================
  // MATERIALS V3 METHODS
  // ============================================================================

  async getMaterialsV3(args: {
    limit?: number;
    offset?: number;
    category?: string;
    supplierId?: string;
  }): Promise<any[]> {
    const { limit = 50, offset = 0, category, supplierId } = args;

    let query = `
      SELECT
        m.id, m.name, m.description, m.category, m.unit_cost,
        m.unit, m.reorder_point, m.created_at, m.updated_at
      FROM materials m
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (category) {
      conditions.push(`m.category = $${params.length + 1}`);
      params.push(category);
    }

    if (supplierId) {
      query += `
        LEFT JOIN material_suppliers ms ON m.id = ms.material_id
      `;
      conditions.push(`ms.supplier_id = $${params.length + 1}`);
      params.push(supplierId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY m.id`;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    query += ` ORDER BY m.name ASC`;

    return this.getAll(query, params);
  }

  async getMaterialV3ById(id: string): Promise<any> {
    const query = `SELECT * FROM materials WHERE id = $1`;
    return this.getOne(query, [id]);
  }

  async createMaterialV3(input: any): Promise<any> {
    const {
      name,
      description,
      category,
      unitCost,
      unit,
      reorderPoint
    } = input;

    const query = `
      INSERT INTO materials (
        name, description, category, unit_cost,
        unit, reorder_point, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *
    `;

    const result = await this.runQuery(query, [
      name, description, category, unitCost, unit, reorderPoint
    ]);

    return result.rows[0];
  }

  async updateMaterialV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if (input.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(input.category);
    }
    if (input.unitCost !== undefined) {
      updates.push(`unit_cost = $${paramIndex++}`);
      values.push(input.unitCost);
    }
    if (input.unit !== undefined) {
      updates.push(`unit = $${paramIndex++}`);
      values.push(input.unit);
    }
    if (input.reorderPoint !== undefined) {
      updates.push(`reorder_point = $${paramIndex++}`);
      values.push(input.reorderPoint);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE materials
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.runQuery(query, values);
    return result.rows[0];
  }

  async deleteMaterialV3(id: string): Promise<void> {
    const query = `DELETE FROM materials WHERE id = $1`;
    await this.runQuery(query, [id]);
  }

  async reorderMaterialV3(materialId: string, quantity: number, supplierId?: string): Promise<any> {
    const query = `
      INSERT INTO material_reorders (
        material_id, supplier_id, quantity, status, created_at
      ) VALUES ($1, $2, $3, 'PENDING', NOW())
      RETURNING *
    `;

    const result = await this.runQuery(query, [materialId, supplierId, quantity]);
    return result.rows[0];
  }

  // ============================================================================
  // DASHBOARD & ALERTS METHODS
  // ============================================================================

  async getInventoryDashboardV3(): Promise<any> {
    // Get comprehensive dashboard metrics
    const query = `
      SELECT
        COUNT(*) as total_items,
        COUNT(CASE WHEN current_stock <= minimum_stock THEN 1 END) as low_stock_items,
        COUNT(CASE WHEN current_stock = 0 THEN 1 END) as out_of_stock_items,
        COUNT(CASE WHEN expiry_date <= NOW() + INTERVAL '30 days' THEN 1 END) as expiring_soon_items,
        COALESCE(SUM(current_stock * unit_cost), 0) as total_value
      FROM inventory i
      LEFT JOIN materials m ON i.material_id = m.id
    `;

    const result = await this.runQuery(query);
    return result.rows[0];
  }

  async getInventoryAlertsV3(args: { limit?: number }): Promise<any[]> {
    const { limit = 20 } = args;

    const query = `
      SELECT
        'low_stock' as alert_type,
        id as inventory_id,
        name as item_name,
        current_stock,
        minimum_stock,
        'Low stock alert' as message,
        created_at as alert_date
      FROM inventory
      WHERE current_stock <= minimum_stock

      UNION ALL

      SELECT
        'out_of_stock' as alert_type,
        id as inventory_id,
        name as item_name,
        current_stock,
        minimum_stock,
        'Out of stock alert' as message,
        created_at as alert_date
      FROM inventory
      WHERE current_stock = 0

      UNION ALL

      SELECT
        'expiring_soon' as alert_type,
        id as inventory_id,
        name as item_name,
        current_stock,
        minimum_stock,
        'Expiring soon alert' as message,
        expiry_date as alert_date
      FROM inventory
      WHERE expiry_date <= NOW() + INTERVAL '30 days'

      ORDER BY alert_date DESC
      LIMIT $1
    `;

    return this.getAll(query, [limit]);
  }

  async acknowledgeInventoryAlertV3(alertId: string): Promise<void> {
    // This would typically update an alerts table
    // For now, we'll just log the acknowledgment
    console.log(`Alert ${alertId} acknowledged`);
  }

  // ============================================================================
  // EQUIPMENT V3 METHODS
  // ============================================================================

  async getEquipmentsV3(args: {
    limit?: number;
    offset?: number;
    category?: string;
    status?: string;
  }): Promise<any[]> {
    const { limit = 50, offset = 0, category, status } = args;

    let query = `
      SELECT
        id, name, model, serial_number, category, status,
        purchase_date, warranty_expiry, location, created_at, updated_at
      FROM equipment
    `;

    const params: any[] = [];

    if (category || status) {
      query += ` WHERE`;
      const conditions: string[] = [];

      if (category) {
        conditions.push(` category = $${params.length + 1}`);
        params.push(category);
      }
      if (status) {
        conditions.push(` status = $${params.length + 1}`);
        params.push(status);
      }

      query += conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    return this.getAll(query, params);
  }

  async getEquipmentV3ById(id: string): Promise<any> {
    const query = `SELECT * FROM equipment WHERE id = $1`;
    return this.getOne(query, [id]);
  }

  async createEquipmentV3(input: any): Promise<any> {
    const {
      name,
      model,
      serialNumber,
      category,
      status,
      purchaseDate,
      warrantyExpiry,
      location
    } = input;

    const query = `
      INSERT INTO equipment (
        name, model, serial_number, category, status,
        purchase_date, warranty_expiry, location, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const result = await this.runQuery(query, [
      name, model, serialNumber, category, status || 'ACTIVE', purchaseDate, warrantyExpiry, location
    ]);

    return result.rows[0];
  }

  async updateEquipmentV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.model !== undefined) {
      updates.push(`model = $${paramIndex++}`);
      values.push(input.model);
    }
    if (input.serialNumber !== undefined) {
      updates.push(`serial_number = $${paramIndex++}`);
      values.push(input.serialNumber);
    }
    if (input.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(input.category);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.purchaseDate !== undefined) {
      updates.push(`purchase_date = $${paramIndex++}`);
      values.push(input.purchaseDate);
    }
    if (input.warrantyExpiry !== undefined) {
      updates.push(`warranty_expiry = $${paramIndex++}`);
      values.push(input.warrantyExpiry);
    }
    if (input.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(input.location);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE equipment
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.runQuery(query, values);
    return result.rows[0];
  }

  async deleteEquipmentV3(id: string): Promise<void> {
    const query = `DELETE FROM equipment WHERE id = $1`;
    await this.runQuery(query, [id]);
  }

  // ============================================================================
  // MAINTENANCE V3 METHODS
  // ============================================================================

  async getMaintenancesV3(args: {
    equipmentId?: string;
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<any[]> {
    const { equipmentId, limit = 50, offset = 0, status } = args;

    let query = `
      SELECT
        id, equipment_id, maintenance_type, description,
        scheduled_date, completed_date, status, priority,
        cost, technician_id, completion_notes, created_at, updated_at
      FROM maintenance
    `;

    const params: any[] = [];

    if (equipmentId || status) {
      query += ` WHERE`;
      const conditions: string[] = [];

      if (equipmentId) {
        conditions.push(` equipment_id = $${params.length + 1}`);
        params.push(equipmentId);
      }
      if (status) {
        conditions.push(` status = $${params.length + 1}`);
        params.push(status);
      }

      query += conditions.join(' AND ');
    }

    query += ` ORDER BY scheduled_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    return this.getAll(query, params);
  }

  async getMaintenanceV3ById(id: string): Promise<any> {
    const query = `SELECT * FROM maintenance WHERE id = $1`;
    return this.getOne(query, [id]);
  }

  async createMaintenanceV3(input: any): Promise<any> {
    const {
      equipmentId,
      maintenanceType,
      description,
      scheduledDate,
      status,
      priority,
      cost,
      technicianId
    } = input;

    const query = `
      INSERT INTO maintenance (
        equipment_id, maintenance_type, description, scheduled_date,
        status, priority, cost, technician_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *
    `;

    const result = await this.runQuery(query, [
      equipmentId, maintenanceType, description, scheduledDate, status || 'SCHEDULED', priority || 'MEDIUM', cost || 0, technicianId
    ]);

    return result.rows[0];
  }

  async updateMaintenanceV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.maintenanceType !== undefined) {
      updates.push(`maintenance_type = $${paramIndex++}`);
      values.push(input.maintenanceType);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if (input.scheduledDate !== undefined) {
      updates.push(`scheduled_date = $${paramIndex++}`);
      values.push(input.scheduledDate);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(input.priority);
    }
    if (input.cost !== undefined) {
      updates.push(`cost = $${paramIndex++}`);
      values.push(input.cost);
    }
    if (input.technicianId !== undefined) {
      updates.push(`technician_id = $${paramIndex++}`);
      values.push(input.technicianId);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE maintenance
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.runQuery(query, values);
    return result.rows[0];
  }

  async completeMaintenanceV3(id: string, completionNotes?: string): Promise<any> {
    const query = `
      UPDATE maintenance
       SET status = 'COMPLETED', completed_date = NOW(), completion_notes = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *
    `;

    const result = await this.runQuery(query, [completionNotes, id]);
    return result.rows[0];
  }

  async scheduleMaintenanceV3(equipmentId: string, scheduledDate: string, maintenanceType: string, description?: string): Promise<any> {
    const query = `
      INSERT INTO maintenance (
        equipment_id, maintenance_type, description, scheduled_date,
        status, priority, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, 'SCHEDULED', 'MEDIUM', NOW(), NOW())
      RETURNING *
    `;

    const result = await this.runQuery(query, [equipmentId, maintenanceType, description, scheduledDate]);
    return result.rows[0];
  }

  async cancelMaintenanceV3(id: string, reason?: string): Promise<void> {
    const query = `
      UPDATE maintenance
       SET status = 'CANCELLED', completion_notes = $1, updated_at = NOW()
       WHERE id = $2
    `;

    await this.runQuery(query, [reason, id]);
  }

  // ============================================================================
  // EQUIPMENT MAINTENANCE HELPER METHODS
  // ============================================================================

  async getEquipmentMaintenanceScheduleV3(equipmentId: string): Promise<any[]> {
    const query = `
      SELECT
        id, maintenance_type, description, scheduled_date, status, priority
       FROM maintenance
       WHERE equipment_id = $1 AND status IN ('SCHEDULED', 'PENDING')
       ORDER BY scheduled_date ASC
    `;

    return this.getAll(query, [equipmentId]);
  }

  async getMaintenanceHistoryV3(args: { equipmentId: string; limit?: number }): Promise<any[]> {
    const { equipmentId, limit = 20 } = args;

    const query = `
      SELECT
        id, maintenance_type, description, scheduled_date, completed_date,
        status, cost, technician_id, completion_notes
       FROM maintenance
       WHERE equipment_id = $1 AND status = 'COMPLETED'
       ORDER BY completed_date DESC
       LIMIT $2
    `;

    return this.getAll(query, [equipmentId, limit]);
  }

  async getEquipmentCurrentStatusV3(equipmentId: string): Promise<any> {
    // Get the most recent maintenance record for status
    const query = `
      SELECT status, completed_date
       FROM maintenance
       WHERE equipment_id = $1
       ORDER BY completed_date DESC
       LIMIT 1
    `;

    const result = await this.getAll(query, [equipmentId]);

    if (result.length === 0) {
      return { status: 'UNKNOWN', lastUpdated: new Date().toISOString() };
    }

    return {
      status: result[0].status,
      lastUpdated: result[0].completed_date || new Date().toISOString()
    };
  }

  async getEquipmentNextMaintenanceDueV3(equipmentId: string): Promise<string | null> {
    const query = `
      SELECT scheduled_date
       FROM maintenance
       WHERE equipment_id = $1 AND status IN ('SCHEDULED', 'PENDING')
       ORDER BY scheduled_date ASC
       LIMIT 1
    `;

    const result = await this.getAll(query, [equipmentId]);
    return result.length > 0 ? result[0].scheduled_date : null;
  }

  // ============================================================================
  // HELPER METHODS FOR FIELD RESOLVERS
  // ============================================================================

  async getSupplierById(id: string): Promise<any> {
    const query = `SELECT * FROM suppliers WHERE id = $1`;
    return this.getOne(query, [id]);
  }

  async getMaterialSuppliersV3(materialId: string): Promise<any[]> {
    const query = `
      SELECT s.*
      FROM suppliers s
      JOIN material_suppliers ms ON s.id = ms.supplier_id
      WHERE ms.material_id = $1
    `;

    return this.getAll(query, [materialId]);
  }

  async getMaterialStockLevelsV3(materialId: string): Promise<any[]> {
    const query = `
      SELECT
        i.id,
        i.name,
        i.current_stock,
        i.minimum_stock,
        i.location,
        i.expiry_date
      FROM inventory i
      WHERE i.material_id = $1
    `;

    return this.getAll(query, [materialId]);
  }

  async getUserById(id: string): Promise<any> {
    const query = `SELECT * FROM users WHERE id = $1`;
    return this.getOne(query, [id]);
  }

  // ============================================================================
  // SUPPLIERS BASE METHODS
  // ============================================================================

  async getSuppliers(args: { limit?: number; offset?: number; category?: string; status?: string; }): Promise<any[]> {
    const { limit = 50, offset = 0, category, status } = args;

    let query = `SELECT * FROM suppliers`;
    const params: any[] = [];

    if (category || status) {
      query += ` WHERE`;
      const conditions: string[] = [];
      if (category) {
        conditions.push(` category = $${params.length + 1}`);
        params.push(category);
      }
      if (status) {
        conditions.push(` status = $${params.length + 1}`);
        params.push(status);
      }
      query += conditions.join(' AND ');
    }

    query += ` ORDER BY name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    return this.getAll(query, params);
  }

  async createSupplier(input: any): Promise<any> {
    const { name, contactInfo, category, status = 'ACTIVE' } = input;

    const query = `
      INSERT INTO suppliers (name, contact_info, category, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;

    const result = await this.runQuery(query, [name, contactInfo, category, status]);
    return result.rows[0];
  }

  async updateSupplier(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.contactInfo !== undefined) {
      updates.push(`contact_info = $${paramIndex++}`);
      values.push(input.contactInfo);
    }
    if (input.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(input.category);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }

    if (updates.length === 0) return null;

    const query = `
      UPDATE suppliers
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);
    const result = await this.runQuery(query, values);
    return result.rows[0] || null;
  }

  async deleteSupplier(id: string): Promise<void> {
    const query = `DELETE FROM suppliers WHERE id = $1`;
    await this.runQuery(query, [id]);
  }

  // ============================================================================
  // PURCHASE ORDERS BASE METHODS
  // ============================================================================

  async getPurchaseOrders(args: { supplierId?: string; limit?: number; offset?: number; status?: string; }): Promise<any[]> {
    const { supplierId, limit = 50, offset = 0, status } = args;

    let query = `SELECT * FROM purchase_orders`;
    const params: any[] = [];

    if (supplierId || status) {
      query += ` WHERE`;
      const conditions: string[] = [];
      if (supplierId) {
        conditions.push(` supplier_id = $${params.length + 1}`);
        params.push(supplierId);
      }
      if (status) {
        conditions.push(` status = $${params.length + 1}`);
        params.push(status);
      }
      query += conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    return this.getAll(query, params);
  }

  async getPurchaseOrderById(id: string): Promise<any> {
    const query = `SELECT * FROM purchase_orders WHERE id = $1`;
    return this.getOne(query, [id]);
  }

  async createPurchaseOrder(input: any): Promise<any> {
    const { supplierId, items, notes } = input;

    const query = `
      INSERT INTO purchase_orders (supplier_id, status, total_amount, notes, created_at, updated_at)
      VALUES ($1, 'PENDING', 0, $2, NOW(), NOW())
      RETURNING *
    `;

    const result = await this.runQuery(query, [supplierId, notes]);
    const purchaseOrder = result.rows[0];

    // Add items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        await this.addPurchaseOrderItem(purchaseOrder.id, item);
      }
      await this.updatePurchaseOrderTotal(purchaseOrder.id);
    }

    return purchaseOrder;
  }

  async updatePurchaseOrder(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(input.notes);
    }

    if (updates.length === 0) return null;

    const query = `
      UPDATE purchase_orders
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);
    const result = await this.runQuery(query, values);
    return result.rows[0] || null;
  }

  async approvePurchaseOrder(id: string, approverId: string): Promise<any> {
    const query = `
      UPDATE purchase_orders
      SET status = 'APPROVED', approved_by = $1, approved_at = NOW(), updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await this.runQuery(query, [approverId, id]);
    return result.rows[0] || null;
  }

  async cancelPurchaseOrder(id: string, reason?: string): Promise<any> {
    const query = `
      UPDATE purchase_orders
      SET status = 'CANCELLED', cancellation_reason = $1, cancelled_at = NOW(), updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;

    const result = await this.runQuery(query, [reason, id]);
    return result.rows[0] || null;
  }

  async receivePurchaseOrder(id: string, receivedItems: any[]): Promise<any> {
    // Update purchase order status
    const updateQuery = `
      UPDATE purchase_orders
      SET status = 'RECEIVED', received_at = NOW(), updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.runQuery(updateQuery, [id]);
    const purchaseOrder = result.rows[0];

    // Update inventory for received items
    for (const item of receivedItems) {
      const { itemId, quantityReceived } = item;

      // Update inventory stock
      const inventoryQuery = `
        UPDATE inventory
        SET current_stock = current_stock + $1, last_restocked = NOW(), updated_at = NOW()
        WHERE id = $2
      `;

      await this.runQuery(inventoryQuery, [quantityReceived, itemId]);

      // Update purchase order item
      const itemQuery = `
        UPDATE purchase_order_items
        SET quantity_received = $1, received_at = NOW()
        WHERE id = $2
      `;

      await this.runQuery(itemQuery, [quantityReceived, item.itemId]);
    }

    return purchaseOrder;
  }

  async deletePurchaseOrder(id: string): Promise<void> {
    // Delete items first
    const deleteItemsQuery = `DELETE FROM purchase_order_items WHERE purchase_order_id = $1`;
    await this.runQuery(deleteItemsQuery, [id]);

    // Delete purchase order
    const deleteOrderQuery = `DELETE FROM purchase_orders WHERE id = $1`;
    await this.runQuery(deleteOrderQuery, [id]);
  }

  // ============================================================================
  // PURCHASE ORDER ITEMS BASE METHODS
  // ============================================================================

  async getPurchaseOrderItems(purchaseOrderId: string): Promise<any[]> {
    const query = `
      SELECT poi.*, i.name as material_name, i.unit
      FROM purchase_order_items poi
      JOIN inventory i ON poi.material_id = i.id
      WHERE poi.purchase_order_id = $1
      ORDER BY poi.created_at ASC
    `;

    return this.getAll(query, [purchaseOrderId]);
  }

  async addPurchaseOrderItem(purchaseOrderId: string, input: any): Promise<any> {
    const { materialId, quantity, unitPrice } = input;

    const query = `
      INSERT INTO purchase_order_items (purchase_order_id, material_id, quantity, unit_price, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;

    const result = await this.runQuery(query, [purchaseOrderId, materialId, quantity, unitPrice]);
    await this.updatePurchaseOrderTotal(purchaseOrderId);
    return result.rows[0];
  }

  async updatePurchaseOrderItem(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.quantity !== undefined) {
      updates.push(`quantity = $${paramIndex++}`);
      values.push(input.quantity);
    }
    if (input.unitPrice !== undefined) {
      updates.push(`unit_price = $${paramIndex++}`);
      values.push(input.unitPrice);
    }

    if (updates.length === 0) return null;

    const query = `
      UPDATE purchase_order_items
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    values.push(id);
    const result = await this.runQuery(query, values);

    // Update purchase order total
    const item = result.rows[0];
    if (item) {
      await this.updatePurchaseOrderTotal(item.purchase_order_id);
    }

    return item || null;
  }

  async removePurchaseOrderItem(id: string): Promise<void> {
    // Get purchase order id before deleting
    const getQuery = `SELECT purchase_order_id FROM purchase_order_items WHERE id = $1`;
    const item = await this.getOne(getQuery, [id]);

    if (item) {
      const deleteQuery = `DELETE FROM purchase_order_items WHERE id = $1`;
      await this.runQuery(deleteQuery, [id]);
      await this.updatePurchaseOrderTotal(item.purchase_order_id);
    }
  }

  async updatePurchaseOrderTotal(purchaseOrderId: string): Promise<void> {
    const query = `
      UPDATE purchase_orders
      SET total_amount = (
        SELECT COALESCE(SUM(quantity * unit_price), 0)
        FROM purchase_order_items
        WHERE purchase_order_id = $1
      ), updated_at = NOW()
      WHERE id = $1
    `;

    await this.runQuery(query, [purchaseOrderId]);
  }

  // ============================================================================
  // SUPPLIER HELPER METHODS
  // ============================================================================

  async getSupplierPurchaseOrders(args: { supplierId: string; limit?: number; }): Promise<any[]> {
    const { supplierId, limit = 10 } = args;

    const query = `
      SELECT * FROM purchase_orders
      WHERE supplier_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    return this.getAll(query, [supplierId, limit]);
  }

  async getSupplierMaterials(supplierId: string): Promise<any[]> {
    const query = `
      SELECT DISTINCT i.*
      FROM inventory i
      JOIN purchase_order_items poi ON i.id = poi.material_id
      JOIN purchase_orders po ON poi.purchase_order_id = po.id
      WHERE po.supplier_id = $1
    `;

    return this.getAll(query, [supplierId]);
  }

  async getSupplierTotalOrders(supplierId: string): Promise<number> {
    const query = `SELECT COUNT(*) as total FROM purchase_orders WHERE supplier_id = $1`;
    const result = await this.getOne(query, [supplierId]);
    return parseInt(result.total) || 0;
  }

  async getSupplierTotalSpent(supplierId: string): Promise<number> {
    const query = `
      SELECT COALESCE(SUM(total_amount), 0) as total_spent
      FROM purchase_orders
      WHERE supplier_id = $1 AND status = 'RECEIVED'
    `;

    const result = await this.getOne(query, [supplierId]);
    return parseFloat(result.total_spent) || 0;
  }

  // ============================================================================
  // SUPPLIERS V3 METHODS - API COMPATIBILITY
  // ============================================================================

  async getSuppliersV3(args: { limit?: number; offset?: number; category?: string; status?: string; }): Promise<any[]> {
    return this.getSuppliers(args);
  }

  async getSupplierV3ById(id: string): Promise<any> {
    return this.getSupplierById(id);
  }

  async createSupplierV3(input: any): Promise<any> {
    return this.createSupplier(input);
  }

  async updateSupplierV3(id: string, input: any): Promise<any> {
    return this.updateSupplier(id, input);
  }

  async deleteSupplierV3(id: string): Promise<void> {
    return this.deleteSupplier(id);
  }

  // ============================================================================
  // PURCHASE ORDERS V3 METHODS - API COMPATIBILITY
  // ============================================================================

  async getPurchaseOrdersV3(args: { supplierId?: string; limit?: number; offset?: number; status?: string; }): Promise<any[]> {
    return this.getPurchaseOrders(args);
  }

  async getPurchaseOrderV3ById(id: string): Promise<any> {
    return this.getPurchaseOrderById(id);
  }

  async createPurchaseOrderV3(input: any): Promise<any> {
    return this.createPurchaseOrder(input);
  }

  async updatePurchaseOrderV3(id: string, input: any): Promise<any> {
    return this.updatePurchaseOrder(id, input);
  }

  async approvePurchaseOrderV3(id: string, approverId: string): Promise<any> {
    return this.approvePurchaseOrder(id, approverId);
  }

  async cancelPurchaseOrderV3(id: string, reason?: string): Promise<any> {
    return this.cancelPurchaseOrder(id, reason);
  }

  async receivePurchaseOrderV3(id: string, receivedItems: any[]): Promise<any> {
    return this.receivePurchaseOrder(id, receivedItems);
  }

  async deletePurchaseOrderV3(id: string): Promise<void> {
    return this.deletePurchaseOrder(id);
  }

  // ============================================================================
  // PURCHASE ORDER ITEMS V3 METHODS - API COMPATIBILITY
  // ============================================================================

  async getPurchaseOrderItemsV3(purchaseOrderId: string): Promise<any[]> {
    return this.getPurchaseOrderItems(purchaseOrderId);
  }

  async addPurchaseOrderItemV3(purchaseOrderId: string, input: any): Promise<any> {
    return this.addPurchaseOrderItem(purchaseOrderId, input);
  }

  async updatePurchaseOrderItemV3(id: string, input: any): Promise<any> {
    return this.updatePurchaseOrderItem(id, input);
  }

  async removePurchaseOrderItemV3(id: string): Promise<void> {
    return this.removePurchaseOrderItem(id);
  }

  async updatePurchaseOrderTotalV3(purchaseOrderId: string): Promise<void> {
    return this.updatePurchaseOrderTotal(purchaseOrderId);
  }

  // ============================================================================
  // SUPPLIER HELPER METHODS V3 - API COMPATIBILITY
  // ============================================================================

  async getSupplierPurchaseOrdersV3(args: { supplierId: string; limit?: number; }): Promise<any[]> {
    return this.getSupplierPurchaseOrders(args);
  }

  async getSupplierMaterialsV3(supplierId: string): Promise<any[]> {
    return this.getSupplierMaterials(supplierId);
  }

  async getSupplierTotalOrdersV3(supplierId: string): Promise<number> {
    return this.getSupplierTotalOrders(supplierId);
  }

  async getSupplierTotalSpentV3(supplierId: string): Promise<number> {
    return this.getSupplierTotalSpent(supplierId);
  }
}