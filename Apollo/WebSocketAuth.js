/**
 * 🔐 SELENE SONG CORE WEBSOCKET AUTHENTICATION
 * By PunkClaude & RaulVisionario - September 23, 2025
 *
 * MISSION: Secure WebSocket connections for GraphQL subscriptions
 * TARGET: JWT-based authentication with role-based access control
 */
import * as jwt from 'jsonwebtoken';
export class WebSocketAuth {
    monitoring; // MonitoringOrchestrator;
    jwtSecret = process.env.JWT_SECRET || 'selene-secret-key';
    activeConnections = new Map();
    constructor(monitoring) {
        this.monitoring = monitoring;
        console.log('🔐 WebSocket Authentication initialized');
    }
    /**
     * 🔍 Authenticate WebSocket connection
     */
    async authenticateConnection(connectionParams) {
        const connectionId = this.generateConnectionId();
        console.log(`🔍 Authenticating WebSocket connection: ${connectionId}`);
        try {
            // Extract authentication token
            const authToken = this.extractAuthToken(connectionParams);
            if (!authToken) {
                console.log(`⚠️ No auth token provided for connection: ${connectionId}`);
                return this.createUnauthenticatedContext(connectionId);
            }
            // Verify JWT token
            const decoded = this.verifyJWTToken(authToken);
            if (!decoded) {
                console.log(`❌ Invalid JWT token for connection: ${connectionId}`);
                this.monitoring.logError('WebSocket authentication failed', new Error('Invalid JWT token'), {
                    connectionId,
                    tokenProvided: !!authToken
                });
                return this.createUnauthenticatedContext(connectionId);
            }
            // Create authenticated context
            const authContext = {
                user: {
                    id: decoded.userId || decoded.id,
                    email: decoded.email,
                    role: decoded.role || 'user',
                    permissions: decoded.permissions || ['read']
                },
                isAuthenticated: true,
                connectionId
            };
            // Store active connection
            this.activeConnections.set(connectionId, authContext);
            console.log(`✅ WebSocket connection authenticated: ${connectionId}, user: ${authContext.user?.email}`);
            this.monitoring.logMetric('websocket_auth_success', 1, {
                connectionId,
                userId: authContext.user?.id,
                role: authContext.user?.role
            });
            return authContext;
        }
        catch (error) {
            console.error(`💥 WebSocket authentication error for ${connectionId}:`, error);
            this.monitoring.logError('WebSocket authentication error', error, {
                connectionId
            });
            return this.createUnauthenticatedContext(connectionId);
        }
    }
    /**
     * 🚪 Handle connection disconnect
     */
    handleDisconnect(connectionId) {
        console.log(`🚪 WebSocket connection disconnected: ${connectionId}`);
        this.activeConnections.delete(connectionId);
    }
    /**
     * 🛡️ Check subscription permissions
     */
    checkSubscriptionPermission(authContext, subscriptionName) {
        // If not authenticated, only allow public subscriptions
        if (!authContext.isAuthenticated) {
            return this.isPublicSubscription(subscriptionName);
        }
        // Check role-based permissions
        const userRole = authContext.user?.role || 'user';
        const permissions = authContext.user?.permissions || [];
        return this.hasSubscriptionPermission(userRole, permissions, subscriptionName);
    }
    /**
     * 📊 Get active connections stats
     */
    getActiveConnectionsStats() {
        const connections = Array.from(this.activeConnections.values());
        const authenticated = connections.filter(c => c.isAuthenticated).length;
        const unauthenticated = connections.filter(c => !c.isAuthenticated).length;
        return {
            total: connections.length,
            authenticated,
            unauthenticated,
            connections: connections.map(c => ({
                id: c.connectionId,
                authenticated: c.isAuthenticated,
                user: c.user ? { id: c.user.id, role: c.user.role } : null
            }))
        };
    }
    /**
     * 🔧 Extract auth token from connection parameters
     */
    extractAuthToken(connectionParams) {
        // Try different common parameter names
        return (connectionParams?.authorization ||
            connectionParams?.authToken ||
            connectionParams?.token ||
            connectionParams?.['Authorization'] ||
            null);
    }
    /**
     * 🔐 Verify JWT token
     */
    verifyJWTToken(token) {
        try {
            // Remove 'Bearer ' prefix if present
            const cleanToken = token.replace(/^Bearer\s+/i, '');
            return jwt.verify(cleanToken, this.jwtSecret);
        }
        catch (error) {
            console.error('JWT verification failed:', error);
            return null;
        }
    }
    /**
     * 🆔 Generate unique connection ID
     */
    generateConnectionId() {
        return `ws_${Date.now()}_${process.pid}_${this.connectionCounter++ || 1}`; // ID determinista con contador
    }
    /**
     * 👤 Create unauthenticated context
     */
    createUnauthenticatedContext(connectionId) {
        return {
            isAuthenticated: false,
            connectionId
        };
    }
    /**
     * 🌐 Check if subscription is public
     */
    isPublicSubscription(subscriptionName) {
        const publicSubscriptions = [
            'nuclearStatusUpdated',
            'nuclearHealthChanged'
        ];
        return publicSubscriptions.includes(subscriptionName);
    }
    /**
     * 🔒 Check subscription permissions based on role
     */
    hasSubscriptionPermission(role, permissions, subscriptionName) {
        // Admin has access to everything
        if (role === 'admin') {
            return true;
        }
        // Doctor role permissions
        if (role === 'doctor') {
            const doctorAllowed = [
                'patientCreated',
                'patientUpdated',
                'appointmentCreated',
                'appointmentUpdated',
                'appointmentV3Created',
                'appointmentV3Updated',
                'medicalRecordCreated',
                'medicalRecordV3Created',
                'medicalRecordV3Updated',
                'treatmentCreated',
                'treatmentV3Created',
                'treatmentV3Updated'
            ];
            return doctorAllowed.includes(subscriptionName);
        }
        // Nurse role permissions
        if (role === 'nurse') {
            const nurseAllowed = [
                'patientUpdated',
                'appointmentCreated',
                'appointmentUpdated',
                'appointmentV3Created',
                'appointmentV3Updated'
            ];
            return nurseAllowed.includes(subscriptionName);
        }
        // Receptionist role permissions
        if (role === 'receptionist') {
            const receptionistAllowed = [
                'appointmentCreated',
                'appointmentUpdated',
                'appointmentV3Created',
                'appointmentV3Updated'
            ];
            return receptionistAllowed.includes(subscriptionName);
        }
        // Default user permissions
        const userAllowed = [
            'appointmentStatusChanged' // Only their own appointments
        ];
        return userAllowed.includes(subscriptionName) && permissions.includes('read');
    }
}
export default WebSocketAuth;
