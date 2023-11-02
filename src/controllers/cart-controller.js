const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const { removeItemInCartSchema, addIteminCartSchema } = require("../validators/cart-validators");



exports.getCartItem = async (req,res,next)=>{
  try {
      const {id : userId} = req.user

      console.log(userId)
      // หา cart ที่ user เคย เพิ่มไว้
      const getCartItem = await prisma.cartItem.findMany({
        where : {
          buyerId : +userId,
        },
        include : {
          product : {
            select : {
              name : true,
              description : true,
              price : true,
              brands: {
                select : {
                  name : true
                }
              },
              users : {
                select : {
                  firstName : true
                }
              },
              ProductImage : {
                select : {
                  imageUrl : true
                }
              }
              
                          
            },       
            },
            color: true,
            shoeSize: true,
            shirtSize: true,
            pantSize : true
            
        },
      })

      const cartItem = getCartItem.map(product=>{
        return {
          id : product.product.productId,
          name : product.product.name,
          description : product.product.description,
          price : product.product.price,
          brands : product.product.brands.name,
          seller : product.product.users.firstName,
          imageUrl : product?.product.ProductImage[0].imageUrl,
          amount : product.amount,
          color : product.color.name,
          shoeSize : product.shoeSize?.name,
          shirtSize : product.shirtSize?.name,
          pantSize : product.pantSize?.name

        }
      })

      // ถ้า user ไม่มี cartItem
      if(getCartItem.length === 0 )
      {
        res.status(400).json({message : 'No item in cart'})
      }

      res.status(200).json({cartItem})
  } catch (error) {
    console.log(error)
    next(error)
  }
}

//////////////////////////////////////////////////////////////////////
exports.addCartItems = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    // const { productId, amount } = req.body;
      const {value,error} = addIteminCartSchema.validate(req.body)

        console.log(error)
      if(error)
      {
        return next(error)
      }

      

    let cartItem = await prisma.cartItem.findFirst({
      where: {
        buyerId: userId,
        productId: +value.productId,
        colorId : +value.colorId,
        shirtSizeId : +value?.shirtSizeId,
        shoeId : +value?.shoeId,
        pantSizeId : +value?.pantSizeId

      },
    });

    if (!cartItem) {
      cartItem = await prisma.cartItem.create({
        data: {
          productId: +value.productId,
          amount: +value.amount,
          buyerId: userId,
          colorId : +value.colorId,
          shirtSizeId : +value?.shirtSizeId,
          shoeId : +value?.shoeId,
          pantSizeId : +value?.pantSizeId
        },
      });
    } else {
      cartItem = await prisma.cartItem.update({
        where: {
          id: cartItem.id,
        },
        data: {
          amount: {
            increment: +value.amount,
          },
        },
      });
    }
    res.status(200).json({ cartItem });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//////////////////////////// Remove Product from Cart //////////////////////////////
exports.removeItem = async (req, res, next) => {
  try {
    const { value, error } = removeItemInCartSchema.validate(req.params);
    // const removeItem = req.params.removeItem
    const { id: userId } = req.user;
    if (error) {
      return next(createError("Can not remove Item", 400));
    }

    await prisma.cartItem.deleteMany({
      where: {
        buyerId: userId,
        productId: +value.removeItem,
      },
    });
    res.status(200).json({ message: "Remove Success" });
  } catch (error) {
    next(error);
  }
};
