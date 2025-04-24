'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM "User" WHERE role='student';`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    const internships = await queryInterface.sequelize.query(
      `SELECT id FROM "Internship";`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    const statuses = ['pending', 'approved', 'rejected'];
    const applications = [];

    const minCount = Math.min(users.length, internships.length);

    for (let i = 0; i < minCount; i++) {
      applications.push({
        studentId: users[i].id,
        internshipId: internships[i].id,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        appliedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return queryInterface.bulkInsert('Application', applications, {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Application', null, {});
  }
};

