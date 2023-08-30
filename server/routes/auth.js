const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/userSchema");
const { isAuthenticated } = require("../controllers/login");
const LocalStrategy = require("../config/passport").LocalStrategy;

router.post("/login", (req, res, next) => {
  console.log("Attempting login...");
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.error("Error:", err);
      return next(err);
    }
    if (!user) {
      console.log("Login failed:", info.message);
      return res.status(401).json({ message: info.message });
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Error:", err);
        return next(err);
      }

      console.log("Login successful:", user.username);
      const sanitizedUser = {
        _id: user._id,
        username: user.username,
        admin: user.admin,
      };
      return res.json({
        message: "Logged in successfully",
        user: sanitizedUser,
      });
    });
  })(req, res, next);
});
router.post("/register", async (req, res) => {
  const { username, email, password, cpassword } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    if (password === cpassword) {
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
        admin: false,
      });
      await newUser.save();

      res.json({ message: "User registered successfully" });
    } else {
      res.json({ message: "Enter same passwords" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error registering user" });
  }
});
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Logged out successfully" });
  });
});
router.get("/authenticate", function (req, res) {
  if (req.isAuthenticated()) {
    // User is authenticated
    res.status(200).json({ authenticated: true, user: req.user });
  } else {
    // User is not authenticated
    res.status(401).json({ authenticated: false });
  }
});

module.exports = router;
