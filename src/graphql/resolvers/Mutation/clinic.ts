/**
 * 🏛️ EMPIRE ARCHITECTURE V2 - CLINIC MUTATIONS
 * Author: PunkClaude
 * Date: 2025-11-20
 * Purpose: Owner clinic switching (Lobby ↔ Operating mode)
 */

import jwt from 'jsonwebtoken';
import pg from 'pg';
import { isOwner } from '../utils/clinicHelpers.js';

const JWT_SECRET = process.env.JWT_SECRET || 'selene-secret-key';

// Database client config
function getDbConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'dentiagest',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '11111111',
  };
}

/**
 * 🏥 SELECT CLINIC (Owner enters a clinic from lobby)
 * 
 * Flow:
 * 1. Verify user is owner
 * 2. Verify ownership of clinic (owner_clinics table)
 * 3. Update users.current_clinic_id = clinicId
 * 4. Regenerate JWT with new clinic_id
 * 5. Return new token + updated user
 */
export async function selectClinic(
  _: any,
  args: { clinicId: string },
  context: any
): Promise<any> {
  const user = context?.user || context?.req?.user;
  const { clinicId } = args;

  console.log(`🏥 selectClinic: User ${user?.email} wants to enter clinic ${clinicId}`);

  // ✅ GATE 1: Authentication
  if (!user) {
    throw new Error('Authentication required');
  }

  // ✅ GATE 2: Must be owner
  if (!isOwner(context)) {
    throw new Error('Only clinic owners can switch clinics');
  }

  const client = new pg.Client(getDbConfig());
  await client.connect();

  try {
    // ✅ GATE 3: Verify ownership
    const ownershipCheck = await client.query(
      `SELECT * FROM owner_clinics WHERE owner_id = $1 AND clinic_id = $2`,
      [user.userId, clinicId]
    );

    if (ownershipCheck.rows.length === 0) {
      throw new Error(`You do not own clinic ${clinicId}`);
    }

    // ✅ GATE 4: Verify clinic exists and is active
    const clinicCheck = await client.query(
      `SELECT * FROM clinics WHERE id = $1 AND is_active = TRUE`,
      [clinicId]
    );

    if (clinicCheck.rows.length === 0) {
      throw new Error(`Clinic ${clinicId} not found or inactive`);
    }

    const clinic = clinicCheck.rows[0];

    // ✅ GATE 5: Update user's current_clinic_id
    await client.query(
      `UPDATE users SET current_clinic_id = $1 WHERE id = $2`,
      [clinicId, user.userId]
    );

    console.log(`✅ Updated user ${user.email} current_clinic_id to ${clinicId}`);

    // ✅ GATE 6: Regenerate JWT with new clinic_id
    const newAccessToken = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        permissions: user.permissions || ['read', 'write'],
        
        // 🏛️ NEW CLINIC CONTEXT
        isOwner: true,
        clinicId: clinicId, // ✅ NOW SET
        currentClinicId: clinicId,
        organizationName: user.organization_name || user.organizationName
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    console.log(`🎉 Owner ${user.email} entered clinic: ${clinic.name}`);

    return {
      accessToken: newAccessToken,
      expiresIn: 900,
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isOwner: true,
        currentClinicId: clinicId,
        organizationName: user.organization_name || user.organizationName
      },
      selectedClinic: {
        id: clinic.id,
        name: clinic.name,
        email: clinic.email,
        phone: clinic.phone,
        city: clinic.city,
        country: clinic.country
      }
    };

  } finally {
    await client.end();
  }
}

/**
 * 🚪 EXIT CLINIC (Owner returns to lobby)
 * 
 * Flow:
 * 1. Verify user is owner
 * 2. Update users.current_clinic_id = NULL
 * 3. Regenerate JWT without clinic_id
 * 4. Return new token
 */
export async function exitClinic(
  _: any,
  __: any,
  context: any
): Promise<any> {
  const user = context?.user || context?.req?.user;

  console.log(`🚪 exitClinic: User ${user?.email} wants to return to lobby`);

  // ✅ GATE 1: Authentication
  if (!user) {
    throw new Error('Authentication required');
  }

  // ✅ GATE 2: Must be owner
  if (!isOwner(context)) {
    throw new Error('Only clinic owners can exit to lobby');
  }

  const client = new pg.Client(getDbConfig());
  await client.connect();

  try {
    // ✅ GATE 3: Set current_clinic_id to NULL
    await client.query(
      `UPDATE users SET current_clinic_id = NULL WHERE id = $1`,
      [user.userId]
    );

    console.log(`✅ User ${user.email} current_clinic_id set to NULL (lobby mode)`);

    // ✅ GATE 4: Regenerate JWT without clinic_id
    const newAccessToken = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        permissions: user.permissions || ['read', 'write'],
        
        // 🏛️ LOBBY MODE
        isOwner: true,
        clinicId: null, // ✅ NULL = Lobby mode
        currentClinicId: null,
        organizationName: user.organization_name || user.organizationName
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    console.log(`🎉 Owner ${user.email} returned to lobby`);

    return {
      accessToken: newAccessToken,
      expiresIn: 900,
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isOwner: true,
        currentClinicId: null, // ✅ NULL
        organizationName: user.organization_name || user.organizationName
      }
    };

  } finally {
    await client.end();
  }
}
