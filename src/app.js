require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const authRoute = require("./routes/auth-route");
const cartRoute = require("./routes/cart-route");
const productRoute = require("./routes/product-route");
const wishRoute = require("./routes/wish-route")

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/auth", authRoute);
app.use("/cart",cartRoute);
app.use("/product", productRoute);
app.use("/wish",wishRoute)

const PORT = process.env.PORT || "2000";

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

