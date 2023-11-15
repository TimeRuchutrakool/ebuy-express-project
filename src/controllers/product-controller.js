require("dotenv").config();
const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinaryServices");
const { v4 } = require("uuid");
const stripe = require("stripe")(process.env.STRIPE_API_SK);
const {
  checkProductSchema,
  checkProductVariantSchema,
  checkUpdateProductSchema,
  checkUpdateProductVariantSchema,
  checkProductIdSchema,
} = require("../validators/product-validator");

const { removeDuplicates } = require("../utils/helper");

exports.createProduct = async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const { value, error } = checkProductSchema.validate(req.body);

    console.log(error);
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

    const createStripeProduct = await stripe.products.create({
      name,
      description,
      images: [urls[0]],
    });

    const createStripePrice = await stripe.prices.create({
      unit_amount: price * 100,
      currency: "thb",
      billing_scheme: "per_unit",
      product: `${createStripeProduct.id}`,
    });
    //  console.log(createStripePrice)

    const product = await prisma.product.create({
      data: {
        sellerId,
        name,
        price,
        description,
        typeId,
        brandId,
        categoryId,
        stripeApiId: createStripePrice.id,
      },
    });

    const images = [];
    for (const image of urls) {
      images.push({ imageUrl: image, productId: product.id });
    }

    await prisma.productImage.createMany({
      data: images,
    });

    // createProductVariant

    const productVariantArray = JSON.parse(sizeAndStock);

    productVariantArray.map((item) => delete item.id);
    const result = productVariantArray.map((item) => {
      const newItem = {
        colorId: Number(item.colorId),
        stock: Number(item.stock),
      };

      if (item.shirtSizeId) {
        newItem.shirtSizeId = Number(item.shirtSizeId);
      } else if (item.shoeSizeId) {
        newItem.shoeSizeId = Number(item.shoeSizeId);
      } else if (item.pantsSizeId) {
        newItem.pantsSizeId = Number(item.pantsSizeId);
      }

      return newItem;
    });

    console.log(
      "🚀 ~ file: product-controller.js:81 ~ result ~ result:",
      result
    );

    if (result.length) {
      const { value, error } = checkUpdateProductVariantSchema.validate(result);

      if (error) {
        return next(createError("Incorrect information", 400));
      }

      for (const optional of result) {
        optional.productId = product.id;
      }

      await prisma.productVariant.createMany({
        data: result,
      });
    }

    res.status(201).json({ message: "Success", product });
  } catch (err) {
    console.log(
      "🚀 ~ file: product-controller.js:93 ~ exports.createProduct= ~ err:",
      err
    );
    next(err);
  }
};

