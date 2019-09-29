const Sequelize = require('sequelize');
const argon2 = require('argon2');

module.exports = class ShopPayment extends Sequelize.Model {
  async getTotalPrice() {
    return (await this.getOrder()).getTotalPrice();
  }

  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        isPayed: { type: DataTypes.BOOLEAN, defaultValue: false },
        hasToBePaid: { type: DataTypes.BOOLEAN, defaultValue: false }
      },
      {
        sequelize
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.ShopOrder);
  }
};
