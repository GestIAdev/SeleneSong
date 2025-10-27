/**
 * 🚀 DIAGNOSTIC EXPRESS SERVER
 * Temporal server to run heap diagnostic
 */

import express from "express";
import { SeleneNuclearGraphQL } from "./src/graphql/server-optimized";
import { SeleneDatabase } from "./src/Database";

const app = express();
const port = 8008;

/**
 * 🌟 DIAGNOSTIC SERVER
 */
class DiagnosticServer {
  private database!: SeleneDatabase;
  private graphqlServer!: SeleneNuclearGraphQL;

  constructor() {
    console.log("🔬 Starting Diagnostic Express Server...");
  }

  /**
   * 🚀 Initialize systems
   */
  private async initialize(): Promise<void> {
    console.log("🔧 Initializing systems...");

    // Database
    this.database = new SeleneDatabase();

    // GraphQL server with diagnostic endpoint
    this.graphqlServer = new SeleneNuclearGraphQL(
      this.database,
      {
        get: () => null,
        set: () => Promise.resolve(),
        delete: () => Promise.resolve(),
      } as any,
      { getHealthStatus: () => ({ overall: "ok" }) } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    console.log("✅ Systems initialized");
  }

  /**
   * 🔌 Connect systems
   */
  private async connect(): Promise<void> {
    console.log("🔌 Connecting to database...");

    try {
      await this.database.connect();
      console.log("✅ Database connected");
    } catch (error) {
      console.error("💥 Database connection failed:", error);
      throw error;
    }
  }

  /**
   * 🌐 Setup routes and middleware
   */
  private async setupRoutes(): Promise<void> {
    console.log("🔧 Setting up routes...");

    // Initialize GraphQL server
    await this.graphqlServer.initialize();

    // Setup GraphQL middleware
    this.graphqlServer.setupMiddleware(app);

    console.log("✅ Routes configured");
  }

  /**
   * 🚀 Start server
   */
  private async start(): Promise<void> {
    console.log(`🔥 Starting diagnostic server on port ${port}...`);

    app.listen(port, () => {
      console.log(`🎯 Diagnostic server operational!`);
      console.log(`🌐 GraphQL: http://localhost:${port}/graphql`);
      console.log(
        `🔬 Heap Diagnostic: http://localhost:${port}/diagnostic/heap`,
      );
      console.log(`❤️ Health: http://localhost:${port}/graphql/health`);
    });
  }

  /**
   * 🚀 BOOT SEQUENCE
   */
  public async boot(): Promise<void> {
    console.log("🚀 DIAGNOSTIC SERVER BOOT SEQUENCE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    try {
      // Phase 1: Initialize
      console.log("📍 Phase 1: Initialize");
      await this.initialize();

      // Phase 2: Connect
      console.log("📍 Phase 2: Connect");
      await this.connect();

      // Phase 3: Setup routes
      console.log("📍 Phase 3: Setup routes");
      await this.setupRoutes();

      // Phase 4: Start server
      console.log("📍 Phase 4: Start server");
      await this.start();

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🎉 DIAGNOSTIC SERVER ONLINE");
      console.log("🔬 Heap diagnostic ready");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    } catch (error) {
      console.error("💥 DIAGNOSTIC BOOT FAILURE:", error);
      process.exit(1);
    }
  }
}

/**
 * 🚀 MAIN EXECUTION
 */
async function main() {
  console.log("🌟 SELENE SONG CORE - DIAGNOSTIC MODE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const server = new DiagnosticServer();

  // Handle graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Received SIGINT, shutting down gracefully...");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
    process.exit(0);
  });

  try {
    await server.boot();
  } catch (error) {
    console.error("💥 Startup failed:", error);
    process.exit(1);
  }
}

main().catch((_error) => {
  console.error("💥 Critical error:", _error);
  process.exit(1);
});
