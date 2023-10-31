const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const {removeItemInCartSchema} = require('../validators/cart-validators')

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


//////////////////////////// Remove Product from Cart //////////////////////////////
exports.removeItem = async (req,res,next)=>{
  try {
    const {value , error} = removeItemInCartSchema.validate(req.params)
    // const removeItem = req.params.removeItem
    const {id:userId} = req.user
    if(error)
    {
      return next(createError('Can not remove Item',400))
    }


    await prisma.cartItem.deleteMany({
      where : {
        buyerId: userId,
        productId: +value.removeItem,
      }
    })
    res.status(200).json({message : "Remove Success"})
  } catch (error) {
    next(error)
  }
}