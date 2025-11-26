/**
 * 🔐 GRAPHQL HTTP AUTH MIDDLEWARE
 * Extracts y verifica JWT tokens de requests HTTP y carga user en context
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'selene-secret-key';

/**
 * 🔍 Verifica JWT token y extrae user info
 */
export async function verifyAuthToken(token: string): Promise<any> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.log('❌ JWT verification failed:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * 🔐 Express middleware para autenticación HTTP
 * 🔒 SECURITY UPGRADE: Soporta httpOnly cookies + Bearer token (fallback)
 * Agrega user al request.user si JWT válido
 */
export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | null = null;

    // 🔒 PRIORITY 1: httpOnly cookie (más seguro)
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
      console.log('🔒 Using httpOnly cookie for authentication');
    }
    // 🔓 FALLBACK: Bearer token (legacy/dashboard/postman)
    else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      const parts = authHeader.split(' ');
      
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
        console.log('⚠️ Using Bearer token for authentication (legacy mode)');
      } else {
        console.log('⚠️ Invalid Authorization header format');
      }
    }

    // No token found
    if (!token) {
      console.log('⚠️ No authentication token (cookie or header)');
      (req as any).user = null;
      next();
      return;
    }
    
    // 🔥 FIX: Await token verification BEFORE calling next()
    const decoded = await verifyAuthToken(token);
    
    if (!decoded) {
      console.log('❌ Invalid token');
      (req as any).user = null;
      next();
      return;
    }

    // ✅ Usuario autenticado
    (req as any).user = {
      userId: decoded.userId || decoded.id,
      id: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role,
      username: decoded.username,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      permissions: decoded.permissions || ['read', 'write'],
      
      // 🏛️ EMPIRE ARCHITECTURE V2: Multi-tenant fields
      is_owner: decoded.is_owner || decoded.isOwner || false,
      clinic_id: decoded.clinic_id || decoded.clinicId || null,
      current_clinic_id: decoded.current_clinic_id || decoded.currentClinicId || null,
      organization_name: decoded.organization_name || decoded.organizationName || null
    };

    console.log(`✅ Auth middleware: User authenticated`);
    console.log(`   Email: ${(req as any).user.email}`);
    console.log(`   Role: ${(req as any).user.role}`);
    console.log(`   ClinicId: ${(req as any).user.clinic_id}`);
    console.log(`   UserId: ${(req as any).user.userId}`);
    console.log(`   Username: ${(req as any).user.username}`);
    
    next();
  } catch (error) {
    console.error('💥 Auth middleware error:', error);
    (req as any).user = null;
    next();
  }
}
