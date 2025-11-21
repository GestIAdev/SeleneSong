/**
 * 👥 USER MODULE RESOLVERS - MULTI-TENANT SECURED
 * By PunkClaude - 2025-01-17
 * 
 * Mission: GraphQL User queries with clinic isolation from day 1
 * Architecture: THE EMPEROR'S WAY - no legacy debt, perfect from line 1
 * 
 * Security Rules:
 * - Staff: See only users from their clinic (clinic_id filter)
 * - Owners: See users from all their clinics (owner_clinics JOIN)
 * - Patients are GLOBAL (no clinic filtering for patient role)
 * - All queries require authentication (context.user)
 */

import { getClinicIdFromContext } from '../utils/clinicHelpers.js';

/**
 * 👥 Get all users (with multi-tenant filtering)
 * 
 * Access Rules:
 * - Staff: Returns users from their clinic only
 * - Owners: Returns users from all their clinics
 * - Unauthenticated: Returns empty array
 */
export const users = async (_: any, args: { 
  role?: string; 
  limit?: number; 
  offset?: number; 
}, context: any): Promise<any[]> => {
  try {
    // 🔐 Authentication required
    if (!context?.user) {
      console.warn('⚠️ users() called without authentication - BLOCKED');
      return [];
    }

    const user = context.user;
    const clinicId = getClinicIdFromContext(context);
    const isOwner = user.isOwner || user.is_owner || false;
    const ownerId = isOwner ? (user.userId || user.id) : undefined;

    console.log(`👥 users() query by ${user.email} (role: ${user.role}, clinicId: ${clinicId}, isOwner: ${isOwner})`);

    // Call Database.getUsers with clinic filtering
    const users = await context.database.getUsers({
      clinicId,
      isOwner,
      ownerId,
      role: args.role,
      limit: args.limit,
      offset: args.offset
    });

    console.log(`✅ users() returned ${users.length} users`);
    return users;

  } catch (error) {
    console.error('❌ users() resolver error:', error);
    throw error;
  }
};

/**
 * 👤 Get single user by ID (with ownership verification)
 * 
 * Access Rules:
 * - Staff: Can only access users from their clinic
 * - Owners: Can access users from any of their clinics
 * - Returns null if user not found or access denied
 */
export const user = async (_: any, args: { id: string }, context: any): Promise<any | null> => {
  try {
    // 🔐 Authentication required
    if (!context?.user) {
      console.warn(`⚠️ user(${args.id}) called without authentication - BLOCKED`);
      return null;
    }

    const requestingUser = context.user;
    const clinicId = getClinicIdFromContext(context);
    const isOwner = requestingUser.isOwner || requestingUser.is_owner || false;
    const ownerId = isOwner ? (requestingUser.userId || requestingUser.id) : undefined;

    console.log(`👤 user(${args.id}) query by ${requestingUser.email} (clinicId: ${clinicId}, isOwner: ${isOwner})`);

    // Call Database.getUser with ownership verification
    const user = await context.database.getUser({
      userId: args.id,
      clinicId,
      isOwner,
      ownerId
    });

    if (!user) {
      console.log(`❌ user(${args.id}): NOT FOUND or ACCESS DENIED`);
      return null;
    }

    console.log(`✅ user(${args.id}) found: ${user.email}`);
    return user;

  } catch (error) {
    console.error(`❌ user(${args.id}) resolver error:`, error);
    throw error;
  }
};

/**
 * 👥 Get staff members only (non-owners, non-patients)
 * 
 * Access Rules:
 * - Staff: Returns staff from their clinic only
 * - Owners: Returns staff from all their clinics
 * - Excludes owners and patients
 */
export const staff = async (_: any, args: { 
  limit?: number; 
  offset?: number; 
}, context: any): Promise<any[]> => {
  try {
    // 🔐 Authentication required
    if (!context?.user) {
      console.warn('⚠️ staff() called without authentication - BLOCKED');
      return [];
    }

    const user = context.user;
    const clinicId = getClinicIdFromContext(context);
    const isOwner = user.isOwner || user.is_owner || false;
    const ownerId = isOwner ? (user.userId || user.id) : undefined;

    console.log(`👥 staff() query by ${user.email} (clinicId: ${clinicId}, isOwner: ${isOwner})`);

    // Call Database.getStaffV3 with clinic filtering
    const staffMembers = await context.database.getStaffV3({
      clinicId,
      isOwner,
      ownerId,
      limit: args.limit,
      offset: args.offset
    });

    console.log(`✅ staff() returned ${staffMembers.length} staff members`);
    return staffMembers;

  } catch (error) {
    console.error('❌ staff() resolver error:', error);
    throw error;
  }
};
