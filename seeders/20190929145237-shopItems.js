'use strict';

const wantedItems = require('../config/shopItems.json');
const {ShopItem, ShopItemOption} = require('../models/index.js');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for(const wantedItem of wantedItems) {
      const shopItem = (await ShopItem.findOrCreate({
        where: { label: wantedItem.label },
        defaults: { price: wantedItem.price }
      }))[0];
      for(let option of wantedItem.options){
        if(typeof option === "string"){
          option = {label: option};
        }
        await ShopItemOption.findOrCreate({
          where: { label: option.label, ShopItemId: shopItem.id },
          defaults: { priceModificator: option.priceModificator || 0 }
        });
      }
    }
  },

  down: (queryInterface, Sequelize) => {
    ShopItem.destroy({
      where: {},
      truncate: true
    });
    ShopItemOption.destroy({
      where: {},
      truncate: true
    });
  }
};
