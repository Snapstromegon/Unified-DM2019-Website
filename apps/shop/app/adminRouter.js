var express = require('express');
var router = express.Router();
const { requireRole,requireOneOfRoles } = require('./utils.js');

const {
  User,
  Registrant,
  ShopOrder,
  ShopOrderItemSelection
} = require('../../../models/index.js');

/* GET user profile. */
router.use('/payment', requireRole('Payment'), require('./admin/paymentRouter.js'));

router.use('/handout', requireRole('Handout'), require('./admin/handoutRouter.js'));

router.use('/orders/delete/:id', requireRole('OrderManager'), async (req, res) => {
  const order = await ShopOrder.findByPk(parseInt(req.params.id), {include: [ShopOrderItemSelection]});
  for(const selection of order.ShopOrderItemSelections){
    await selection.destroy();
  }
  await order.destroy();
  res.redirect('/admin/listAll');
});

router.get('/listAll', requireOneOfRoles('Payment', 'Handout'), async (req, res) => {
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
});

module.exports = router;
