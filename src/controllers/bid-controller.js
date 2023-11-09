const prisma = require("../models/prisma");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinaryServices");
const dayjs = require("dayjs");
const duration = require("dayjs/plugin/duration");

const createError = require("../utils/create-error");

exports.createBidProducts = async (req, res, next) => {
  try {
    const data = req.body;
    const files = req.files;

    if (!req.files) {
      next(createError("bid-product image is required", 400));
    }

    const bidProduct = await prisma.bidProduct.create({
      data: {
        name: data.name,
        description: data.description,
        initialPrice: +data.price,
        sellerId: req.user.id,
        startedAt: new Date(data.startedAt),
        duration: +data.duration*60*60*1000,
      },
    });

    const urls = [];

    for (const file of files) {
      const { path } = file;
      const url = await upload(path);
      urls.push(url);
    }

    const images = [];
    for (const image of urls) {
      images.push({ imageUrl: image, bidProductId: bidProduct.id });
    }

    await prisma.productImage.createMany({
      data: images,
    });

    res.status(200).json({ message: "OK" });
  } catch (err) {
    next(err);
  } finally {
    if (req.files) {
      for (let i = 0; i < req.files.length; i++) {
        fs.unlink(req.files[i].path);
      }
    }
  }
};

exports.getBidProductsById = async (req, res, next) => {
  try {
    const bidId = req.params.bidProductId;
    console.log(bidId);
    const data = await prisma.bidProduct.findFirst({
      where: {
        id: +bidId,
      },
      include: {
        ProductImage: true,
      },
    });
    console.log(data);
    const product = {
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.initialPrice,
      startedAt: data.startedAt,
      duration: data.duration,
      sellerId: data.sellerId,
      imageUrl: data.ProductImage.map((el) => el.imageUrl),
    };
    console.log(product);
    res.status(200).json({ bidProduct: product });
  } catch (err) {
    next(err);
  }
};
exports.getBidProducts = async (req, res, next) => {
  try {
    const data = await prisma.bidProduct.findMany({
      include: {
        ProductImage: true,
      },
    });
    console.log(data);
    const product = data.map((el) => {
      return {
        id: el.id,
        name: el.name,
        description: el.description,
        price: el.initialPrice,
        startedAt: el.startedAt,
        duration: el.duration,
        sellerId: el.sellerId,
        imageUrl: el.ProductImage[0].imageUrl,
      };
    });
    console.log(product);
    res.status(200).json({ bidProduct: product });
  } catch (err) {
    next(err);
  }
};