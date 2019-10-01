var express = require('express');
var router = express.Router();

const {
  User,
  ShopOrder,
  Registrant
} = require('../../../../models/index.js');

/* GET user profile. */
router.get('/listAll', async (req, res) => {
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
  res.render('pages/admin/payment/listAll.njk', { req, users });
});

module.exports = router;
