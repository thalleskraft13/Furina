const { Schema, model } = require("mongoose");

module.exports = model("Usuários", new Schema({
  id: { type: String },
  primogemas: { type: Number, default: 0 },
  mora: { type: Number, default: 0 },
  
  level: {
    ar: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    xpMax: { type: Number, default: 375 }
  },
}))