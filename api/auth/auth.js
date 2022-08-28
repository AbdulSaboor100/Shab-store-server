import express from "express";
import User from "../../modals/User/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "config";
import upload from "../../config/multer.js";
import cloudinary from "../../config/cloudinary.js";
import fs from "fs";
import authController from "../../middleware/authController.js";
import {
  hashPassword,
  comparePassword,
  isEmail,
  isEmpty,
  isLength,
} from "../../functions/functions.js";

const router = express();
const secretJwtKey = config.get("jwtSecret");

const fileUploader = async (path) => {
  let file = await cloudinary(path, "Images");
  return file;
};

router.post("/register", async (req, res) => {
  try {
    let { email, password, name, image } = req.body;
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
      userType: "CLIENT",
      name,
      image,
    });
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

router.post("/upload-images", upload.array("image"), async (req, res) => {
  try {
    const urls = [];
    const files = req.files;
    if (!files) {
      return res
        .status(400)
        .json({ success: false, status: "Please upload image" });
    }
    for (const file of files) {
      const { path } = file;
      const newPath = await fileUploader(file.path);
      urls.push(newPath);
      fs.unlinkSync(path);
    }

    res
      .status(200)
      .json({ success: true, status: "File uploaded", file: urls });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
    console.log(error);
  }
});

router.get("/current-user", authController, async (req, res) => {
  try {
    let user = await User.findById({ _id: req.user.id }).select("-password");
    if (!user) {
      return res.status(500).json({ success: false, status: "User not found" });
    }
    let payload = {
      id: req.user.id,
    };

    jwt.sign(payload, secretJwtKey, { expiresIn: "1h" }, (err, token) => {
      if (err) {
        throw err;
      } else {
        res
          .status(200)
          .json({ success: true, status: "Current user fetched", token, user });
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, status: error?.response, error: error });
    console.log(error);
  }
});

export default router;
