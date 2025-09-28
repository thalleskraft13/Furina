const { Schema, model } = require("mongoose");

let userSchema = new Schema({
  userId: { type: String, required: true },

  //Evento
  reactEvent: {
    pontos: { type: Number, default: 0 }
  }
})

let react = new Schema({
  messageId: { type: String, required: true },
  expires: { type: Number, default: 0 },
  emoji: { type: String, required: true },
  quemUsou: { type: Array, default: [] }
})

module.exports = {
  user: model("EdenUsers", userSchema),
  react: model("EdenReactEvent", react),
}