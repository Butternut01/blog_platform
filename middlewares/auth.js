function ensureAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.status(401).send('Access Denied');
    }
    next();
}
  
  function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
      return next();
    }
    return res.status(403).send('Access Denied');
  }
  
  function isOwnerOrAdmin(req, res, next) {
    if (
      req.session.user &&
      (req.session.user.role === 'admin' || req.session.user._id === req.params.id)
    ) {
      return next();
    }
    return res.status(403).send('Access Denied');
  }
  
  module.exports = { ensureAuthenticated, isAdmin, isOwnerOrAdmin };
  