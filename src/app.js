require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const morgan = require("morgan");
const authRoute = require("./routes/auth-route");
const cartRoute = require("./routes/cart-route");
const productRoute = require("./routes/product-route");
const wishRoute = require("./routes/wish-route");
const userRoute = require("./routes/user-route");
const paymentController = require("./controllers/paymentController");
const stripe = require("stripe")(process.env.STRIPE_API_SK);
const {
  getChatList,
  joinRoom,
  sendMessage,
  findRoom,
} = require("./socket/chatSocket");

const app = express();
const httpServer = http.createServer(app);

app.use(cors());
app.use(morgan("dev"));

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      console.log(err);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.async_payment_failed":
        const checkoutSessionAsyncPaymentFailed = event.data.object;
        // Then define and call a function to handle the event checkout.session.async_payment_failed
        break;
      case "checkout.session.async_payment_succeeded":
        const checkoutSessionAsyncPaymentSucceeded = event.data.object;
        console.log(checkoutSessionAsyncPaymentSucceeded.metadata);
        // Then define and call a function to handle the event checkout.session.async_payment_succeeded
        break;
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;
        // Then define and call a function to handle the event checkout.session.completed
        break;
      case "checkout.session.expired":
        const checkoutSessionExpired = event.data.object;
        // Then define and call a function to handle the event checkout.session.expired
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

app.use(express.json());

app.use("/auth", authRoute);
app.use("/cart", cartRoute);
app.use("/product", productRoute);
app.use("/user", userRoute);
app.use("/wish", wishRoute);

// const endpointSecret =
//   "whsec_55a6cc67f0485d89727f80b50c9a26ff70682bec34cfd37797af7be5309c04f0";

// app.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   paymentController.catchCheckoutResult,
// );

const endpointSecret = "whsec_oG3wySw2feypkX6Febl8WHg62M0kzEQw";

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.of("/chat").on("connection", (socket) => {
  console.log(socket.id);

  getChatList(socket);
  joinRoom(io, socket);
  sendMessage(io, socket);
  findRoom(socket);

  socket.on("disconnect", () => console.log("Someone left."));
});

const PORT = process.env.PORT || "2000";

httpServer.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
