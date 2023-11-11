const prisma = require("../models/prisma");

module.exports.joinBidingProduct = (io,socket) => {
  socket.on("joinBidingProduct", async (data) => {
    socket.join(data.productId);
    const bidProduct = await prisma.bidProduct.findFirst({
      where: {
        id: +data.bidProductId,
      },
      include: {
        ProductImage: true,
      },
    });
    io.of("/bid")
      .in(data.productId)
      .emit(`getBiding/${data.productId}`, {
        id: bidProduct.id,
        imageUrl: bidProduct.ProductImage[0].imageUrl,
        timeRemainings:
          new Date(bidProduct.startedAt).getTime() +
          Number(bidProduct.duration) -
          (Date.now() + 7 * 60 * 60 * 1000),
        name: bidProduct.name,
        description: bidProduct.description,
        price: bidProduct.initialPrice,
      });
  });
};

module.exports.bidRequest = (socket) => {
  socket.on("bidRequest", (data) => console.log(data));
};
