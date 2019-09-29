const Sequelize = require('sequelize');
const argon2 = require('argon2');

module.exports = class ShopOrderItemSelection extends Sequelize.Model {
  
  async getTotalPrice() {
    return (await this.getShopItemOption()).getTotalPrice() * this.count;
  }

  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        count: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
          allowNull: false
        }
      },
      {
        sequelize
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.ShopOrder);
    this.belongsTo(models.ShopItemOption);
  }
};
