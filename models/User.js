const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//Definiera användarschema
const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname:  { type: String, required: true },
  email:     { type: String, required: true, unique: true, trim: true },
  password:  { type: String, required: true },
  created:   { type: Date, default: Date.now },
});

//Jämför inmatat lösenord med det hashade lösenordet i databasen.
userSchema.methods.comparePassword = async function (inputPassword) {
  try {
    return await bcrypt.compare(inputPassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model("User", userSchema);