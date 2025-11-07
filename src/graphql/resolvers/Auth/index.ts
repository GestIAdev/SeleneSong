/**
 * 🔐 AUTHENTICATION RESOLVERS (V3 - VERITAS + REAL DB)
 * By PunkClaude & Radwulf - November 7, 2025
 *
 * MISSION: GraphQL-based authentication with PostgreSQL + bcrypt
 * TARGET: Secure login/logout/refresh with JWT tokens
 */

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
  login: async (_: any, { input }: any): Promise<any> => {
    try {
      const { email, password } = input;
      console.log(`🔐 Login attempt: ${email}`);

      // 🎯 REAL DATABASE AUTHENTICATION
      const { default: pg } = await import('pg');
      const { default: bcrypt } = await import('bcrypt');
      
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
      const jwt = await import('jsonwebtoken');
      const jwtSecret = process.env.JWT_SECRET || 'selene-secret-key';
      
      // Map DB role to GraphQL schema role enum
      const roleMap: Record<string, string> = {
        'admin': 'ADMIN',
        'professional': 'DENTIST',
        'receptionist': 'RECEPTIONIST',
        'patient': 'PATIENT'
      };
      
      const graphqlRole = roleMap[user.role] || 'DENTIST';
      
      const accessToken = jwt.default.sign(
        {
          userId: user.id,
          email: user.email,
          role: graphqlRole,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          permissions: ['read', 'write']
        },
        jwtSecret,
        { expiresIn: '15m' } // 15 minutes
      );

      const refreshToken = jwt.default.sign(
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
        expiresIn: 900, // 15 minutes in seconds
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

      console.log(`✅ Login successful: ${user.email} (${graphqlRole}) - DB USER`);
      return authResponse;

    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  logout: async (): Promise<boolean> => {
    try {
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
      const jwt = await import('jsonwebtoken');
      const jwtSecret = process.env.JWT_SECRET || 'selene-secret-key';

      // Verify refresh token
      const decoded: any = jwt.default.verify(refreshToken, jwtSecret);
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const newAccessToken = jwt.default.sign(
        {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          permissions: ['read', 'write']
        },
        jwtSecret,
        { expiresIn: '15m' }
      );

      console.log(`🔄 Token refreshed for user: ${decoded.email}`);
      
      return {
        accessToken: newAccessToken,
        refreshToken, // Return same refresh token
        expiresIn: 900,
        user: {
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          isActive: true,
          createdAt: new Date().toISOString(),
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
