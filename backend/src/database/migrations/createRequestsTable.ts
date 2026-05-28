
import { QueryInterface, DataTypes } from 'sequelize';

exports = {
  up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
    await queryInterface.createTable('requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: {
        type: Sequelize.ENUM('access', 'software', 'hardware', 'leave', 'budget', 'other'),
        defaultValue: 'other',
        allowNull: false,
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium',
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(
          'submitted', 'pending', 'approved', 'rejected',
          'clarification_needed', 'closed', 'reopened', 'cancelled'
        ),
        defaultValue: 'submitted',
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      managerId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      adminId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      clarificationRequest: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      clarificationResponse: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reopenReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      submittedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      rejectedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      closedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      reopenedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      editedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      resubmittedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('requests', ['userId']);
    await queryInterface.addIndex('requests', ['managerId']);
    await queryInterface.addIndex('requests', ['status']);
    await queryInterface.addIndex('requests', ['category']);
    await queryInterface.addIndex('requests', ['priority']);
    await queryInterface.addIndex('requests', ['createdAt']);
  },

  down: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
    await queryInterface.dropTable('requests');
  },
};