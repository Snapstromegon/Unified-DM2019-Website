const Sequelize = require('sequelize');

module.exports = class Registrant extends Sequelize.Model {
  
  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        iufId: { type: Sequelize.INTEGER, allowNull: false, unique: true },
        type: { type: Sequelize.STRING, allowNull: false },
        club: DataTypes.STRING,
        email: DataTypes.STRING,
        userEmail: DataTypes.STRING
      },
      {
        sequelize
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User);
    this.belongsToMany(models.EventStart, { through: 'EventStartRegistrants' });
  }
};
