const User = require("../models/userSchema");

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check password
    if (password === user.password) {
      // Create a token (JWT) and send it in response
      const token = createToken(user); // You need to implement this function
      return res.json({ token });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
exports.isAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    // User is authenticated
    return next();
  } else {
    // User is not authenticated
    return res.json({ message: "user not authenticated" });
  }
};
