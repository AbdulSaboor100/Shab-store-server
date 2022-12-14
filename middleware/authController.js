import jwt from "jsonwebtoken";
import config from "config";

export default async function (req, res, next) {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({ status: "No token, authorization denied" });
    }
    const jwtSecret = config.get("jwtSecret");
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ status: "Token is not valid" });
  }
}
