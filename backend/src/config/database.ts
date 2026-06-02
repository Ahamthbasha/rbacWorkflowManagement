// config/database.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

dotenv.config();

// Determine if we're in production
const isProduction = process.env.NODE_ENV === "production";

// SSL Configuration for Aiven
const getSSLConfig = () => {
  if (!isProduction) {
    return undefined; // No SSL in development
  }

  // Option 1: Using ca.pem file (recommended)
  if (process.env.DB_SSL_CA_PATH) {
    try {
      const caCert = fs.readFileSync(process.env.DB_SSL_CA_PATH, "utf-8");
      return {
        ca: caCert,
        rejectUnauthorized: true, // Important: verify certificate
      };
    } catch (error) {
      console.error("❌ Failed to read SSL certificate:", error);
      throw error;
    }
  }

  // Option 2: Using environment variable with certificate content
  if (process.env.DB_SSL_CA) {
    return {
      ca: process.env.DB_SSL_CA,
      rejectUnauthorized: true,
    };
  }

  // Option 3: Basic SSL (less secure but works for some providers)
  return {
    rejectUnauthorized: false, // Only use if options 1 & 2 not available
  };
};

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    // Add SSL configuration for production
    dialectOptions: {
      ssl: getSSLConfig(),
    },
  },
);

let sequelizeReady = false;
let pendingInitialization: Promise<Sequelize> | null = null;

// Create database if not exists (with SSL support)
const initDatabase = async () => {
  const connectionConfig: any = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "3306"),
  };

  // Add SSL for production database creation
  if (isProduction) {
    const sslConfig = getSSLConfig();
    if (sslConfig) {
      connectionConfig.ssl = sslConfig;
    }
  }

  const connection = await mysql.createConnection(connectionConfig);

  await connection.execute(
    `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`,
  );
  await connection.end();
  console.log("✅ Database ensured");
};

// Initialize Sequelize connection
const initializeSequelize = async (): Promise<Sequelize> => {
  if (sequelizeReady) {
    return sequelize;
  }

  if (pendingInitialization) {
    return pendingInitialization;
  }

  pendingInitialization = (async () => {
    await initDatabase();

    try {
      await sequelize.authenticate();
      console.log("✅ Sequelize connected to MySQL!");
      sequelizeReady = true;
    } catch (error) {
      console.error("❌ Sequelize connection failed:", error);
      throw error;
    }

    return sequelize;
  })();

  return pendingInitialization;
};

// Start initialization
initializeSequelize();

// Export a getter function
export const getSequelize = async (): Promise<Sequelize> =>
  initializeSequelize();

// Export the Sequelize instance for models
export { sequelize };