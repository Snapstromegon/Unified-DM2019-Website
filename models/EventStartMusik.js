const Sequelize = require('sequelize');

module.exports = class EventStartMusic extends Sequelize.Model {
  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        filepath: DataTypes.STRING,
        originalFilename: DataTypes.STRING,
        uploaded: DataTypes.DATE
      },
      {
        sequelize
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.EventStart);
    this.belongsTo(models.Registrant);
  }
};
