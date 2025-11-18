/**
 * RLS CONTEXT INJECTION
 * 
 * Inyecta las session variables necesarias para Row-Level Security (RLS)
 * en PostgreSQL. Estas variables determinan qué datos puede ver cada usuario.
 * 
 * GDPR Article 9 Compliance: Los pacientes SOLO ven sus propios datos.
 * 
 * Session Variables:
 * - app.current_user_id: ID del usuario autenticado (JWT)
 * - app.current_user_role: Rol del usuario (PATIENT | STAFF | ADMIN)
 * 
 * CRITICAL: Debe ejecutarse ANTES de cualquier query que acceda a:
 * - patients
 * - medical_records
 * - appointments
 * - billing_data
 * - subscriptions
 */

import { Pool, PoolClient } from 'pg';

/**
 * Roles válidos en el sistema
 */
export enum UserRole {
  PATIENT = 'PATIENT',
  STAFF = 'STAFF',
  ADMIN = 'ADMIN',
}

/**
 * Contexto RLS mínimo requerido
 */
export interface RLSContext {
  userId: number;
  role: UserRole;
}

/**
 * Configura el contexto RLS para la sesión actual
 * 
 * @param client - Cliente PostgreSQL (dentro de transacción o standalone)
 * @param context - Contexto del usuario autenticado
 * 
 * @example
 * ```typescript
 * const client = await pool.connect();
 * try {
 *   await client.query('BEGIN');
 *   await setRLSContext(client, { userId: 42, role: UserRole.PATIENT });
 *   
 *   // Ahora todas las queries respetan RLS
 *   const result = await client.query('SELECT * FROM patients');
 *   // ^ Solo verá patient_id = 42
 *   
 *   await client.query('COMMIT');
 * } finally {
 *   client.release();
 * }
 * ```
 */
export async function setRLSContext(
  client: PoolClient,
  context: RLSContext
): Promise<void> {
  // SET LOCAL = solo afecta la transacción actual
  // Se resetea automáticamente al hacer COMMIT/ROLLBACK
  await client.query('SET LOCAL app.current_user_id = $1', [context.userId]);
  await client.query('SET LOCAL app.current_user_role = $1', [context.role]);
}

/**
 * Ejecuta una query dentro de un contexto RLS
 * 
 * Maneja automáticamente:
 * - Adquisición del cliente
 * - Transacción (BEGIN/COMMIT/ROLLBACK)
 * - Inyección del contexto RLS
 * - Liberación del cliente
 * 
 * @param pool - Pool de conexiones PostgreSQL
 * @param context - Contexto del usuario autenticado
 * @param queryFn - Función que ejecuta las queries (recibe el cliente)
 * 
 * @example
 * ```typescript
 * const result = await withRLSContext(pool, 
 *   { userId: 42, role: UserRole.PATIENT },
 *   async (client) => {
 *     const res = await client.query('SELECT * FROM medical_records');
 *     return res.rows;
 *   }
 * );
 * ```
 */
export async function withRLSContext<T>(
  pool: Pool,
  context: RLSContext,
  queryFn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    await setRLSContext(client, context);
    
    const result = await queryFn(client);
    
    await client.query('COMMIT');
    return result;
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Extrae el contexto RLS del JWT decodificado
 * 
 * @param jwtPayload - Payload del JWT (ya decodificado y validado)
 * 
 * @example
 * ```typescript
 * const payload = jwt.verify(token, JWT_SECRET);
 * const rlsContext = extractRLSContextFromJWT(payload);
 * ```
 */
export function extractRLSContextFromJWT(jwtPayload: any): RLSContext {
  // Validar que el JWT tiene los campos requeridos
  if (!jwtPayload.userId || typeof jwtPayload.userId !== 'number') {
    throw new Error('JWT inválido: userId missing or invalid');
  }
  
  if (!jwtPayload.role || !Object.values(UserRole).includes(jwtPayload.role)) {
    throw new Error(`JWT inválido: role missing or invalid (got: ${jwtPayload.role})`);
  }
  
  return {
    userId: jwtPayload.userId,
    role: jwtPayload.role as UserRole,
  };
}

/**
 * Middleware para GraphQL Context
 * 
 * Extrae el contexto RLS del JWT y lo inyecta en el contexto GraphQL
 * para que esté disponible en todos los resolvers.
 * 
 * @example
 * ```typescript
 * // En selene/src/index.ts
 * const server = new ApolloServer({
 *   typeDefs,
 *   resolvers,
 *   context: async ({ req }) => {
 *     const token = req.headers.authorization?.replace('Bearer ', '');
 *     if (!token) return { rlsContext: null };
 *     
 *     const payload = jwt.verify(token, JWT_SECRET);
 *     const rlsContext = extractRLSContextFromJWT(payload);
 *     
 *     return { rlsContext };
 *   }
 * });
 * ```
 */
export interface GraphQLContextWithRLS {
  rlsContext: RLSContext | null;
  // ... otros campos del contexto
}

/**
 * Helper para verificar que el usuario tiene permiso
 * 
 * @throws Error si el contexto RLS no está disponible (no autenticado)
 */
export function requireRLSContext(context: GraphQLContextWithRLS): RLSContext {
  if (!context.rlsContext) {
    throw new Error('No autenticado: RLS context no disponible');
  }
  return context.rlsContext;
}

/**
 * Helper para verificar que el usuario tiene un rol específico
 * 
 * @throws Error si el usuario no tiene el rol requerido
 */
export function requireRole(
  context: GraphQLContextWithRLS, 
  allowedRoles: UserRole[]
): RLSContext {
  const rlsContext = requireRLSContext(context);
  
  if (!allowedRoles.includes(rlsContext.role)) {
    throw new Error(
      `Acceso denegado: se requiere rol ${allowedRoles.join(' o ')}, tienes ${rlsContext.role}`
    );
  }
  
  return rlsContext;
}
