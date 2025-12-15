const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // STANDARDIZE USER OBJECT
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      accountType: decoded.accountType
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalid" });
  }
};
