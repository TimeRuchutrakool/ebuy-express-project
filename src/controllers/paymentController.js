const stripe = require("stripe")(process.env.STRIPE_API_SK);
const prisma = require("../models/prisma");

module.exports.catchCheckoutResult = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      "whsec_JtuoJ3Bvb8Ikj6KbISbE9TAK2cacPuux"
    );
    // console.log(event);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    // console.log(err);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSessionCompleted = event.data.object;
    const transactionItems = JSON.parse(
      checkoutSessionCompleted.metadata.transactionItems
    );
    const billTotal = transactionItems.reduce(
      (acc, cur) => acc + Number(cur.billPerTransaction),
      0
    );

    // CREATE TRANSACTION
    const transaction = await prisma.transaction.create({
      data: {
        id: checkoutSessionCompleted.id,
        totalBill: billTotal,
      },
    });
    // CREATE TRANSACTION ITEMS FROM EACH SELLET
    await prisma.transactionItem.createMany({
      data: transactionItems.map((item) => {
        return {
          sellerId: item.sellerId,
          buyerId: item.buyerId,
          billPerTransaction: item.billPerTransaction,
          transactionId: transaction.id,
        };
      }),
    });
    // CREATE ORDER
    const order = await prisma.order.create({
      data: {
        buyerId: transactionItems[0].buyerId,
      },
    });
    // CREATE ORDER ITEMS
    const orderItemToCreate = transactionItems.map((item) => {
      return {
        amount: item.amount,
        orderId: order.id,
        productId: item.productId,
        transactionId: transaction.id,
      };
    });
    await prisma.orderItem.createMany({
      data: orderItemToCreate,
    });
    // DELETE CART ITEMS
    await prisma.cartItem.deleteMany({
      where: {
        buyerId: transactionItems[0].buyerId,
      },
    });
    // UPDATE STOCK
    for (item of transactionItems) {
      await prisma.productVariant.update({
        where: {
          id: item.productVariantId,
        },
        data: {
          stock: {
            decrement: item.amount,
          },
        },
      });
    }
    console.log("------------------------succeeded------------------------");
  }

  response.send();
};
