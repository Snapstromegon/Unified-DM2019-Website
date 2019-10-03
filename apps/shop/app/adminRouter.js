var express = require('express');
var router = express.Router();
const { requireRole,requireOneOfRoles } = require('./utils.js');

const {
  User,
  Registrant,
  ShopOrder
} = require('../../../models/index.js');

/* GET user profile. */
router.use('/payment', requireRole('Payment'), require('./admin/paymentRouter.js'));

router.use('/handout', requireRole('Handout'), require('./admin/handoutRouter.js'));

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
