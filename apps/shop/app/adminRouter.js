var express = require('express');
var router = express.Router();
const { requireRole } = require('./utils.js');

const {
  User,
  Registrant,
  ShopOrder,
  ShopOrderItemSelection,
  ShopItemOption,
  ShopItemPicture,
  ShopItem
} = require('../../../models/index.js');

/* GET user profile. */
router.use(
  '/payment',
  requireRole('Payment'),
  require('./admin/paymentRouter.js')
);

router.use(
  '/handout',
  requireRole('Handout'),
  require('./admin/handoutRouter.js')
);

router.use(
  '/orders/delete/:id',
  requireRole('OrderManager'),
  async (req, res) => {
    const order = await ShopOrder.findByPk(parseInt(req.params.id), {
      include: [ShopOrderItemSelection]
    });
    for (const selection of order.ShopOrderItemSelections) {
      await selection.destroy();
    }
    await order.destroy();
    res.redirect('/admin/listAll');
  }
);

router.get(
  '/listAll',
  requireRole('Payment', 'Handout', 'Summary'),
  async (req, res) => {
    const users = await User.findAll({
      subQuery: false,
      include: [
        {
          model: ShopOrder,
          required: true
        },
        Registrant
      ]
    });
    for (const user of users) {
      user.orders = await ShopOrder.findAllIncludingItems({
        where: {
          UserId: user.id
        }
      });
    }
    res.render('pages/admin/listAll.njk', { req, users });
  }
);

router.get(
  '/stats',
  requireRole('Payment', 'Handout', 'Summary'),
  async (req, res) => {
    const stats = {};
    const items = await ShopItem.findAll({
      include: [
        {
          model: ShopItemOption,
          include: [
            {
              model: ShopOrderItemSelection,
              required: true,
              include: [ShopOrder]
            }
          ],
          required: true
        }
      ]
    });

    const orders = await ShopOrder.findAll({
      where: { hasToBePaid: true },
      include: [ShopOrderItemSelection]
    });

    stats.orderCount = orders.length;
    stats.paidOrderCount = orders.reduce(
      (prev, order) => prev + (order.isPayed ? 1 : 0),
      0
    );
    stats.handedOutOrderCount = orders.reduce(
      (prev, order) => prev + (order.isHandedOut ? 1 : 0),
      0
    );

    stats.shirtCount = orders.reduce(
      (prev, order) =>
        prev +
        order.ShopOrderItemSelections.reduce(
          (prev, selection) => prev + selection.count,
          0
        ),
      0
    );
    stats.paidShirtCount = orders.reduce(
      (prev, order) =>
        prev +
        (order.isPayed
          ? order.ShopOrderItemSelections.reduce(
              (prev, selection) => prev + selection.count,
              0
            )
          : 0),
      0
    );
    stats.handedOutShirtCount = orders.reduce(
      (prev, order) =>
        prev +
        (order.isHandedOut
          ? order.ShopOrderItemSelections.reduce(
              (prev, selection) => prev + selection.count,
              0
            )
          : 0),
      0
    );

    res.render('pages/admin/stats.njk', { req, stats, items });
  }
);

router.post('/addOrder', requireRole('Admin'), async (req, res, next) => {
  let order = new ShopOrder();
  await order.save();

  for (const selectOption in req.body.selectOption) {
    const optionCount = parseInt(req.body.selectOption[selectOption]);
    if (optionCount > 0) {
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
    }
  }
  order.hasToBePaid = true;
  const user = (await Registrant.findOne({
    where: { iufId: req.body.iufId },
    include: [User]
  })).User;
  order.setUser(user);
  await order.save();
  next();
});

router.all('/addOrder', requireRole('Admin'), async (req, res) => {
  const shopItems = await ShopItem.findAll({
    include: [
      {
        model: ShopItemOption,
        order: [['id', 'ASC']]
      },
      ShopItemPicture
    ]
  });
  res.render('pages/admin/addOrder.njk', {
    shopItems,
    req
  });
});

module.exports = router;
