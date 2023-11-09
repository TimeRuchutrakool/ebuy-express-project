const prisma = require("../models/prisma");
const { upload } = require("../utils/cloudinaryServices");
const fs = require("fs/promises");
const createError = require("../utils/create-error");

exports.updateProfileImage = async (req, res, next) => {
  try {
    const user = req.user;

    if (!req.file) {
      return next(createError("profile image is required"));
    }

    console.log(req.file);
    const updateImage = {};
    if (req.file) {
      const url = await upload(req.file.path);
      updateImage.profileImage = url;
      await prisma.user.update({
        data: {
          profileImage: url,
        },
        where: {
          id: user.id,
        },
      });
      if (req.file) {
        const url = await upload(req.file.path);
        updateImage.profileImage = url;
        await prisma.user.update({
          data: {
            profileImage: url,
          },
          where: {
            id: user.id,
          },
        });
      }

      res.status(200).json(updateImage);
    }
  } catch (error) {
    next(error);
  } finally {
    if (req.file) {
      fs.unlink(req.file.path);
    }
  }
};

exports.editProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const updateInfo = req.body;
    const userData = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: updateInfo,
      select: {
        firstName: true,
        lastName: true,
        address: true,
        email: true,
      },
    });

    res.status(200).json({ userData });
  } catch (error) {
    next(error);
  }
};

exports.getMystore = async (req, res, next) => {
  try {
    const user = req.user;
    const product = await prisma.product.findMany({
      where: {
        sellerId: user.id,
      },
      include: {
        ProductImage: true,
        ProductVariant: true,
      },
    });

    const store = product.map((el) => {
      return {
        id: el.id,
        name: el.name,
        description: el.description,
        price: el.price,
        imageUrl: el.ProductImage[0].imageUrl,
        typeId: el.typeId,
        brandId: el.brandId,
        categoryId: el.categoryId,
        ProductVariant: el.ProductVariant,
      };
    });
    res.status(200).json({ myStore: store });
  } catch (error) {
    next(error);
  }
};
exports.getMyBidProducts = async (req,res,next)=>{
  try {
        const userId = req.user.id
        
        const findBidProduct = await prisma.bidProduct.findMany({
          where :{
            sellerId : userId
          },include : {
            ProductImage : true
          }
          
        })
       
        
        const data = findBidProduct.map( (el)=> {
          return {
            id : el.id,
            name :el.name,
            description : el.description,
            price : el.initialPrice,
            timeStart :el.startedAt,
            timeDuration : el.duration,
            imageUrl : el.ProductImage[0]
          }
        })
        console.log(data)
    res.status(200).json({myBidProduct : data})
  } catch (err) {
    next(err)
  }
}
exports.editAddress = async (req, res, next) => {
  try {
    const { id } = req.user;
    const obj = req.body;
    const updatedAddress = await prisma.address.updateMany({
      where: {
        userId: id,
      },
      data: { ...obj },
    });
    console.log(updatedAddress);
    res.json({ updatedAddress });
  } catch (error) {
    next(error);
  }
};
