'use strict';

const wantedItems = require('../config/shopItems.json');
const {ShopItem, ShopItemOption, ShopItemPicture} = require('../models/index.js');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for(const wantedItem of wantedItems) {
      const shopItem = (await ShopItem.findOrCreate({
        where: { label: wantedItem.label },
        defaults: { price: wantedItem.price, description: wantedItem.description }
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
      for(let picture of wantedItem.pictures){
        if(typeof picture === "string"){
          picture = {url: picture};
        }
        await ShopItemPicture.findOrCreate({
          where: { url: picture.url, ShopItemId: shopItem.id },
          defaults: { label: picture.label }
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
