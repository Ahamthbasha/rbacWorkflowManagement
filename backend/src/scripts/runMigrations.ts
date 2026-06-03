import { Sequelize } from "sequelize";
import { Umzug, SequelizeStorage } from "umzug";
import path from "path";
import { getSequelize } from "../config/database";

let sequelize: Sequelize | null = null;

const getSequelizeInstance = async () => {
  if (!sequelize) {
    sequelize = await getSequelize();
  }
  return sequelize;
};

const createUmzug = async () => {
  const sequelizeInstance = await getSequelizeInstance();

  return new Umzug({
    migrations: {
      glob: path.join(__dirname, "../database/migrations/*.{ts,js}"),
      resolve: ({ name, path: migrationPath, context }) => {
        if (!migrationPath) {
          throw new Error(`Migration path is undefined for migration: ${name}`);
        }

        let migration: any;
        try {
          migration = require(migrationPath);
        } catch (error) {
          const jsPath = migrationPath.replace(/\.ts$/, ".js");
          migration = require(jsPath);
        }

        return {
          name,
          up: async () => {
            if (migration.up) {
              await migration.up(context, Sequelize);
            } else {
              throw new Error(`Migration ${name} has no 'up' method`);
            }
          },
          down: async () => {
            if (migration.down) {
              await migration.down(context, Sequelize);
            }
          },
        };
      },
    },
    context: sequelizeInstance.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize: sequelizeInstance }),
    logger: console,
  });
};

const runMigrations = async () => {
  try {
    console.log("Checking for pending migrations...");
    const umzug = await createUmzug();

    const pendingMigrations = await umzug.pending();

    if (pendingMigrations.length === 0) {
      console.log("No pending migrations. Database is up to date.");
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migration(s):`);
    pendingMigrations.forEach((m) => console.log(`   - ${m.name}`));

    console.log("Running migrations...");
    const results = await umzug.up();

    console.log(
      `Migrations completed successfully! Ran ${results.length} migration(s).`,
    );
    results.forEach((result) => console.log(`   ${result.name}`));
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

const rollbackLastMigration = async () => {
  try {
    console.log("Rolling back last migration...");
    const umzug = await createUmzug();
    const results = await umzug.down({ to: 0 });
    console.log(`Rolled back ${results.length} migration(s)`);
  } catch (error) {
    console.error("Rollback failed:", error);
    throw error;
  }
};

if (require.main === module) {
  const command = process.argv[2];

  if (command === "rollback") {
    rollbackLastMigration()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error("Rollback failed:", error);
        process.exit(1);
      });
  } else {
    runMigrations()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error("Migration failed:", error);
        process.exit(1);
      });
  }
}

export { runMigrations, rollbackLastMigration, createUmzug };
