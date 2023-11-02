const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinaryServices");
const {
  checkProductSchema,
  checkProductVariantSchema,
  checkProductForEdit
} = require("../validators/product-validator");
const { create } = require("domain");

exports.createProduct = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const { value, error } = checkProductSchema.validate(req.body);

    if (error) {
      return next(createError("Incorrect information", 400));
    }

    const {
      name,
      price,
      description,
      typeId,
      brandId,
      categoryId,
      sizeAndStock,
    } = value;
    const product = await prisma.product.create({
      data: {
        sellerId,
        name,
        price,
        description,
        typeId,
        brandId,
        categoryId,
      },
    });

    if (!req.files) {
      next(createError("product image is required", 400));
    }

    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const url = await upload(path);
      urls.push(url);
      fs.unlink(path);
    }

    const images = [];
    for (const image of urls) {
      images.push({ imageUrl: image, productId: product.id });
    }

    await prisma.productImage.createMany({
      data: images,
    });

    // createProductVariant

    const productVariantArray = JSON.parse(sizeAndStock);

    if (productVariantArray.length) {
      const { value, error } = checkProductVariantSchema.validate(productVariantArray);

      if (error) {
        return next(createError("Incorrect information", 400));
      }

      for (const optional of productVariantArray) {
        optional.productId = product.id;
      }

      await prisma.productVariant.createMany({
        data: productVariantArray,
      });
    }

    res.status(201).json({ message: "Success" });
  } catch (err) {
    next(err);
  }
};

///////////////////// แก้ไขรายการสินค้า /////////////////////
exports.editProduct = async (req,res,next)=>{
  try {
    const sellerId = req.user.id;
    const productId = req.params
    const product = req.body

    const obj=[{id : 1,imageUrl : "https://res.cloudinary.com/db3ltztig/image/upload/v1698824849/kt27ora01d8svi1liblj.jpg",productId : 10,bidProductId : null}]
   
    // console.log(req.body)
    const {value,error} = checkProductSchema.validate(product)
  
    if (error) {
      return next(createError("Incorrect information", 400));
    }

    const {name,price,description,typeId,brandId,categoryId,sizeAndStock} = value;
   
    await prisma.product.update({
      where : {
        id : +productId.id
      },
      data : {
        sellerId,
        name,
        price,
        description,
      }
    });

    if (!req.files) {
      next(createError("product image is required", 400));
    }

    const urls = [];
    const files = req.files;
    for(const file of files)
    {
      const {path} = file
      const url = await upload(path);
      urls.push(url);
      fs.unlink(path)
    }
    const images = [];
    for (const image of urls) {
      images.push({ imageUrl: image, productId: productId.id });
    }

 const {productImage} = req.body

 const parseProductImage = JSON.parse(productImage)

    console.log(objImage)
    

    const newParseProductImage = parseProductImage.map(async (el,idx) => {
     const returnValue = {...el}
     returnValue.imageUrl = images[idx]

     await prisma.productImage.update({
      where: returnValue.id,
      data:returnValue
     })
    });



     // let imagePromise = []
    // await Promise.all(imagePromise)

    // await prisma.productImage.updateMany({
    //   where : {
    //     productId : productId.id
    //   },
    //   data: {imageUrl: },
    // });
     
    
    // const productVariantArray = JSON.pase(sizeAndStock);

    // if (productVariantArray.length) {
    //   const { value, error } = checkProductVariantSchema.validate(productVariantArray);
      
    //   console.log(error)
    //   if (error) {
    //     return next(createError("Incorrect information", 400));
    //   }

    //   for (const optional of productVariantArray) {
    //     optional.productId = product.id;
    //   }

    //   await prisma.productVariant.updateMany({
    //     data: productVariantArray,
    //   });
    // }

    res.status(201).json({ message: "Success", updateProductImages });

  } catch (error) {
    console.log(error)
    next(error)
  }
}