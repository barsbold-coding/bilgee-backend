'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM "User" WHERE role='student' LIMIT 3;`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    const resumes = users.map((user, index) => ({
      studentId: user.id,
      title: `Resume Title ${index + 1}`,
      summary: `This is a sample summary for user ${user.id}.`,
      skills: 'JavaScript, Node.js, SQL',
      languages: 'English',
      certifications: 'Certified Developer',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    return queryInterface.bulkInsert('Resume', resumes, {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Resume', null, {});
  },
};

