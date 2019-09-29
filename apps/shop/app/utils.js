function requireLogin(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else {
    res.redirect(`http://localhost:89/?redirectBack=${req.originalUrl}`);
  }
}

module.exports = {
  requireLogin
}