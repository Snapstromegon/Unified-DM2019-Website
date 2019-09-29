const Sequelize = require('sequelize');
const argon2 = require('argon2');

module.exports = class ShopOrder extends Sequelize.Model {
  async getTotalPrice() {
    const orderItemSelections = await this.getOrderItemSelections();
    const subTotals = await Promise.all(
      orderItemSelections.map(orderItemSelection =>
        orderItemSelection.getTotalPrice()
      )
    );
    return subTotals.reduce((prev, curr) => prev + curr);
  }

  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {},
      {
        sequelize
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User);
    this.hasMany(models.ShopOrderItemSelection);
    this.hasOne(models.ShopPayment);
  }
};
