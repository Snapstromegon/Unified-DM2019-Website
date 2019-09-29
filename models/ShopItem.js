const Sequelize = require('sequelize');
const argon2 = require('argon2');

module.exports = class ShopItem extends Sequelize.Model {
  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        label: { type: DataTypes.STRING, allowNull: false }
      },
      {
        sequelize
      }
    );
  }

  static associate(models) {
    this.hasMany(models.ShopItemOption);
  }
};
