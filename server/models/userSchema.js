const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 8 },
  admin: { type: Boolean, default: false },
  cart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CartItem",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
