import express from "express";
import { connectDb } from "./config/db.js";
import auth from "./api/auth/auth.js";
import cors from "cors";

const app = express();
app.use(express.json({ extented: false }));
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

connectDb();

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Api running");
});

app.use("/api/auth", auth);

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
