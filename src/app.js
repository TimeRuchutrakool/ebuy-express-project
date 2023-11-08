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
  express.raw({ type: "*/*" }),
  paymentController.catchCheckoutResult
);

app.use(express.json())

app.use("/auth", authRoute);
app.use("/cart", cartRoute);
app.use("/product", productRoute);
app.use("/user", userRoute);
app.use("/wish", wishRoute);

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
