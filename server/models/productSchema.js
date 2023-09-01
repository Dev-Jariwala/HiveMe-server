const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  color: String,
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  imageSrc: String,
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
