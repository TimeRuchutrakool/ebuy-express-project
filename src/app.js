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

const app = express();
const httpServer = http.createServer(app);

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/auth", authRoute);
app.use("/cart", cartRoute);
app.use("/product", productRoute);
app.use("/user", userRoute);
app.use("/wish", wishRoute);

const PORT = process.env.PORT || "2000";

httpServer.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("Client connect to server");
  socket.on("message", (data, cb) => {
    console.log(data);
    cb(data)
  });

});
