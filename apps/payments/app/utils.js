function requireLogin(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else {
    res.redirect(`${config.loginUrl}/?redirectBack=${config.payments.url}${req.originalUrl}`);
  }
}

function requireRole(...roles) {
  return function (req, res, next) {
    if(req.user.hasRole(...roles)){
      next();
    } else {
      res.status(403).end();
    }
  }
}

module.exports = {
  requireLogin,
  requireRole
}