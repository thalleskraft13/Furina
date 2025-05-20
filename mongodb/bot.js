const { Schema, model } = require("mongoose");

module.exports = model("Furina", new Schema({
  codigos: { type: Array, default: []}
}))