/**
 * 🔐 GRAPHQL HTTP AUTH MIDDLEWARE
 * Extracts y verifica JWT tokens de requests HTTP y carga user en context
 */

import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'selene-secret-key';

/**
 * 🔍 Verifica JWT token y extrae user info
 */
export async function verifyAuthToken(token: string): Promise<any> {
  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.log('❌ JWT verification failed:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

/**
 * 🔐 Express middleware para autenticación HTTP
 * Agrega user al request.user si JWT válido
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    // Extraer token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('⚠️ No Authorization header');
      (req as any).user = null;
      next();
      return;
    }

    // Bearer <token>
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      console.log('⚠️ Invalid Authorization header format');
      (req as any).user = null;
      next();
      return;
    }

    const token = parts[1];
    
    // Verify token asynchronously in background
    verifyAuthToken(token).then(decoded => {
      if (!decoded) {
        console.log('❌ Invalid token');
        (req as any).user = null;
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
        permissions: decoded.permissions || ['read', 'write']
      };

      console.log(`✅ Auth middleware: User authenticated`);
      console.log(`   Email: ${(req as any).user.email}`);
      console.log(`   UserId: ${(req as any).user.userId}`);
      console.log(`   Username: ${(req as any).user.username}`);
    }).catch(err => {
      console.error('💥 Auth verification error:', err);
      (req as any).user = null;
    });

    next();
  } catch (error) {
    console.error('💥 Auth middleware error:', error);
    (req as any).user = null;
    next();
  }
}
