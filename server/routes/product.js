const express = require("express");

const router = express.Router();

const Product = require("../models/productSchema");
const CartItem = require("../models/cartSchema");
const User = require("../models/userSchema");
const { isAuthenticated } = require("../controllers/login");
const stripe = require("stripe")(
  "sk_test_51NlVFwSEaPBnmk4qNj0lu3KJdaJPNKoWj5Vs0oTVntJWJOs6BjqQt0AVyksGRnccFf8qGCdWEBdhM9C0PTPwEKxo00DSNNUL5p"
);

router.post("/create", async (req, res) => {
  const { title, color, price, quantity, imageSrc } = req.body;

  try {
    // Creating a new product
    const newProduct = new Product({
      title,
      color,
      price,
      quantity,
      imageSrc,
    });

    newProduct.save();
    res.status(200).json({ message: "Product Created Sucessfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating product" });
  }
});
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products" });
  }
});
router.post("/create-checkout-session", async (req, res) => {
  console.log("here");
  try {
    const { products } = req.body; // Destructure the products array from req.body

    const lineItems = products.map((p) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: p.product.title,
        },
        unit_amount: p.product.price * 100,
      },
      quantity: p.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });
    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating checkout" });
  }
});

router.post("/add-to-cart/:productId", isAuthenticated, async (req, res) => {
  try {
    const productId = req.params.productId;
    const { quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newCartItem = new CartItem({
      product: product._id,
      quantity: quantity || 1,
    });

    await newCartItem.save();

    // Add the cart item to the user's cart array in the User model
    console.log(req.user._id);
    const userId = req.user._id; // Assuming you're using authentication middleware
    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { cart: newCartItem._id } },
      { new: true }
    );

    res.status(200).json({ message: "Product added to cart", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding product to cart" });
  }
});

// ... Your other routes ...

router.get("/cartitems/:userId", async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
 
    const user = await User.findById(requestedUserId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find all cart items belonging to the u ser
    const cartItems = await CartItem.find({
      _id: { $in: user.cart },
    }).populate("product");

    res.status(200).json({ cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching cart items" });
  }
});
router.put("/updatecart/:cartItemId", isAuthenticated, async (req, res) => {
  const { cartItemId } = req.params;
  const { newQuantity } = req.body;

  try {
    const updatedCartItem = await CartItem.findByIdAndUpdate(
      cartItemId,
      { quantity: newQuantity },
      { new: true }
    );
    res.json(updatedCartItem);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating cart item quantity", error });
  }
});
router.delete("/cartitems/:cartItemId", isAuthenticated, async (req, res) => {
  try {
    const cartItemId = req.params.cartItemId;

    // Delete the cart item
    await CartItem.findByIdAndDelete(cartItemId);

    // Remove the cart item from the user's cart array in the User model
    const userId = req.user._id; // Assuming you're using authentication middleware
    await User.findByIdAndUpdate(userId, {
      $pull: { cart: cartItemId },
    });

    res.status(200).json({ message: "Cart item removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error removing cart item" });
  }
});

module.exports = router;

module.exports = router;
