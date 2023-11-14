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
const bidRoute = require("./routes/bid-route");
const notFoundMiddleware = require("./middlewares/not-found");
const errorMiddleware = require("./middlewares/error");
const {
  getChatList,
  joinRoom,
  sendMessage,
  findRoom,
} = require("./socket/chatSocket");
const {
  joinBidingProduct,
  bidRequest,
  bidingFinished,
} = require("./socket/bidSocket");

const app = express();
const httpServer = http.createServer(app);

app.use(cors());
app.use(morgan("dev"));

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.catchCheckoutResult
);

app.use(express.json());

app.use("/auth", authRoute);
app.use("/cart", cartRoute);
app.use("/product", productRoute);
app.use("/user", userRoute);
app.use("/wish", wishRoute);
app.use("/bid", bidRoute);

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.of("/chat").on("connection", (socket) => {
  // console.log(socket.id);

  getChatList(socket);
  joinRoom(io, socket);
  sendMessage(io, socket);
  findRoom(socket);

  socket.on("disconnect", () => console.log("Someone left."));
});

io.of("/bid").on("connection", (socket) => {
  joinBidingProduct(io, socket);
  bidRequest(io, socket);
  bidingFinished(socket);
  socket.on("disconnect", () => console.log("Someone left."));
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);
const PORT = process.env.PORT || "2000";

httpServer.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
