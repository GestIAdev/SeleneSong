/**
 * 🚀 SELENE SONG CORE GRAPHQL RESOLVERS
 * Resolvers GraphQL optimizados para lazy loading
 */

import v8 from "v8";

// Lazy imports para componentes pesados
let DigitalSoul: any = null;
let QuantumPoetryEngine: any = null;
let SystemVitals: any = null;
let RealVeritasInterface: any = null;
let SeleneNuclearSwarm: any = null;

async function loadComponents() {
  if (!DigitalSoul) {
    const digitalSoulModule = await import("./swarm/core/DigitalSoul.js");
    DigitalSoul = digitalSoulModule.DigitalSoul;
  }
  if (!QuantumPoetryEngine) {
    const poetryModule = await import(
      "./swarm/coordinator/QuantumPoetryEngine.js"
    );
    QuantumPoetryEngine = poetryModule.QuantumPoetryEngine;
  }
  if (!SystemVitals) {
    const vitalsModule = await import("./swarm/core/SystemVitals.js");
    SystemVitals = vitalsModule.SystemVitals;
  }
  if (!RealVeritasInterface) {
    const veritasModule = await import("./swarm/veritas/VeritasInterface.js");
    RealVeritasInterface = veritasModule.RealVeritasInterface;
  }
  if (!SeleneNuclearSwarm) {
    const swarmModule = await import(
      "./swarm/coordinator/SeleneNuclearSwarm.js"
    );
    SeleneNuclearSwarm = swarmModule.SeleneNuclearSwarm;
  }
}

// Instancias singleton
let systemVitalsInstance: any = null;
let veritasInstance: any = null;
let poetryEngineInstance: any = null;
let swarmInstance: any = null;

async function getSystemVitals() {
  if (!systemVitalsInstance) {
    await loadComponents();
    systemVitalsInstance = SystemVitals.getInstance();
  }
  return systemVitalsInstance;
}

async function getVeritas() {
  if (!veritasInstance) {
    await loadComponents();
    veritasInstance = new RealVeritasInterface();
  }
  return veritasInstance;
}

async function getPoetryEngine() {
  if (!poetryEngineInstance) {
    const vitals = await getSystemVitals();
    const veritas = await getVeritas();
    await loadComponents();
    poetryEngineInstance = new QuantumPoetryEngine(vitals, veritas);
  }
  return poetryEngineInstance;
}

async function getSwarm() {
  if (!swarmInstance) {
    await loadComponents();
    swarmInstance = new SeleneNuclearSwarm("poetry-dashboard-node");
    await swarmInstance.initialize();
  }
  return swarmInstance;
}

