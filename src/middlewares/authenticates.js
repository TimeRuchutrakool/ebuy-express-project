const createError = require("../utils/create-error");
const jwt = require("jsonwebtoken");
const prisma = require("../models/prisma");

module.exports = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return next(createError("unauthenticated", 401));
    }

    const token = authorization.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      include: {
        Address: true,
      },
    });

    if (!user) {
      return next(createError("unautheticated", 401));
    }

    delete user.password;
    user.address = user.Address
    delete user.Address
    req.user = user;
    
    next();
  } catch (error) {
    if (
      error.name === "TokenExpireError" ||
      error.name === "JsonWebTokenError"
    ) {
      error.statusCode = 401;
    }
    next(error);
  }
};
