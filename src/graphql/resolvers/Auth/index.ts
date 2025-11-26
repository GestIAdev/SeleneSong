/**
 * 🔐 AUTHENTICATION RESOLVERS (V3 - VERITAS + REAL DB)
 * By PunkClaude & Radwulf - November 7, 2025
 *
 * MISSION: GraphQL-based authentication with PostgreSQL + bcrypt
 * TARGET: Secure login/logout/refresh with JWT tokens
 */

import jwt from 'jsonwebtoken';
import { registerPatient } from '../Mutation/registerPatient.js';

// 🔐 AUTH QUERIES
export const AuthQuery = {
  me: async (_: any, __: any, context: any): Promise<any> => {
    try {
      // Extract user from context (set by Apollo Server auth middleware)
      const user = context?.user || context?.req?.user;

      if (!user) {
        console.log('❌ No authenticated user in context');
        return null;
      }

      console.log(`👤 ME query for user: ${user.email}`);
      
      // Return user data
      return {
        id: user.userId || user.id,
        username: user.username || user.email.split('@')[0],
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        isActive: user.isActive !== false,
        createdAt: user.createdAt || new Date().toISOString(),
      };

    } catch (error) {
      console.error('❌ ME query error:', error);
      return null;
    }
  },
};

// 🔐 AUTH MUTATIONS
export const AuthMutation = {
  registerPatient: async (_: any, { input }: any, context: any): Promise<any> => {
    // Wrapper que adapta los parámetros para la función registerPatient
    console.log('🔐 [AuthMutation] registerPatient wrapper called with input:', input);
    try {
      const result = await registerPatient(_, { input }, context);
      console.log('🔐 [AuthMutation] registerPatient result:', result);
      return result;
    } catch (error: any) {
      console.error('🔐 [AuthMutation] registerPatient error:', error);
      throw error;
    }
  },
  
  login: async (_: any, { input }: any, context: any): Promise<any> => {
    try {
      const { email, password } = input;
      console.log(`🔐 Login attempt: ${email}`);

      // 🎯 REAL DATABASE AUTHENTICATION
      const pg = await import('pg');
      const bcrypt = await import('bcrypt');
      
      const client = new pg.Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'dentiagest',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '11111111',
      });

      await client.connect();

      // Query user from database
      const result = await client.query(
        'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND is_active = true AND deleted_at IS NULL',
        [email]
      );

      await client.end();

      if (result.rows.length === 0) {
        console.log(`❌ User not found or inactive: ${email}`);
        throw new Error('Invalid credentials');
      }

      const user = result.rows[0];

      // Validate password with bcrypt
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        console.log(`❌ Invalid password for: ${email}`);
        throw new Error('Invalid credentials');
      }

      // Check if account is locked
      if (user.is_locked) {
        console.log(`❌ Account locked: ${email}`);
        throw new Error('Account is locked');
      }

      // 🔐 Generate JWT tokens
      const jwtSecret = process.env.JWT_SECRET || 'selene-secret-key';
      
      // Map DB role to GraphQL schema role enum
      const roleMap: Record<string, string> = {
        'ADMIN': 'ADMIN',
        'admin': 'ADMIN',
        'PROFESSIONAL': 'DENTIST',
        'professional': 'DENTIST',
        'RECEPTIONIST': 'RECEPTIONIST',
        'receptionist': 'RECEPTIONIST',
        'PATIENT': 'PATIENT',
        'patient': 'PATIENT'
      };
      
      const graphqlRole = roleMap[user.role] || 'PATIENT';
      
      // 🏛️ EMPIRE ARCHITECTURE V2: Determine clinic_id for JWT
      // - Owner in lobby mode: clinic_id = null
      // - Owner operating: clinic_id = current_clinic_id
      // - Staff: clinic_id = their assigned clinic
      // - Patient: clinic_id = null (uses patient_clinic_access)
      const clinicIdForToken = user.is_owner 
        ? user.current_clinic_id  // Owner: use current_clinic_id (can be null = lobby)
        : user.clinic_id;         // Staff: use fixed clinic_id
      
      const accessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: graphqlRole,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          permissions: ['read', 'write'],
          
          // 🏛️ EMPIRE ARCHITECTURE V2: Multi-tenant fields in JWT
          isOwner: user.is_owner || false,
          clinicId: clinicIdForToken,
          currentClinicId: user.current_clinic_id || null,
          organizationName: user.organization_name || null
        },
        jwtSecret,
        { expiresIn: '24h' } // 24 hours (DEV MODE - change to 15m for production)
      );

      const refreshToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          type: 'refresh'
        },
        jwtSecret,
        { expiresIn: '7d' } // 7 days
      );

      const authResponse = {
        accessToken,
        refreshToken,
        expiresIn: 86400, // 24 hours in seconds (DEV MODE)
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: graphqlRole,
          firstName: user.first_name,
          lastName: user.last_name,
          isActive: user.is_active,
          lastLoginAt: user.last_login_at, // ✅ Added field
          createdAt: user.created_at,
        }
      };

      // 🔒 SECURITY UPGRADE: Set httpOnly cookies for VitalPass
      if (context?.res) {
        const isProduction = process.env.NODE_ENV === 'production';
        
        context.res.cookie('accessToken', accessToken, {
          httpOnly: true,
          secure: isProduction, // HTTPS only in production
          sameSite: 'strict',
          maxAge: 86400000, // 24 hours in milliseconds (DEV MODE)
        });
        
        context.res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'strict',
          maxAge: 604800000, // 7 days in milliseconds
        });
        
        console.log('🍪 httpOnly cookies set for VitalPass authentication');
      } else {
        console.warn('⚠️ No response object in context - cookies not set (GraphQL Playground?)');
      }

      console.log(`✅ Login successful: ${user.email} (${graphqlRole}) - DB USER`);
      return authResponse;

    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  logout: async (_: any, __: any, context: any): Promise<boolean> => {
    try {
      // 🔒 SECURITY UPGRADE: Clear httpOnly cookies for VitalPass
      if (context?.res) {
        context.res.cookie('accessToken', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 0, // Expire immediately
        });
        
        context.res.cookie('refreshToken', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 0, // Expire immediately
        });
        
        console.log('🍪 httpOnly cookies cleared for VitalPass logout');
      }

      // TODO: Invalidate token in Redis or token blacklist
      console.log('🚪 Logout successful');
      return true;
    } catch (error) {
      console.error('❌ Logout error:', error);
      return false;
    }
  },

  refreshToken: async (_: any, { input }: any): Promise<any> => {
    try {
      const { refreshToken } = input;
      const pg = await import('pg');
      const jwtSecret = process.env.JWT_SECRET || 'selene-secret-key';

      // Verify refresh token
      const decoded: any = jwt.verify(refreshToken, jwtSecret);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // 🔥 FETCH USER FROM DATABASE to get latest data (including username)
      const client = new pg.Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'dentiagest',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '11111111',
      });

      await client.connect();
      
      const result = await client.query(
        'SELECT id, email, username, role, first_name, last_name, is_active, created_at FROM users WHERE id = $1',
        [decoded.userId]
      );

      await client.end();

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];

      // Generate new access token with fresh user data
      const newAccessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          permissions: ['read', 'write']
        },
        jwtSecret,
        { expiresIn: '24h' } // DEV MODE - 24 hours
      );

      console.log(`🔄 Token refreshed for user: ${user.email}`);
      
      return {
        accessToken: newAccessToken,
        refreshToken, // Return same refresh token
        expiresIn: 86400, // 24 hours in seconds (DEV MODE)
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name,
          isActive: user.is_active,
          createdAt: user.created_at,
        }
      };

    } catch (error) {
      console.error('❌ Token refresh error:', error);
      throw new Error('Invalid refresh token');
    }
  },
};

/**
 * 🎯 USER TYPE RESOLVER
 * Computed fields for User type
 */
export const User = {
  /**
   * fullName - Computed field combining firstName + lastName
   */
  fullName: (parent: any) => {
    return `${parent.firstName || ''} ${parent.lastName || ''}`.trim();
  },
};
