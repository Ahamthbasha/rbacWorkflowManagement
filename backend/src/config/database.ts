import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const TIMEZONE = '+05:30'; // IST timezone

const getSSLConfig = () => {
  if (!isProduction) {
    return undefined;
  }

  if (process.env.DB_SSL_CA_PATH) {
    try {
      const caCert = fs.readFileSync(process.env.DB_SSL_CA_PATH, "utf-8");
      return {
        ca: caCert,
        rejectUnauthorized: true,
      };
    } catch (error) {
      console.error("Failed to read SSL certificate:", error);
      throw error;
    }
  }

  if (process.env.DB_SSL_CA) {
    return {
      ca: process.env.DB_SSL_CA,
      rejectUnauthorized: true,
    };
  }

  return {
    rejectUnauthorized: false,
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
    timezone: TIMEZONE, // Set timezone for Sequelize
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      // MySQL timezone configuration
      timezone: TIMEZONE,
      // Important: Return dates as strings to avoid conversion issues
      dateStrings: true,
      typeCast: true,
      ...(isProduction && {
        ssl: getSSLConfig(),
      }),
    },
  },
);

let sequelizeReady = false;
let pendingInitialization: Promise<Sequelize> | null = null;

const initDatabase = async () => {
  const connectionConfig: any = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "3306"),
  };

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
      
      // Set MySQL session timezone to IST
      await sequelize.query(`SET SESSION time_zone = '${TIMEZONE}'`);
      console.log(`✅ MySQL session timezone set to ${TIMEZONE}`);
      
      // Verify timezone is set correctly - FIXED: added backticks around reserved word 'current_time'
      const [result] = await sequelize.query("SELECT NOW() as `current_time`, @@session.time_zone as `timezone`");
      console.log("✅ MySQL current time:", result);
      
      sequelizeReady = true;
    } catch (error) {
      console.error("Sequelize connection failed:", error);
      throw error;
    }

    return sequelize;
  })();

  return pendingInitialization;
};

// Initialize the database connection
initializeSequelize();

export const getSequelize = async (): Promise<Sequelize> => {
  // Ensure timezone is set on each connection
  const sequelizeInstance = await initializeSequelize();
  
  // Set timezone again for this connection (good practice)
  try {
    await sequelizeInstance.query(`SET SESSION time_zone = '${TIMEZONE}'`);
  } catch (error) {
    console.warn("Failed to set timezone on connection:", error);
  }
  
  return sequelizeInstance;
};

export { sequelize };