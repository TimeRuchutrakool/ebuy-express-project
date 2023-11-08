const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const {
  removeItemInCartSchema,
  cartItemValidator,
} = require("../validators/cart-validators");

const cartProductObject = (product) => {
  return {
    id: product.productId,
    name: product.product.name,
    description: product.product.description,
    price: product.product.price,
    brands: product.product.brands.name,
    sellerFirstName: product.product.users.firstName,
    sellerLastName: product.product.users.lastName,
    profileImageUrl: product.product.users.profileImage,
    productImageUrl: product?.product.ProductImage[0].imageUrl,
    amount: product.amount,
    colorId: product.color.id,
    colorName: product.color.name,
    shoeSizeId: product.shoeSize?.id,
    shoeSizeName: product.shoeSize?.name,
    shirtSizeId: product.shirtSize?.id,
    shirtSizeName: product.shirtSize?.name,
    pantSizeId: product.pantSize?.id,
    pantSizeName: product.pantSize?.name,
    cartItemId: product.id,
  };
};

const findCartProductCond = () => {
  return {
    include: {
      product: {
        select: {
          name: true,
          description: true,
          price: true,
          brands: {
            select: {
              name: true,
            },
          },
          users: {
            select: {
              firstName: true,
              lastName: true,
              profileImage: true,
            },
          },
          ProductImage: {
            select: {
              imageUrl: true,
            },
          },
        },
      },
      color: true,
      shoeSize: true,
      shirtSize: true,
      pantSize: true,
    },
  };
};

exports.getCartItem = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    const getCartItem = await prisma.cartItem.findMany({
      where: {
        buyerId: +userId,
      },
      ...findCartProductCond(),
    });
    if (getCartItem.length === 0) {
      res.status(200).json({ cartItem: [] });
    } else {
      const cartItem = getCartItem.map((product) => {
        return cartProductObject(product);
      });
      res.status(200).json({ cartItem });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//////////////////////////////////////////////////////////////////////
exports.addCartItems = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { value, error } = cartItemValidator.validate(req.body);

    if (error) {
      return next(error);
    }

    let cartItem = await prisma.cartItem.findFirst({
      where: {
        buyerId: userId,
        productId: +value.productId,
        colorId: +value.colorId,
        shirtSizeId: +value?.shirtSizeId,
        shoeId: +value?.shoeId,
        pantSizeId: +value?.pantSizeId,
      },
    });

    if (!cartItem) {
      cartItem = await prisma.cartItem.create({
        data: {
          productId: +value.productId,
          amount: 1,
          buyerId: userId,
          colorId: +value.colorId,
          shirtSizeId: +value?.shirtSizeId,
          shoeId: +value?.shoeId,
          pantSizeId: +value?.pantSizeId,
        },
        ...findCartProductCond(),
      });
    } else {
      cartItem = await prisma.cartItem.update({
        where: {
          id: cartItem.id,
        },
        data: {
          amount: {
            increment: 1,
          },
        },
        ...findCartProductCond(),
      });
    }

    res.status(200).json({ cartItem: cartProductObject(cartItem) });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

module.exports.amountUpdateCartItem = async (req, res, next) => {
  try {
    const { method, cartItemId } = req.query;
    const increaseOrDecrease =
      method === "increase" ? { increment: 1 } : { decrement: 1 };

    let cartItem = await prisma.cartItem.findFirst({
      where: {
        id: +cartItemId,
      },
    });

    cartItem = await prisma.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: {
        amount: increaseOrDecrease,
      },
    });

    res.json({ cartItem });
  } catch (error) {
    next(error);
  }
};

//////////////////////////// Remove Product from Cart //////////////////////////////
exports.removeItem = async (req, res, next) => {
  try {
    const { value, error } = removeItemInCartSchema.validate(req.params);
    if (error) {
      return next(createError("Can not remove Item", 400));
    }

    await prisma.cartItem.delete({
      where: {
        id: +value.cartItemId,
      },
    });
    res.status(200).json({ message: "Remove Success" });
  } catch (error) {
    next(error);
  }
};


//////////// Payout /////////////
exports.checkoutPayment = async (req,res,next) =>{
  try {
    // Stripe process
    
  } catch (error) {
    next(error)
  }
}