///////////////////// แก้ไขรายการสินค้า /////////////////////
exports.updateProduct = async (req, res, next) => {
  try {
    console.log(req.body);
    const { value, error } = checkUpdateProductSchema.validate(req.body);

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
      productId,
    } = value;
    const product = await prisma.product.update({
      where: {
        id: +productId,
      },
      data: {
        name,
        price,
        description,
        typeId,
        brandId,
        categoryId,

        createdAt: new Date(),
      },
    });

    if (!req.files) {
      next(createError("product image is required", 400));
    }

    // ถ้ามีไฟล์ ให้ลบที่ product ที่มีรูป
    if (req.files.length !== 0) {
      await prisma.productImage.deleteMany({
        where: {
          productId: productId,
        },
      });
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
    for (const imgae of urls) {
      images.push({ imageUrl: imgae, productId: productId });
    }
    await prisma.productImage.createMany({
      data: images,
    });
    // ตรวจสอบและอัพเดทข้อมูลตัวแปรของสินค้า
    if (value.sizeAndStock && value.sizeAndStock.length > 0) {
      const productVariantArray = JSON.parse(sizeAndStock);
      productVariantArray.map((obj) => {
        delete obj.id;
      });
      const result = productVariantArray.map((item) => {
        const newItem = {
          colorId: Number(item.colorId),
          stock: Number(item.stock),
        };

        if (item.shirtSizeId) {
          newItem.shirtSizeId = Number(item.shirtSizeId);
        } else if (item.shoeSizeId) {
          newItem.shoeSizeId = Number(item.shoeSizeId);
        } else if (item.pantsSizeId) {
          newItem.pantsSizeId = Number(item.pantsSizeId);
        }

        return newItem;
      });
      // ตรวจสอบข้อมูลตัวแปรของสินค้า
      const { value: variantValue, error: variantError } =
        checkUpdateProductVariantSchema.validate(result);

      console.log(variantError);
      if (variantError) {
        return next(
          createError("Incorrect information for product variants", 400)
        );
      }

      // ให้ลบรายการตัวแปรของสินค้าที่มี productId เท่ากับ updatedProduct.id

      await prisma.productVariant.deleteMany({
        where: {
          productId: productId,
        },
      });

      // ให้ทุกตัวแปรของสินค้ามี productId เป็น id ของ updatedProduct
      for (const variant of result) {
        variant.productId = productId;
      }

      // สร้างข้อมูลตัวแปรของสินค้าใหม่
      await prisma.productVariant.createMany({
        data: result,
      });
    }

    res.status(201).json({ message: "Success" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.search = async (req, res, next) => {
  const { searchedTitle } = req.params;
  const { page, type = "", price = "" } = req.query;
  const [minPrice, maxPrice] = price && price.split("-");
  console.log(page);
  console.log(type);
  console.log(price);

  try {
    const searchCategory = await prisma.category.findFirst({
      where: {
        name: { contains: searchedTitle },
      },
    });
    const searchBrand = await prisma.brand.findFirst({
      where: {
        name: { contains: searchedTitle },
      },
    });
    const count = await prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchedTitle,
            },
          },
          {
            description: {
              contains: searchedTitle,
            },
          },
          { categoryId: searchCategory?.id },
          {
            brandId: searchBrand?.id,
          },
        ],
        AND: [
          type
            ? {
                typeId: +type,
              }
            : {
                price: { gte: 0 },
              },
          price
            ? {
                price: {
                  gte: +minPrice,
                  lte: +maxPrice,
                },
              }
            : {
                price: { gte: 0 },
              },
        ],
      },
    });
    let product = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        OR: [
          {
            name: {
              contains: searchedTitle,
            },
          },
          {
            description: {
              contains: searchedTitle,
            },
          },
          { categoryId: searchCategory?.id },
          {
            brandId: searchBrand?.id,
          },
        ],
        AND: [
          type
            ? {
                typeId: +type,
              }
            : {
                price: { gte: 0 },
              },
          price
            ? {
                price: {
                  gte: +minPrice,
                  lte: +maxPrice,
                },
              }
            : {
                price: { gte: 0 },
              },
        ],
      },
      take: 12,
      skip: (Number(page || 1) - 1) * 12,
      include: {
        users: true,
        ProductImage: true,
      },
    });

    product = product.map((p) => {
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        description: p.description,
        avgRating: p.avgRating,
        sellerFirstName: p.users.firstName,
        sellerLastName: p.users.lastName,
        imageUrl: p.ProductImage[0].imageUrl,
      };
    });

    res.json({ count: count.length, product });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const { value, error } = checkProductIdSchema.validate(req.params);

    if (error) {
      return res
        .status(400)
        .json({ message: "This product is not available information" });
    }

    const params = Number(value.productId);

    const product = await prisma.product.findFirst({
      where: {
        id: params,
      },
      include: {
        users: true,
        types: true,
        brands: true,
        ProductImage: true,
        ProductVariant: {
          include: {
            color: true,
            shoeSize: true,
            shirtSize: true,
            pantsSize: true,
          },
        },
        category: true,
      },
    });
    if (!product)
      return res
        .status(400)
        .json({ message: "This product is not available information" });
    const { users, types, brands, ProductImage, ProductVariant, category } =
      product;
    console.log(product);
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

    let colors = new Set();
    let sizes = new Set();
    const sizeName = Object.keys(productVariantsWithoutNull[0])
      .find((v) => v.includes("SizeId"))
      .slice(0, -2);
    for (const variant of productVariantsWithoutNull) {
      colors.add(variant?.color);
      sizes.add(variant[`${sizeName}`]);
    }
    colors = removeDuplicates(colors);
    sizes = removeDuplicates(sizes);

    const productData = {
      id: product?.id,
      name: product.name,
      price: product.price,
      description: product.description,
      avgRating: +product.avgRating,
      sellerId: users.id,
      sellerFirstName: users.firstName,
      sellerLastName: users.lastName,
      sellerImage: users?.profileImage,
      type: types.name,
      brand: brands.name,
      images: ProductImage.map((el) => {
        return { id: el.id, imageUrl: el.imageUrl };
      }),
      productVariants: productVariantsWithoutNull,
      options: { colors, sizes },
    };

    res.status(200).json({ product: productData });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

