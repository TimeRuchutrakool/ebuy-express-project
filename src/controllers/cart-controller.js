const prisma = require("../models/prisma");

exports.addCartItems = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { productId, amount } = req.body;

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        buyerId: +userId,
        productId: +productId,
      },
    });

    if (!cartItem) {
      const createdCartItem = await prisma.cartItem.create({
        data: {
          productId: productId,
          amount: amount,
          buyerId: userId,
        },
      });
      return res.json({ createdCartItem });
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: {
        amount: {
          increment: amount,
        },
      },
    });

    // const product = await prisma.cartItem.findMany({
    //         where : {
    //             buyerId : +userId
    //         },
    //         include : {
    //             product : {
    //                 where : {
    //                     productId : productId
    //                 }
    //             }
    //         }
    // })

    res.status(200).json({updatedCartItem });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
