// config/database.ts
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

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
  },
);

let sequelizeReady = false;
let pendingInitialization: Promise<Sequelize> | null = null;

// Create database if not exists
const initDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "3306"),
  });

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
