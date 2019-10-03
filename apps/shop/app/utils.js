function requireLogin(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else {
    res.redirect(`${config.loginUrl}/?redirectBack=${config.shop.url}${req.originalUrl}`);
  }
}

function requireRole(role) {
  return function (req, res, next) {
    if(req.user.hasRole(role)){
      next();
    } else {
      res.status(403).end();
    }
  }
}

function requireOneOfRoles(...roles){
  return function (req, res, next) {
    if(roles.find(role => req.user.hasRole(role))){
      next();
    } else {
      res.status(403).end();
    }
  }
}

module.exports = {
  requireLogin,
  requireRole,
  requireOneOfRoles
}