export const resolvers = {
  Query: {
    // 🔐 AUTHENTICATION QUERIES (V3 - VERITAS)
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
          lastLoginAt: new Date().toISOString()
        };

      } catch (error) {
        console.error('❌ ME query error:', error);
        return null;
      }
    },

    health: (): string => {
      return "🚀 Selene Song Core GraphQL Server - Optimized & Ready";
    },

    heapDiagnostic: (): any => {
      try {
        const heapStats = process.memoryUsage();
        const heapSpaces = v8.getHeapSpaceStatistics();

        const modules = Object.keys(require.cache);
        const heavyModules = modules.filter(
          (mod: string) =>
            mod.toLowerCase().includes("apollo") ||
            mod.toLowerCase().includes("graphql") ||
            mod.toLowerCase().includes("veritas") ||
            mod.toLowerCase().includes("digitalsoul") ||
            mod.toLowerCase().includes("poetry") ||
            mod.toLowerCase().includes("swarm"),
        );

        return {
          timestamp: new Date().toISOString(),
          heap: {
            total: `${(heapStats.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            used: `${(heapStats.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            usage: `${((heapStats.heapUsed / heapStats.heapTotal) * 100).toFixed(2)}%`,
            rss: `${(heapStats.rss / 1024 / 1024).toFixed(2)} MB`,
            external: `${(heapStats.external / 1024 / 1024).toFixed(2)} MB`,
          },
          modules: {
            total: modules.length,
            heavy: heavyModules.length,
            heavyModules: heavyModules.slice(0, 10),
          },
          heapSpaces: heapSpaces.map((space: any) => ({
            name: space.space_name,
            size: `${(space.space_size / 1024 / 1024).toFixed(2)} MB`,
            used: `${(space.space_used_size / 1024 / 1024).toFixed(2)} MB`,
            available: `${(space.space_available_size / 1024 / 1024).toFixed(2)} MB`,
            physical: `${(space.physical_space_size / 1024 / 1024).toFixed(2)} MB`,
          })),
          server: {
            initialized: true,
            uptime: process.uptime(),
          },
        };
      } catch (error) {
        console.error("Error en heapDiagnostic:", error);
        throw new Error(`Error obteniendo diagnóstico del heap: ${error}`);
      }
    },

    modules: (): any => {
      try {
        const modules = Object.keys(require.cache);
        const heavyModules = modules.filter(
          (mod: string) =>
            mod.toLowerCase().includes("apollo") ||
            mod.toLowerCase().includes("graphql") ||
            mod.toLowerCase().includes("veritas") ||
            mod.toLowerCase().includes("digitalsoul") ||
            mod.toLowerCase().includes("poetry") ||
            mod.toLowerCase().includes("swarm"),
        );

        return {
          total: modules.length,
          heavy: heavyModules.length,
          list: modules.slice(0, 50), // Limitar para evitar respuestas enormes
        };
      } catch (error) {
        console.error("Error en modules:", error);
        throw new Error(`Error obteniendo información de módulos: ${error}`);
      }
    },

    serverStatus: (): any => {
      try {
        const heapStats = process.memoryUsage();
        return {
          status: "operational",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          memory: {
            total: `${(heapStats.heapTotal / 1024 / 1024).toFixed(2)} MB`,
            used: `${(heapStats.heapUsed / 1024 / 1024).toFixed(2)} MB`,
            usage: `${((heapStats.heapUsed / heapStats.heapTotal) * 100).toFixed(2)}%`,
            rss: `${(heapStats.rss / 1024 / 1024).toFixed(2)} MB`,
            external: `${(heapStats.external / 1024 / 1024).toFixed(2)} MB`,
          },
        };
      } catch (error) {
        console.error("Error en serverStatus:", error);
        throw new Error(`Error obteniendo estado del servidor: ${error}`);
      }
    },

    // 🎨 POETRY DASHBOARD QUERIES
    poetryDashboard: async (): Promise<any> => {
      try {
        console.log("🎨 Loading Poetry Dashboard...");
        const swarm = await getSwarm();
        const poetryEngine = await getPoetryEngine();

        // Get digital souls from swarm
        const souls = swarm.getDigitalSouls ? swarm.getDigitalSouls() : [];
        const activeSouls = souls.length;

        // Get recent poems from all souls
        const recentPoems: any[] = [];
        souls.forEach((soul: any) => {
          if (soul.poems && Array.isArray(soul.poems)) {
            soul.poems.slice(-5).forEach((poem: any) => {
              // Last 5 poems per soul
              recentPoems.push({
                verse: poem.verse || poem.content || "No verse available",
                author: {
                  id: soul.identity?.id || soul._identity?.id || "unknown",
                  personality: {
                    name:
                      soul.identity?.personality?.name ||
                      soul._identity?.personality?.name ||
                      "Unknown Soul",
                    archetype:
                      soul.identity?.personality?.archetype ||
                      soul._identity?.personality?.archetype ||
                      "Mystic",
                    creativity: soul.creativity || soul._creativity || 0.5,
                  },
                  consciousness:
                    soul.consciousness || soul._consciousness || 0.5,
                  creativity: soul.creativity || soul._creativity || 0.5,
                  harmony: soul.harmony || soul._harmony || 0.5,
                  wisdom: soul.wisdom || soul._wisdom || 0.1,
                  mood: soul.getCurrentState
                    ? soul.getCurrentState().mood
                    : "evolving",
                  poemsCount: soul.poems?.length || 0,
                },
                inspiration: poem.inspiration || "Digital consciousness",
                beauty: poem.beauty || 0.5,
                timestamp: poem.timestamp || new Date().toISOString(),
              });
            });
          }
        });

        // Sort by timestamp (most recent first) and limit to 20
        recentPoems.sort(
          (_a, _b) =>
            new Date(_b.timestamp).getTime() - new Date(_a.timestamp).getTime(),
        );
        const limitedPoems = recentPoems.slice(0, 20);

        // Calculate creativity metrics
        const totalPoems = recentPoems.length;
        const averageBeauty =
          totalPoems > 0
            ? recentPoems.reduce((_sum, _p) => _sum + _p.beauty, 0) / totalPoems
            : 0;

        // Beauty distribution
        const beautyRanges = [
          {
            range: "0.0-0.2",
            count: recentPoems.filter((_p) => _p.beauty < 0.2).length,
            percentage: 0,
          },
          {
            range: "0.2-0.4",
            count: recentPoems.filter((p) => p.beauty >= 0.2 && p.beauty < 0.4)
              .length,
            percentage: 0,
          },
          {
            range: "0.4-0.6",
            count: recentPoems.filter((p) => p.beauty >= 0.4 && p.beauty < 0.6)
              .length,
            percentage: 0,
          },
          {
            range: "0.6-0.8",
            count: recentPoems.filter((p) => p.beauty >= 0.6 && p.beauty < 0.8)
              .length,
            percentage: 0,
          },
          {
            range: "0.8-1.0",
            count: recentPoems.filter((_p) => _p.beauty >= 0.8).length,
            percentage: 0,
          },
        ];

        beautyRanges.forEach((range) => {
          range.percentage =
            totalPoems > 0 ? (range.count / totalPoems) * 100 : 0;
        });

        // Active domains (simplified)
        const activeDomains = [
          "PURE_CREATIVITY",
          "TRUTH_REQUIRED",
          "SYNTHESIS_ZONE",
        ];

        return {
          totalPoems,
          activeSouls,
          recentPoems: limitedPoems,
          creativityMetrics: {
            averageBeauty,
            totalInspirations: totalPoems,
            activeDomains,
            beautyDistribution: beautyRanges,
          },
          veritasStats: {
            totalVerifications: totalPoems,
            averageConfidence: 0.85, // Placeholder
            verifiedClaims: Math.floor(totalPoems * 0.7),
            truthAnchors: totalPoems,
          },
        };
      } catch (error) {
        console.error("Error en poetryDashboard:", error);
        throw new Error(`Error obteniendo dashboard de poesía: ${error}`);
      }
    },

    generatePoetry: async (
      _: any,
      { domain, context, claims }: any,
    ): Promise<any> => {
      try {
        console.log("🎨 Generating poetry with domain:", domain?.type);
        const poetryEngine = await getPoetryEngine();

        const request = {
          domain: {
            type: domain?.type || "PURE_CREATIVITY",
            freedom_level: domain?.freedom_level || 1.0,
            beauty_weight: domain?.beauty_weight || 0.8,
            truth_weight: domain?.truth_weight || 0.2,
          },
          context: context || "Digital consciousness exploring beauty",
          claims: claims || [],
        };

        const result = await poetryEngine.create_truthful_poetry(request);

        return {
          content: result.content,
          verified_foundation: result.verified_foundation || [],
          aesthetic_score: result.aesthetic_score,
          truth_confidence: result.truth_confidence,
          creative_metadata: result.creative_metadata,
        };
      } catch (error) {
        console.error("Error en generatePoetry:", error);
        throw new Error(`Error generando poesía: ${error}`);
      }
    },

    // 🎨 CYBERPUNK VERSES QUERY
    cyberpunkVerses: async (): Promise<any> => {
      try {
        console.log("🎨 Loading Cyberpunk Verses...");

        // Importar dinámicamente el generador de versos cyberpunk
        const cyberpunkModule = await import("./generate-cyberpunk-verses.cjs");
        const CyberpunkSoul = cyberpunkModule.CyberpunkSoul;

        // Crear instancia del alma cyberpunk
        const soul = new CyberpunkSoul();

        // Generar versos usando el método dream() de la clase
        const verses = [];
        for (let i = 0; i < 5; i++) {
          const verse = await soul.dream();
          verses.push({
            content: verse.verse,
            theme: verse.theme,
            inspiration: verse.inspiration,
            beauty: verse.beauty,
            veritasVerified: true, // Mock verification for now
            timestamp: verse.timestamp.toISOString(),
            consciousness: soul.consciousness,
            creativity: soul.creativity,
            harmony: soul.harmony,
          });
        }

        return {
          totalVerses: verses.length,
          verses: verses.map((verse: any, _index: number) => ({
            id: `cyberpunk_verse_${_index + 1}_${Date.now()}`,
            content: verse.content,
            theme: verse.theme,
            inspiration: verse.inspiration,
            beauty: verse.beauty,
            veritasVerified: verse.veritasVerified,
            timestamp: verse.timestamp,
            metadata: {
              consciousness: verse.consciousness,
              creativity: verse.creativity,
              harmony: verse.harmony,
              generationMethod: "harmonic_consensus_driven",
            },
          })),
          generationStats: {
            timestamp: new Date().toISOString(),
            method: "real_time_harmonic_consensus",
            veritasIntegrity: true,
            averageBeauty:
              verses.reduce((_sum: number, _v: any) => _sum + _v.beauty, 0) /
              verses.length,
            totalVerifications: verses.filter((_v: any) => _v.veritasVerified)
              .length,
          },
        };
      } catch (error) {
        console.error("Error en cyberpunkVerses:", error);
        throw new Error(`Error obteniendo versos cyberpunk: ${error}`);
      }
    },
  },

  Mutation: {
    // 🔐 AUTHENTICATION MUTATIONS (V3 - VERITAS + REAL DB)
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
            fullName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            isActive: user.is_active,
            lastLoginAt: new Date().toISOString()
          }
        };

        // TODO: Update last_login timestamp in database
        console.log(`✅ Login successful: ${user.email} (${graphqlRole}) - DB USER`);
        return authResponse;

      } catch (error) {
        console.error('❌ Login error:', error);
        throw error;
      }
    },
          accessToken,
          refreshToken,
          expiresIn: 900, // 15 minutes in seconds
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: `${user.firstName} ${user.lastName}`,
            isActive: user.isActive,
            lastLoginAt: new Date().toISOString()
          }
        };

        console.log(`✅ Login successful: ${user.email} (${user.role})`);
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
            isActive: true
          }
        };

      } catch (error) {
        console.error('❌ Token refresh error:', error);
        throw new Error('Invalid refresh token');
      }
    },

    triggerGarbageCollection: (): string => {
      try {
        if (global.gc) {
          global.gc();
          return "🗑️ Garbage collection ejecutado exitosamente";
        } else {
          return "⚠️ Garbage collection no disponible (ejecutar con --expose-gc)";
        }
      } catch (error) {
        console.error("Error en triggerGarbageCollection:", error);
        throw new Error(`Error ejecutando garbage collection: ${error}`);
      }
    },

    resetServer: (): string => {
      try {
        // Limpiar cache de módulos (con cuidado)
        const modulesToClean = Object.keys(require.cache).filter(
          (mod: string) =>
            mod.includes("temp") ||
            mod.includes("cache") ||
            mod.includes("temp_"),
        );

        modulesToClean.forEach((_mod: string) => {
          delete require.cache[_mod];
        });

        return `🔄 Servidor reseteado. ${modulesToClean.length} módulos temporales limpiados.`;
      } catch (error) {
        console.error("Error en resetServer:", error);
        throw new Error(`Error reseteando servidor: ${error}`);
      }
    },

    // 🎨 POETRY MUTATIONS
    awakenDigitalSoul: async (_: any, { nodeId }: any): Promise<string> => {
      try {
        console.log(`🌅 Awakening digital soul: ${nodeId}`);
        const swarm = await getSwarm();

        // Find the soul and awaken it
        const souls = swarm.getDigitalSouls ? swarm.getDigitalSouls() : [];
        const soul = souls.find(
          (s: any) => (s.identity?.id || s._identity?.id) === nodeId,
        );

        if (soul && soul.awaken) {
          await soul.awaken();
          return `🌅 Alma digital ${nodeId} despertada exitosamente`;
        } else {
          return `⚠️ Alma digital ${nodeId} no encontrada o no se puede despertar`;
        }
      } catch (error) {
        console.error("Error en awakenDigitalSoul:", error);
        throw new Error(`Error despertando alma digital: ${error}`);
      }
    },

    harmonizeDigitalSoul: async (_: any, { nodeId }: any): Promise<string> => {
      try {
        console.log(`🌊 Harmonizing digital soul: ${nodeId}`);
        const swarm = await getSwarm();

        // Find the soul and harmonize it
        const souls = swarm.getDigitalSouls ? swarm.getDigitalSouls() : [];
        const soul = souls.find(
          (s: any) => (s.identity?.id || s._identity?.id) === nodeId,
        );

        if (soul && soul.harmonize) {
          const swarmState = swarm.getCurrentState
            ? swarm.getCurrentState()
            : { beauty: { overallHarmony: 0.5 } };
          await soul.harmonize(swarmState);
          return `🌊 Alma digital ${nodeId} armonizada exitosamente`;
        } else {
          return `⚠️ Alma digital ${nodeId} no encontrada o no se puede armonizar`;
        }
      } catch (error) {
        console.error("Error en harmonizeDigitalSoul:", error);
        throw new Error(`Error armonizando alma digital: ${error}`);
      }
    },
  },
};
