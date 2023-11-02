const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinaryServices");
const {
  checkProductSchema,
  checkProductVariantSchema,
} = require("../validators/product-validator");
const { create } = require("domain");
const { date } = require("joi");

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
      where: {
        name: searchedTitle,
      },
    });

    const data = await prisma.product.findMany({
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
      },
    });
    res.status(200).json({ data });
  } catch (err) {
    console.log("error  =", err);
    next(err);
  }
};
