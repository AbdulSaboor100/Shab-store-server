import express from "express";
import User from "../../modals/User/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "config";
import {
  isEmail,
  isEmpty,
  isLength,
  comparePassword,
  hashPassword,
} from "../../functions/functions.js";
import authController from "../../middleware/authController.js";
import Product from "../../modals/Product/Product.js";

const router = express();
const secretJwtKey = config.get("jwtSecret");

router.post("/", (req, res) => {
  res.send("hello");
});

router.post("/register", async (req, res) => {
  try {
    let { email, password, image, name } = req.body;
    if (isEmpty(email)) {
      return res
        .status(400)
        .json({ success: false, status: "Email not found" });
    }
    if (isEmpty(password)) {
      return res
        .status(400)
        .json({ success: false, status: "Password not found" });
    }
    if (isEmpty(image)) {
      return res
        .status(400)
        .json({ success: false, status: "Image not found" });
    }
    if (isEmpty(name)) {
      return res.status(400).json({ success: false, status: "Name not found" });
    }
    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, status: "Email not valid", email });
    }
    if (isLength(password)) {
      return res.status(400).json({
        success: false,
        status: "Password is less then 6 characters",
      });
    }
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, status: "User already existed" });
    }
    user = new User({
      email,
      password: await hashPassword(password),
      userType: "ADMIN",
      name,
      image,
    });
    console.log(user);
    await user.save();
    let payload = {
      id: user._id,
    };
    jwt.sign(payload, secretJwtKey, { expiresIn: "1h" }, (err, token) => {
      if (err) {
        throw err;
      } else {
        res
          .status(200)
          .json({ success: true, status: "Register successfully", token });
      }
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
  }
});

router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (isEmpty(email)) {
      return res
        .status(400)
        .json({ success: false, status: "Email not found" });
    }
    if (isEmpty(password)) {
      return res
        .status(400)
        .json({ success: false, status: "Password not found" });
    }
    if (!isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, status: "Email not valid", email });
    }
    if (isLength(password)) {
      return res.status(400).json({
        success: false,
        status: "Password is less then 6 characters",
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, status: "User not exits" });
    }
    let isPassword = await comparePassword(user?.password, password);
    if (!isPassword) {
      return res
        .status(400)
        .json({ success: false, status: "Invalid password" });
    }
    let payload = {
      id: user._id,
    };
    jwt.sign(payload, secretJwtKey, { expiresIn: "1h" }, (err, token) => {
      if (err) {
        throw err;
      } else {
        res
          .status(200)
          .json({ success: true, status: "Login successfully", token });
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
    console.log(error);
  }
});

router.post("/add-product", authController, async (req, res) => {
  try {
    let { title, description, image, price, sizes, category, colors } =
      req.body;
    if (isEmpty(title)) {
      return res
        .status(400)
        .json({ success: false, status: "Title not found" });
    }
    if (isEmpty(description)) {
      return res
        .status(400)
        .json({ success: false, status: "Desciption not found" });
    }
    if (isEmpty(image)) {
      return res
        .status(400)
        .json({ success: false, status: "Image not found" });
    }
    if (isEmpty(price)) {
      return res
        .status(400)
        .json({ success: false, status: "Price not found" });
    }
    if (!sizes[0]) {
      return res
        .status(400)
        .json({ success: false, status: "Sizes not found" });
    }
    if (isEmpty(category)) {
      return res
        .status(400)
        .json({ success: false, status: "Category not found" });
    }
    if (!colors[0]) {
      return res
        .status(400)
        .json({ success: false, status: "Colors not found" });
    }
    let product = await Product({
      title,
      description,
      image,
      price,
      sizes,
      colors,
      category,
    });
    await product.save();
    res.status(200).json({ success: true, status: "Product Saved", product });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
    console.log(error);
  }
});

router.get("/get-products", async (req, res) => {
  try {
    let product = await Product.find();
    if (!product) {
      return res
        .status(400)
        .json({ success: false, status: "No product found" });
    }
    res
      .status(200)
      .json({ success: true, status: "Products fetched", product });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
    console.log(error);
  }
});

router.get("/product/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let product = await Product.find({ category: id });
    if (!product) {
      return res
        .status(400)
        .json({ success: false, status: "No product found" });
    }
    res
      .status(200)
      .json({ success: true, status: "Categpry's products fetched", product });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
    console.log(error);
  }
});

router.post("/delete-product", async (req, res) => {
  try {
    let ids = req.body;
    let product;
    ids?.filter(async (id, i) => {
      product = await Product.findByIdAndDelete({ _id: id });
    });
    res.status(200).json({ success: true, status: "Product deleted" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
    console.log(error);
  }
});

export default router;
