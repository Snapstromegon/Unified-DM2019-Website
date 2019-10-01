const Sequelize = require('sequelize');
const argon2 = require('argon2');

module.exports = class ShopItemPicture extends Sequelize.Model {

  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        url: { type: DataTypes.STRING, allowNull: false },
        label: { type: DataTypes.STRING }
      },
      {
        sequelize
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.ShopItem);
  }
};
