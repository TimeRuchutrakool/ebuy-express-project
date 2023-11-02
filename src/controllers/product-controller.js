const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinaryServices");
const {
  checkProductSchema,
  checkProductVariantSchema,
  checkProductIdSchema
} = require("../validators/product-validator");
const { create } = require("domain");
const { date } = require("joi");
const { off } = require("process");
const { isNull } = require("util");

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

    if (productVariantArray) {
      const { value, error } =
        checkProductVariantSchema.validate(productVariantArray);
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
    console.log(
      "🚀 ~ file: product-controller.js:54 ~ exports.createProduct= ~ err:",
      err
    );
    next(err);
  }
};

exports.searchProduct = async (req, res, next) => {
  try {
    const { searchedTitle } = req.params;

    const searchCategory = await prisma.category.findFirst({
      where: {
        name: searchedTitle,
      },
    });
   
    const searchBrand = await prisma.brand.findFirst({
      where : {
        name : searchedTitle
      }
    })
    

    const product = await prisma.product.findMany({
      where: {
        OR: [
          { categoryId: searchCategory?.id },
          {
            name: {
              contains: searchedTitle,
            },
          },
          {
            description: {
              contains: searchedTitle,
            },
          },{
            brandId: searchBrand?.id,
          }
        ],
      },
      include: {
        ProductImage: {
          select: {
            imageUrl: true,
          },
        },
      },
    });
    
    const searchData = product.map( (el)=>{
      el.ProductImage = el.ProductImage[0]
      return el
    })

    res.status(200).json({ searchData });

  } catch (err) {
    console.log("error  =", err);
    next(err);
  }
};

exports.getProductById = async (req, res, next) =>{
try {
      const { value ,error }= checkProductIdSchema.validate(req.params)
      
      if (error) {
        return res.status(400).json({message :"This product is not available information"})
      }

      const params = Number(value.productId)
      
      const product = await prisma.product.findFirst({
          where :{
            id : params
          },include :{
            users :true,
            types: true,
            brands: true,
            ProductImage : true,
            ProductVariant: {
              include :{
                color: true,
                shoeSize: true,
                shirtSize: true,
                pantsSize: true
              }
            },
            category : true,
            
          }
      })
      if(!product) return res.status(400).json({message :"This product is not available information"})
      const {users,types,brands,ProductImage,ProductVariant,category}= product
     
      function removeNullValues(obj) {
        for (const key in obj) {
          if (obj[key] === null) {
            delete obj[key];
          }
        }
      }
      const productVariantsWithoutNull = ProductVariant.map((variant) => {
        const copyVariant = { ...variant };
        removeNullValues(copyVariant);
        return copyVariant;
      });

      
      const productData ={
        productId : product?.id,
        productName : product.name,
        productPrice : product.price,
        productDescription : product.description,
        productRating : product.avgRating,
        sellerId : users.id,
        sellerFirstName : users.firstName,
        sellerLastName : users.lastName,
        sellerImage: users?.profileImage,
        typesName : types.name,
        brandsName : brands.name,
        productImage : ProductImage.map((el)=> el.imageUrl),
        categoryName : category.name,
        productVariant : productVariantsWithoutNull,
        
      }
      
  res.status(200).json({productData})
} catch (err) {
  console.log(err)
  next(err)
}
}

exports.getProductPopular = async (req, res, next) =>{
try {
     const product = await prisma.product.findMany({
        take : 8,
        orderBy :{
          avgRating : "desc"
        },include :{
          users :true
        }
      })
      const response = product.map( (data)=>{
        return {
          id : data.id,
          productName : data.name,
          productPrice : data.price,
          rating : data.avgRating,
          sellerFirstName : data.users.firstName,
          sellerLastName : data.users.lastName
        }
      })
      res.status(200).json( response )
} catch (err) {
  next(err)
}
}
