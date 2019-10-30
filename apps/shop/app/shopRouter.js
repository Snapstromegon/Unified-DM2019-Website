const express = require('express');
const { requireLogin, requireRole } = require('./utils.js');

const router = express.Router();
const {
  ShopItem,
  ShopItemOption,
  ShopOrder,
  ShopOrderItemSelection,
  ShopItemPicture
} = require('../../../models/index.js');

router.get('/', async (req, res) => {
  res.render('pages/listItems.njk', {
    req,
    shopItems: await ShopItem.findAll({ where: {}, include:[ShopItemPicture] })
  });
});

router.get('/orderItem/:itemId', async (req, res) => {
  const shopItem = await ShopItem.findByPk(req.params.itemId, {
    include: [
      {
        model: ShopItemOption,
        order: [['id', 'ASC']]
      }, ShopItemPicture
    ]
  });
  let counts = {};
  if (req.session && req.session.shop && req.session.shop.cartOrder) {
    const order = await ShopOrder.findByPk(req.session.shop.cartOrder, {
      include: [
        {
          model: ShopOrderItemSelection,
          include: [
            {
              model: ShopItemOption,
              where: {
                ShopItemId: shopItem.id
              },
              required: true
            }
          ],
          required: true
        }
      ]
    });
    if (order) {
      for (const orderItemSelection of order.ShopOrderItemSelections) {
        counts[orderItemSelection.ShopItemOptionId] = orderItemSelection.count;
      }
    }
  }
  res.render('pages/orderItem.njk', {
    shopItem,
    counts,
    req
  });
});

router.post('/shoppingCart', async (req, res, next) => {
  let order;
  req.session.shop = req.session.shop || {};
  if (req.session.shop.cartOrder) {
    order = await ShopOrder.findByPk(req.session.shop.cartOrder, {
      include: [ShopOrderItemSelection]
    });
  } else {
    order = new ShopOrder();
    await order.save();
    req.session.shop.cartOrder = order.id;
  }

  for (const selectOption in req.body.selectOption) {
    const optionCount = parseInt(req.body.selectOption[selectOption]);
    const option = await ShopItemOption.findByPk(
      parseInt(selectOption.substr(1))
    );
    const orderItemSelection = (await ShopOrderItemSelection.findOrCreate({
      where: {
        ShopOrderId: order.id,
        ShopItemOptionId: option.id
      }
    }))[0];
    orderItemSelection.count = optionCount;
    await orderItemSelection.save();
    if (orderItemSelection.count <= 0) {
      await orderItemSelection.destroy();
    }
  }
  next();
});

router.all('/shoppingCart', async (req, res) => {
  let order;
  if (req.session.shop && req.session.shop.cartOrder) {
    order = await ShopOrder.findByPkIncludingItems(req.session.shop.cartOrder);
  }

  res.render('pages/shoppingCart.njk', {
    req,
    order
  });
});

router.get('/commitOrder', requireLogin, async (req, res) => {
  if (!req.session.shop || !req.session.shop.cartOrder) {
    return res.redirect('/');
  }
  const order = await ShopOrder.findByPkIncludingItems(
    req.session.shop.cartOrder
  );

  order.hasToBePaid = true;
  order.setUser(req.user);
  delete req.session.shop.cartOrder;
  await order.save();
  res.render('pages/orderConfirmation.njk', { req, order });
});

router.all('/myOrders', requireLogin, async (req, res) => {
  const orders = await ShopOrder.findAllIncludingItems({where: {UserId: req.user.id}});
  res.render('pages/userOrders.njk', { req, orders });
});


module.exports = router;
