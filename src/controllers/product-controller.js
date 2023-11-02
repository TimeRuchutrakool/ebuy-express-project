const prisma = require("../models/prisma");
const createError = require("../utils/create-error");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinaryServices");
const {
  checkProductSchema,
  checkProductVariantSchema,
  checkUpdateProductSchema,
  checkUpdateProductVariantSchema,
} = require("../validators/product-validator");
const { create } = require("domain");

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

        console.log(variantError)
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
