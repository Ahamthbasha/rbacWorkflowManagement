import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import path from 'path';
import { getSequelize } from '../config/database';

// Don't create a new Sequelize instance - use the one from your app
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
      glob: path.join(__dirname, '../database/migrations/*.{ts,js}'),
      resolve: ({ name, path: migrationPath, context }) => {
        if (!migrationPath) {
          throw new Error(`Migration path is undefined for migration: ${name}`);
        }
        
        // Handle both .ts and .js files (compiled TypeScript)
        let migration: any;
        try {
          migration = require(migrationPath);
        } catch (error) {
          // Try with .js extension for production (compiled files)
          const jsPath = migrationPath.replace(/\.ts$/, '.js');
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
    console.log('📋 Checking for pending migrations...');
    const umzug = await createUmzug();
    
    // Get pending migrations
    const pendingMigrations = await umzug.pending();
    
    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations. Database is up to date.');
      return;
    }
    
    console.log(`📋 Found ${pendingMigrations.length} pending migration(s):`);
    pendingMigrations.forEach(m => console.log(`   - ${m.name}`));
    
    // Run migrations
    console.log('🔄 Running migrations...');
    const results = await umzug.up();
    
    console.log(`✅ Migrations completed successfully! Ran ${results.length} migration(s).`);
    results.forEach(result => console.log(`   ✓ ${result.name}`));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

const rollbackLastMigration = async () => {
  try {
    console.log('🔄 Rolling back last migration...');
    const umzug = await createUmzug();
    const results = await umzug.down({ to: 0 });
    console.log(`✅ Rolled back ${results.length} migration(s)`);
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};

// Run directly if called from command line (for manual migration runs)
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'rollback') {
    rollbackLastMigration()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Rollback failed:', error);
        process.exit(1);
      });
  } else {
    runMigrations()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
      });
  }
}

export { runMigrations, rollbackLastMigration, createUmzug };