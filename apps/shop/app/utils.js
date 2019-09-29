const url = require('url');

function requireLogin(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else {
    const redirectBackUrl = url.format({
      protocol: req.protocol,
      hostname: req.host,
      port: config.shop.express.port,
      pathname: req.originalUrl
    })
    res.redirect(`${config.loginUrl}?redirectBack=${redirectBackUrl}`);
  }
}

module.exports = {
  requireLogin
}