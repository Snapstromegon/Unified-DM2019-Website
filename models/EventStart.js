const Sequelize = require('sequelize');

module.exports = class EventStart extends Sequelize.Model {
  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        actName: {
          type: DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        started: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: true
        },
        orderPosition: DataTypes.NUMBER
      },
      {
        sequelize
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.EventCategory);
    this.belongsToMany(models.Registrant, { through: 'EventStartRegistrants' });
    this.hasMany(models.EventStartMusic);
  }
};
