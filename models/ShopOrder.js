const Sequelize = require('sequelize');
const argon2 = require('argon2');

module.exports = class ShopOrder extends Sequelize.Model {
  get totalPrice() {
    return this.ShopOrderItemSelections.map(
      orderItemSelection => orderItemSelection.totalPrice
    ).reduce((prev, curr) => prev + curr);
  }

  get itemCount() {
    return this.ShopOrderItemSelections.reduce(
      (prev, orderItemSelection) => prev + orderItemSelection.count,
      0
    );
  }

  get items() {
    const alreadyIncluded = new Set();
    return this.ShopOrderItemSelections.map(
      shopOrderItemSelection => shopOrderItemSelection.ShopItemOption.ShopItem
    ).filter(item =>
      alreadyIncluded.has(item.id)
        ? false
        : alreadyIncluded.add(item.id) || true
    );
  }

  get paymentId() {
    return `DM-${this.id}-TS`;
  }

  static findByPkIncludingItems(pk) {
    return this.findByPk(pk, {
      include: [
        {
          model: this.sequelize.models.User,
          include: [this.sequelize.models.Role]
        },
        {
          model: this.sequelize.models.ShopOrderItemSelection,
          required: true,
          include: [
            {
              model: this.sequelize.models.ShopItemOption,
              required: true,
              include: [
                {
                  model: this.sequelize.models.ShopItem,
                  required: true,
                  include: [
                    {
                      model: this.sequelize.models.ShopItemOption,
                      required: true,
                      include: [
                        {
                          model: this.sequelize.models.ShopOrderItemSelection,
                          required: true,
                          where: {
                            ShopOrderId: pk
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });
  }

  static findAllIncludingItems(search) {
    return this.findAll(search).then(orders =>
      Promise.all(orders.map(order => this.findByPkIncludingItems(order.id)))
    );
  }

  /**
   * Init Model
   * @param {Sequelize} sequelize
   * @param {Sequelize.DataTypes} DataTypes
   */
  static init(sequelize, DataTypes) {
    return super.init(
      {
        isHandedOut: { type: DataTypes.BOOLEAN, defaultValue: false },
        isPayed: { type: DataTypes.BOOLEAN, defaultValue: false },
        hasToBePaid: { type: DataTypes.BOOLEAN, defaultValue: false }
      },
      {
        sequelize
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.User);
    this.hasMany(models.ShopOrderItemSelection);
  }
};
