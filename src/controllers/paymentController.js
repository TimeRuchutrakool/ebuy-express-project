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
    console.log(transactionItems);
    console.log(billTotal);

    // const transaction = await prisma.transaction.create({
    //   data: {
    //     id: checkoutSessionCompleted.id,
    //     totalBill: billTotal,
    //   },
    // });
    // await prisma.transactionItems.createMany({
    //   data: transactionItems.map((item) => {
    //     return { ...item, transactionId: transaction.id };
    //   }),
    // });

    // const order = await prisma.orderItem.create({
    //   data: {

    //   },
    // });
  }

  response.send();
};