exports.getProductPopular = async (req, res, next) => {
  try {
    const product = await prisma.product.findMany({
      take: 8,
      orderBy: {
        avgRating: "desc",
      },
      include: {
        users: true,
        ProductImage: true,
      },
    });
    const productPopular = product.map((data) => {
      return {
        id: data.id,
        productName: data.name,
        productPrice: data.price,
        rating: data.avgRating,
        sellerFirstName: data.users.firstName,
        sellerLastName: data.users.lastName,
        productImage: data.ProductImage[0]?.imageUrl,
      };
    });
    res.status(200).json(productPopular);
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  const buyerId = req.user.id;
  const productId = +req.body.productId;

  const createdReview = await prisma.review.create({
    data: { ...req.body, buyerId },
    include: { user: true },
  });

  const review = await prisma.review.findMany({
    where: { productId: productId },
  });

  const ratingSum = review.reduce((acc, cur) => acc + cur.rating, 0);

  await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      avgRating: ratingSum / review.length,
    },
  });
  console.log();

  const data = {
    id: createdReview.id,
    content: createdReview.content,
    rating: createdReview.rating,
    reviewAt: createdReview.createdAt,
    reviewer: {
      name: `${createdReview.user.firstName} ${createdReview.user.lastName}`,
      imageUrl: createdReview.user.profileImage,
    },
  };

  res.json({ data });
};

exports.getReviewProduct = async (req, res, next) => {
  //torz
  const { productId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { productId: +productId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
    },
  });

  const ratings = [
    { rating: 5, nums: 0 },
    { rating: 4, nums: 0 },
    { rating: 3, nums: 0 },
    { rating: 2, nums: 0 },
    { rating: 1, nums: 0 },
  ];

  for (const review of reviews) {
    ratings.find((rating) => rating.rating === review.rating).nums++;
  }

  const review = reviews.map((review) => {
    return {
      id: review.id,
      content: review.content,
      rating: review.rating,
      reviewAt: review.createdAt,
      reviewer: {
        name: `${review.user.firstName} ${review.user.lastName}`,
        imageUrl: review.user.profileImage,
      },
    };
  });

  res.status(200).json({ numberOfReview: reviews.length, ratings, review });
};

exports.getVariant = async (req, res, next) => {
  try {
    let productVariant = [];
    const variantColor = await prisma.color.findMany();

    const variantCategory = await prisma.category.findMany();

    const variantShoeSize = await prisma.shoeSize.findMany();

    const variantShirtSize = await prisma.shirtSize.findMany();

    const variantPantsSize = await prisma.pantsSize.findMany();

    const variantBrand = await prisma.brand.findMany();

    productVariant = {
      color: variantColor,
      category: variantCategory,
      shoeSize: variantShoeSize,
      shirtSize: variantShirtSize,
      pantsSize: variantPantsSize,
      brand: variantBrand,
    };

    res.status(200).json({ productVariant });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { value, error } = checkProductIdSchema.validate(req.params);
    console.log(value.productId);

    // console.log(error)

    if (error) {
      return res
        .status(400)
        .json({ message: "This product is not available information" });
    }
    const targetProduct = await prisma.product.findFirst({
      where: {
        id: +value.productId,
      },
    });

    await prisma.review.deleteMany({
      where: {
        productId: +value.productId,
      },
    });
    await prisma.cartItem.deleteMany({
      where: {
        productId: +value.productId,
      },
    });
    await prisma.wishItem.deleteMany({
      where: {
        productId: +value.productId,
      },
    });
    await prisma.orderItem.deleteMany({
      where: {
        productId: +value.productId,
      },
    });

    await prisma.productVariant.deleteMany({
      where: {
        productId: +value.productId,
      },
    });

    await prisma.productImage.deleteMany({
      where: {
        productId: +value.productId,
      },
    });

    await prisma.product.deleteMany({
      where: {
        id: +value.productId,
      },
    });
    res.json({ message: "Delete Success" });
  } catch (error) {
    next(error);
  }
};


exports.randomProduct = async (req, res, next) => {
  try {
    const random = await prisma.product.findMany();
    const randomValue = Math.floor(Math.random() * random.length);
    const products = await prisma.product.findMany({
      where: {
        ProductImage: {
          some: {}
        }
      },
      include: {
        ProductImage: true
      }
    });

    const product = products[randomValue]


    const randomProduct = 
       {
        id : product.id,
        image : product.ProductImage[0]?.imageUrl,
        name : product.name,
        price : product.price,
        description : product.description,
        stripeApiId : product.stripeApiId,
        sellerId : product.sellerId,
        typeId : product.typeId,
        brandId : product.brandId,
        categoryId : product.categoryId
      }
    
 
    res.json({randomProduct})
  } catch (error) {
    next(error);
  }
}

module.exports.getSellerProducts = async (req, res, next) => {
  try {
    const userId = +req.params.userId;
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    });
    let products = await prisma.product.findMany({
      where: {
        sellerId: userId,
      },
      include: {
        ProductImage: true,
      },
    });
    products = products.map((product) => {
      return {
        id: product.id,
        name: product.name,
        price: +product.price,
        avgRating: product.avgRating,
        imageUrl: product.ProductImage[0].imageUrl,
      };
    });
    res.json({
      seller: {
        name: user.firstName + " " + user.lastName,
        imageUrl: user.profileImage,
      },
      products,
    });
  } catch (error) {
    next(error);
  }
};

