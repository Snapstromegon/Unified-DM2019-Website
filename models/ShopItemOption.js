const Sequelize = require('sequelize');
const argon2 = require('argon2');

module.exports = class ShopItemOption extends Sequelize.Model {
  async getTotalPrice() {
    return (await this.getShopItem()).price + this.priceModificator;
  }

  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        label: { type: DataTypes.STRING, allowNull: false },
        priceModificator: { type: DataTypes.FLOAT, defaultValue: 0 }
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
