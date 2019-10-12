const Sequelize = require('sequelize');

module.exports = class Event extends Sequelize.Model {
  
  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        label: DataTypes.STRING
      },
      {
        sequelize
      }
    );
  }

  static associate(models) {
    this.hasMany(models.EventCategory);
  }
};
