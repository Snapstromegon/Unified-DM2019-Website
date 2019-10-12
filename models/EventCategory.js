const Sequelize = require('sequelize');

module.exports = class EventCategory extends Sequelize.Model {
  
  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        label: DataTypes.STRING,
        actTime: DataTypes.NUMBER,
        juryTime: DataTypes.NUMBER
      },
      {
        sequelize
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.Event);
    this.hasMany(models.EventStart);
  }
};
