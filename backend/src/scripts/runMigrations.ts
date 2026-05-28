import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import path from 'path';
import config from '../config/sequelizeConfig';

const sequelize = new Sequelize(config.development);

const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, '../database/migrations/*.ts'),
    resolve: ({ name, path: migrationPath, context }) => {
      // Add check for undefined migrationPath
      if (!migrationPath) {
        throw new Error(`Migration path is undefined for migration: ${name}`);
      }
      const migration = require(migrationPath);
      return {
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const runMigrations = async () => {
  try {
    await umzug.up();
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

if (require.main === module) {
  runMigrations();
}

export { umzug, runMigrations };