import express from "express";
import User from "../../modals/User/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "config";

const router = express();
const secretJwtKey = config.get("jwtSecret");
