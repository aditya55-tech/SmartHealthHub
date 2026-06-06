const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Decode and verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "medinest_secret_key");

      // Attach user info to request object
      req.user = {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        isAdmin: decoded.isAdmin || false,
      };

      return next();
    } catch (error) {
      console.error("Auth middleware token error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: "Not authorized as an admin" });
  }
};

module.exports = { protect, admin };
