const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinaryServices");
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
    console.log(productVariantArray);

    if (productVariantArray.length) {
      const { value, error } =
        checkUpdateProductVariantSchema.validate(productVariantArray);

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
exports.updateProduct = async (req, res, next) => {
  try {
    const { id: sellerId } = req.user;
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

      // ตรวจสอบข้อมูลตัวแปรของสินค้า
      const { value: variantValue, error: variantError } =
        checkUpdateProductVariantSchema.validate(productVariantArray);

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
      for (const variant of productVariantArray) {
        variant.productId = productId;
      }

      // สร้างข้อมูลตัวแปรของสินค้าใหม่
      await prisma.productVariant.createMany({
        data: productVariantArray,
      });
    }

    res.status(201).json({ message: "Success" });
  } catch (error) {
    console.log(error);
    next(error);
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
      where: {
        name: searchedTitle,
      },
    });

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
          },
          {
            brandId: searchBrand?.id,
          },
        ],
      },
      include: {
        ProductImage: {
          select: {
            imageUrl: true,
          },
        },
        users: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const searchData = product.map((el) => {
      el.ProductImage = el.ProductImage[0];
      return el;
    });

    res.status(200).json({ searchData });
  } catch (err) {
    console.log("error  =", err);
    next(err);
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
      };
    });
    res.status(200).json(productPopular);
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  const buyerId = req.user.id;
  console.log(req.body);
  const review = await prisma.review.create({
    data: { ...req.body, buyerId },
  });
  res.json({ review });
};

exports.getReviewProduct = async (req, res, next) => {
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
