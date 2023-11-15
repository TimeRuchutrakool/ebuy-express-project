const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const {
  addWishSchema,
  removeWishSchema,
} = require("../validators/wish-validator");

exports.getWish = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const getWish = await prisma.wishItem.findMany({
      where: {
        buyerId: userId,
      },
      include: {
        product: {
          select: {
            name: true,
            price: true,
            ProductImage: {
              select: {
                imageUrl: true,
              },
            },
          },
        },
      },
    });
    const products = getWish.map((product) => {
      return {
        id: product.productId,
        name: product.product.name,
        price: product.product.price,
        imageUrl: product.product.ProductImage[0].imageUrl,
      };
    });

    res.status(200).json({ products });
  } catch (error) {
    next(error);
  }
};

// เพิ่มรายการโปรด
exports.toggleWish = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { value, error } = addWishSchema.validate(req.params);

    if (error) {
      next(error);
    }

    // เช็คว่ามี รายการโปรด หรือยัง
    let wishItem = await prisma.wishItem.findFirst({
      where: {
        buyerId: userId,
        productId: +value.productId,
      },
    });

    //ถ้ายังไม่มี ให้ cerate รายการโปรด
    if (!wishItem) {
      wishItem = await prisma.wishItem.create({
        data: {
          buyerId: userId,
          productId: +value.productId,
        },
      });
      res.status(200).json({ isWish: true });
    } else {
      await prisma.wishItem.deleteMany({
        where: {
          buyerId: userId,
          productId: +value.productId,
        },
      });
      res.status(200).json({ isWish: false });
    }
  } catch (error) {
    next(error);
  }
};

module.exports.isWish = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const productId = +req.query.productId;

    const isWish = await prisma.wishItem.findFirst({
      where: {
        buyerId: userId,
        productId: productId,
      },
    });
    res.json({ isWish: isWish ? true : false });
  } catch (error) {
    next(error);
  }
};
