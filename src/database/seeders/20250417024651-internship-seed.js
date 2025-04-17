'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // First, find the organization user to use as employer
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM "User" WHERE role = 'organisation' LIMIT 1;`
    );
    
    // If no organization user exists, create one
    let employerId;
    
    if (users[0].length === 0) {
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      // Insert a new organization user
      const [newUser] = await queryInterface.sequelize.query(
        `INSERT INTO "User" ("id", "firstName", "lastName", "email", "phoneNumber", "password", "role", "createdAt", "updatedAt") 
         VALUES (gen_random_uuid(), 'Org', 'Company', 'org@example.com', '99887766', '${hashedPassword}', 'organisation', NOW(), NOW()) RETURNING id;`
      );
      
      employerId = newUser[0].id;
    } else {
      employerId = users[0][0].id;
    }

    // Insert internships
    await queryInterface.bulkInsert('Internship', [
      {
        employerId,
        title: 'Software Development Intern',
        description: 'Join our team as a software development intern. You will gain hands-on experience working with modern technologies and contribute to real projects.',
        location: 'Ulaanbaatar, Mongolia',
        salaryRange: '$500-$800 per month',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-08-31'),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        employerId,
        title: 'Marketing Intern',
        description: 'We are looking for a marketing intern to assist with social media management, content creation, and market research.',
        location: 'Remote',
        salaryRange: '$400-$600 per month',
        startDate: new Date('2025-05-15'),
        endDate: new Date('2025-07-15'),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Internship', null, {});
  }
};
