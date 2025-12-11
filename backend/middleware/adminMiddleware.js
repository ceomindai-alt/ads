module.exports = function(req, res, next) {
  if (!req.user || req.user.accountType !== 'admin') {
    return res.status(403).json({ message: 'Admin required' });
  }
  next();
}
