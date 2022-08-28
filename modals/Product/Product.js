import mongoose from "mongoose";

let productSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  },
  price: {
    type: String,
  },
  sizes: {
    type: Array,
  },
  category: {
    type: String,
  },
  colors: {
    type: Array,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

let Product = mongoose.model("product", productSchema);

export default Product;
