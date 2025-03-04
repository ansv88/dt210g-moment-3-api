const mongoose = require("mongoose");

//Definiera användarschema
const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  description: { type: String },
  category:    { type: String, required: true },
  amount:      { type: Number, default: 0, required: true },
  price:       { type: Number, default: 0, required: true },
});

module.exports = mongoose.model("Product", productSchema);