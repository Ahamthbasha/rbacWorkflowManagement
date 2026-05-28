'use strict';
import { QueryInterface, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';

module.exports = {
  up: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    await queryInterface.bulkInsert('users', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        department: 'IT',
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Manager User',
        email: 'manager@example.com',
        password: hashedPassword,
        role: 'manager',
        department: 'IT',
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Regular User',
        email: 'user@example.com',
        password: hashedPassword,
        role: 'user',
        department: 'IT',
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface: QueryInterface, Sequelize: typeof DataTypes) => {
    await queryInterface.bulkDelete('users', {});
  },
};