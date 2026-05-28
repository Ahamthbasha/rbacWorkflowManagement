
import { QueryInterface, DataTypes } from 'sequelize';

exports = {
  up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
    await queryInterface.createTable('request_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      requestId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'requests',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      oldStatus: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      newStatus: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      changedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      action: {
        type: Sequelize.ENUM(
          'create', 'edit', 'resubmit', 'status_change',
          'clarification_requested', 'clarification_responded', 'reopen'
        ),
        allowNull: false,
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes
    await queryInterface.addIndex('request_logs', ['requestId']);
    await queryInterface.addIndex('request_logs', ['changedBy']);
    await queryInterface.addIndex('request_logs', ['timestamp']);
  },

  down: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
    await queryInterface.dropTable('request_logs');
  },
};