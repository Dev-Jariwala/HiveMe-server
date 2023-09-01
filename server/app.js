require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Replace with the URL of your client application
    credentials: true, // Enable credentials (cookies) support
  })
);
app.use(express.json());
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect(
    "mongodb+srv://devjariwala:devjariwala@cluster0.zbnsp.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("connection sucessful"))
  .catch((err) => console.log(err));

app.use("/auth", authRoutes);
app.use("/product", productRoutes);
app.get("/", (req, res) => {
  res.send("listining from other side");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("front end port", process.env.FRONTEND_URL);
  console.log(`Server is running on port ${PORT}`);
});
