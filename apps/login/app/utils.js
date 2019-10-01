function requireLogin(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else {
    res.redirect(`/?redirectBack=${req.originalUrl}`);
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if(req.user.hasRole(role)){
      next();
    }
    res.status(403).end();
  }
}

module.exports = {
  requireLogin,
  requireRole
}