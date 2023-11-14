const prisma = require("../models/prisma");
const { auctioningRooms } = require("./auctionRoom");

module.exports.joinBidingProduct = (io, socket) => {
  socket.on("joinBidingProduct", async ({ bidProductId }) => {
    socket.join(bidProductId);
    const bidProduct = await prisma.bidProduct.findFirst({
      where: {
        id: +bidProductId,
      },
      include: {
        ProductImage: true,
      },
    });

    io.of("/bid")
      .in(`${bidProductId}`)
      .emit(`getBiding/${bidProductId}`, {
        id: bidProduct.id,
        imageUrl: bidProduct.ProductImage[0].imageUrl,
        timeRemainings:
          new Date(bidProduct.startedAt).getTime() +
          7 * 60 * 60 * 1000 +
          Number(bidProduct.duration) -
          (Date.now() + 7 * 60 * 60 * 1000),
        name: bidProduct.name,
        description: bidProduct.description,
        latestBid: {
          latestWinnerId: auctioningRooms[`${bidProductId}`]
            ? auctioningRooms[`${bidProductId}`].latestWinnerId
            : undefined,
          latestBidPrice: auctioningRooms[`${bidProductId}`]
            ? auctioningRooms[`${bidProductId}`].latestBidPrice
            : +bidProduct.initialPrice,
        },
      });
  });
};

module.exports.bidRequest = (io, socket) => {
  socket.on("bidRequest", ({ bidProductId, bidAmount, userId }) => {
    socket.join(`${bidProductId}`);
    const room = auctioningRooms[`${bidProductId}`];
    if (!room)
      auctioningRooms[`${bidProductId}`] = {
        latestWinnerId: userId,
        latestBidPrice: bidAmount,
      };
    else {
      const currentPrice = auctioningRooms[`${bidProductId}`].latestBidPrice;
      if (currentPrice < bidAmount) {
        auctioningRooms[`${bidProductId}`].latestBidPrice = bidAmount;
        auctioningRooms[`${bidProductId}`].latestWinnerId = userId;
      }
    }
    io.of("/bid")
      .in(`${bidProductId}`)
      .emit(`responseBid/${bidProductId}`, {
        latestBidPrice: auctioningRooms[`${bidProductId}`].latestBidPrice,
        latestWinnerId: auctioningRooms[`${bidProductId}`].latestWinnerId,
      });
  });
};

module.exports.bidingFinished = (socket) => {
  socket.on("bidingFinished", async ({ bidProductId }, cb) => {
    socket.join(`${bidProductId}`);
    const bidWinner = auctioningRooms[`${bidProductId}`] ?? {
      latestWinnerId: 0,
      latestBidPrice: 0,
    };

    const bidProduct = await prisma.bidProduct.findFirst({
      where: {
        id: +bidProductId,
      },
      include: {
        ProductImage: true,
      },
    });

    cb({
      latestWinnerId: bidWinner.latestWinnerId,
      latestBidPrice: bidWinner?.latestBidPrice,
      product: {
        id: bidProduct.id,
        imageUrl: bidProduct.ProductImage[0].imageUrl,
        name: bidProduct.name,
        description: bidProduct.description,
      },
    });
  });
};

// จ่ายตังค์ค่อย delete room
