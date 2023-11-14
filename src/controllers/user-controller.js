const prisma = require("../models/prisma");
const { upload } = require("../utils/cloudinaryServices");
const fs = require("fs/promises");
const createError = require("../utils/create-error");
const { checkconfirmTrackSchema } = require("../validators/product-validator");
const dayjs = require("dayjs");
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
    console.log(product);
    const store = product.map((el) => {
      return {
        id: el.id,
        name: el.name,
        description: el.description,
        price: el.price,
        imageUrl: el.ProductImage[0]?.imageUrl,
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
exports.getMyBidProducts = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const findBidProduct = await prisma.bidProduct.findMany({
      where: {
        sellerId: userId,
      },
      include: {
        ProductImage: true,
      },
    });

    const data = findBidProduct.map((el) => {
      return {
        id: el.id,
        name: el.name,
        description: el.description,
        price: el.initialPrice,
        timeStart: el.startedAt,
        timeDuration: el.duration,
        imageUrl: el.ProductImage[0],
      };
    });
    console.log(data);
    res.status(200).json({ myBidProduct: data });
  } catch (err) {
    next(err);
  }
};
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
exports.getEditProductById = async (req, res, next) => {
  try {
    const productId = req.params.productId;

    const findProduct = await prisma.product.findFirst({
      where: {
        id: +productId,
      },
      include: {
        users: true,
        types: true,
        brands: true,
        ProductImage: true,
        ProductVariant: {},
        category: true,
      },
    });
    const { ProductVariant } = findProduct;

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
      delete copyVariant.productId;
      return copyVariant;
    });

    const data = {
      id: findProduct.id,
      name: findProduct.name,
      price: findProduct.price,
      description: findProduct.description,
      typeId: findProduct.types.id,
      brandId: findProduct.brands.id,
      images: findProduct.ProductImage.map((el) => {
        return { id: el.id, imageUrl: el.imageUrl };
      }),
      productVariants: productVariantsWithoutNull,
      categoryId: findProduct.category.id,
    };

    res.status(200).json({ product: data });
  } catch (err) {
    next(err);
  }
};
exports.getMyorder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(userId);

    const findOrder = await prisma.order.findMany({
      where: {
        buyerId: userId,
      },
      include: {
        OrderItem: {
          include: {
            product: {
              include: {
                ProductImage: true,
                users: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
    console.log(findOrder);

    // // console.log(myOrderObject)
    //  const filteredOrders = findOrder.filter(order => order.OrderItem.every(item => item.trackNum === null && item.logisticsName === null));
    //  console.log(filteredOrders)
    let filterOrders = findOrder.filter((el) => el.status === "PENDING");

    const data = filterOrders.map((el) => {
      return {
        id: el.id,
        among: el.OrderItem.map((el) => el.amount),
        trackNum: el.OrderItem.map((el) => el.trackNum),
        logisticsName: el.OrderItem.map((el) => el.logisticsName),
        name: el.OrderItem.map((el) => el.product?.name),
        price: el.OrderItem.map((el) => el.product?.price),
        sellerFirstName: el.OrderItem.map((el) => el.product?.users.firstName),
        sellerLastName: el.OrderItem.map((el) => el.product?.users.lastName),
        imageUrl: el.OrderItem.map(
          (el) => el.product?.ProductImage[0].imageUrl
        ),
      };
    });
    console.log(data);

    const convertedData = data.map((item) => {
      return {
        id: item.id,
        among: item.among[0],
        trackNum: item.trackNum[0],
        logisticsName: item.logisticsName[0],
        name: item.name[0],
        price: item.price[0],
        sellerFirstName: item.sellerFirstName[0],
        sellerLastName: item.sellerLastName[0],
        imageUrl: item.imageUrl[0],
      };
    });

    console.log(convertedData);

    res.status(200).json({ myOrder: convertedData });
  } catch (err) {
    next(err);
  }
};
exports.confirmTrack = async (req, res, next) => {
  try {
    const { value, error } = checkconfirmTrackSchema.validate(req.body);

    const { trackNum, id, logisticsName } = value;

    if (error) {
      return next(createError("Incorrect information", 400));
    }

    const update = await prisma.orderItem.updateMany({
      where: {
        orderId: id,
      },
      data: {
        trackNum: trackNum,
        logisticsName: logisticsName,
      },
    });
    console.log("update", update.count);
    res.status(200).json({ message: "ok" });
  } catch (err) {
    next(err);
  }
};
exports.confirmReceipt = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const data = req.body;
    const update = await prisma.order.update({
      where: {
        id: +data.id,
      },
      data: {
        status: data.status,
      },
    });

    console.log(data);
    res.status(200).json({ message: "ok" });
  } catch (err) {
    next(err);
  }
};
exports.getMySale = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const findMyProduct = await prisma.product.findMany({
      where: {
        sellerId: userId,
      },
    });
    console.log(findMyProduct);
    const myProductId = findMyProduct.map((el) => el.id);
    console.log(myProductId);
    const findMySale = await prisma.orderItem.findMany({
      where: {
        productId: {
          in: myProductId,
        },
      },
      include: {
        product: {
          include: {
            ProductImage: true,
            ProductVariant: {
              include: {
                color: true,
                shoeSize: true,
                shirtSize: true,
                pantsSize: true,
              },
            },
          },
        },
      },
    });

    const find = findMySale.filter((el) => el.trackNum === null);
    console.log(find);
    // let  findProductVariant = findMySale.map(el => el.product.ProductVariant)

    //   function removeNullAndNestedArrays(obj) {
    //     if (Array.isArray(obj)) {
    //         return obj.map(item => removeNullAndNestedArrays(item)).filter(item => item !== null);
    //     } else if (obj !== null && typeof obj === 'object') {
    //         const cleanedObj = {};
    //         for (const key in obj) {
    //             if (obj[key] !== null) {
    //                 cleanedObj[key] = removeNullAndNestedArrays(obj[key]);
    //             }
    //         }
    //         return cleanedObj;
    //     } else {
    //         return obj;
    //     }
    // }
    // const cleanedData = removeNullAndNestedArrays(findProductVariant);
    // console.log(cleanedData)
    // const filteredOrders = findMySale.filter(order => order.OrderItem);

    const data = find.map((el) => {
      return {
        id: el.orderId,
        among: el.amount,
        trackNum: el.trackNum,
        logisticsName: el.logisticsName,
        name: el.product.name,
        imageUrl: el.product.ProductImage[0].imageUrl,
        // productVariants : el.product.ProductVariant.map((el)=>{
        //   return {
        //     color : el.color.name,
        //     shirtSize : el.shirtSize?.name,
        //     pantSize : el.pantsSize?.name,
        //     shoeSize : el.shoeSize?.name
        //   }
        // })
      };
    });

    res.status(200).json({ mySale: data });
  } catch (err) {
    next(err);
  }
};
exports.getMyHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const findOrder = await prisma.order.findMany({
      where: {
        buyerId: userId,
      },
      include: {
        OrderItem: {
          include: {
            product: {
              include: {
                ProductImage: true,
              },
            },
          },
        },
      },
    });
    console.log(findOrder);
    const filterOrder = findOrder.filter((el) => el.status !== "PENDING");
    console.log(filterOrder);

    const data = filterOrder.map((el) => {
      return {
        id: el.id,
        time: el.createAt,
        among: el.OrderItem.map((el) => el.amount),
        price: el.OrderItem.map((el) => el.product.price),
        name: el.OrderItem.map((el) => el.product.name),
        imageUrl: el.OrderItem.map((el) => el.product.ProductImage[0].imageUrl),
      };
    });

    const convertedData = data.map((el) => {
      return {
        id: el.id,
        time: el.time,
        among: el.among[0],
        price: el.price[0],
        name: el.name[0],
        imageUrl: el.imageUrl[0],
      };
    });

    convertedData.forEach((el) => {
      el.time = dayjs(el.time).format("YYYY-MM-DD HH:mm");
    });

    res.status(200).json({ myHistory: convertedData });
  } catch (err) {
    next(err);
  }
};
