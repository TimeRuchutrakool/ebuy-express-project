const prisma = require("../models/prisma");
const fs = require("fs/promises");
const { upload } = require("../utils/cloudinaryServices");
const stripe = require("stripe")(process.env.STRIPE_API_SK);
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
        startedAt: new Date(`${data.startedAt}`),
        duration: +data.duration * 60 * 60 * 1000,
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
    const data = await prisma.bidProduct.findFirst({
      where: {
        id: +bidId,
      },
      include: {
        seller: true,
        ProductImage: true,
      },
    });
    const product = {
      id: data.id,
      name: data.name,
      description: data.description,
      initialPrice: data.initialPrice,
      startedAt: new Date(
        new Date(data.startedAt).getTime() + 7 * 60 * 60 * 1000
      ),
      sellerFirstName: data.seller.firstName,
      sellerLastName: data.seller.lastName,
      duration: +data.duration,
      images: data.ProductImage.map((el) => {
        return { id: el.id, imageUrl: el.imageUrl };
      }),
    };
    res.status(200).json({ product });
  } catch (err) {
    next(err);
  }
};

exports.getBidProducts = async (req, res, next) => {
  try {
    const data = await prisma.bidProduct.findMany({
      orderBy: { startedAt: "asc" },
      include: {
        ProductImage: true,
        seller: true,
      },
    });
    const products = data.map((el) => {
      return {
        id: el.id,
        name: el.name,
        description: el.description,
        price: el.initialPrice,
        startedAt: new Date(
          new Date(el.startedAt).getTime() + 7 * 60 * 60 * 1000
        ),
        duration: +el.duration,
        sellerId: el.sellerId,
        imageUrl: el.ProductImage[0].imageUrl,
        sellerName: el.seller.firstName + " " + el.seller.lastName,
      };
    });

    const bidProducts = products.filter(
      (product) =>
        new Date(product.startedAt).getTime() + product.duration >
        Date.now() + 7 * 60 * 60 * 1000
    );
    res.status(200).json({ bidProducts });
  } catch (err) {
    next(err);
  }
};

exports.addBidProductToStripe = async (req, res, next) => {
  try {
    const bidProduct = await prisma.bidProduct.findFirst({
      where: { id: +req.body.bidProductId },
      include: {
        ProductImage: true,
      },
    });

    const createStripeProduct = await stripe.products.create({
      name: bidProduct.name,
      description: bidProduct.description,
      images: [bidProduct.ProductImage[0].imageUrl],
    });

    const createStripePrice = await stripe.prices.create({
      unit_amount: +req.body.latestBidPrice * 100,
      currency: "thb",
      billing_scheme: "per_unit",
      product: `${createStripeProduct.id}`,
    });

    const updatedBidProduct = await prisma.bidProduct.update({
      where: { id: +req.body.bidProductId },
      data: {
        stripeApiId: createStripePrice.id,
        bidPrice: +req.body.latestBidPrice,
        buyerId: req.user.id,
      },
    });
    res.status(200).json({ updatedBidProduct });
  } catch (error) {
    next(error);
  }
};

exports.bidCheckout = async (req, res, next) => {
  try {
    const productId = +req.body.productId;
    const product = await prisma.bidProduct.findFirst({
      where: { id: productId },
    });

    const productToCheckout = [{ price: product.stripeApiId, quantity: 1 }];

    const transactionItems = {
      productId: product.id,
      amount: 1,
      sellerId: product.sellerId,
      buyerId: product.buyerId,
      billPerTransaction: product.bidPrice,
    };

    // checkout session
    const session = await stripe.checkout.sessions.create({
      success_url: "http://localhost:3001",
      line_items: productToCheckout,
      mode: "payment",
      metadata: {
        type: "auction",
        transactionItems: JSON.stringify(transactionItems),
      },
    });
    console.log(session);
    res.json({ paymentUrl: session });
  } catch (error) {
    next(error);
  }
};

exports.getSellerBidProducts = async (req, res, next) => {
  try {
    const userId = +req.params.userId;
    const data = await prisma.bidProduct.findMany({
      where: { sellerId: userId },
      orderBy: { startedAt: "asc" },
      include: {
        ProductImage: true,
        seller: true,
      },
    });
    const products = data.map((el) => {
      return {
        id: el.id,
        name: el.name,
        description: el.description,
        price: el.initialPrice,
        startedAt: new Date(
          new Date(el.startedAt).getTime() + 7 * 60 * 60 * 1000
        ),
        duration: +el.duration,
        sellerId: el.sellerId,
        imageUrl: el.ProductImage[0].imageUrl,
        sellerName: el.seller.firstName + " " + el.seller.lastName,
      };
    });

    const bidProducts = products.filter(
      (product) =>
        new Date(product.startedAt).getTime() + product.duration >
        Date.now() + 7 * 60 * 60 * 1000
    );
    res.status(200).json({ bidProducts });
  } catch (err) {
    next(err);
  }
};
