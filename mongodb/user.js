const { Schema, model } = require("mongoose");

const personagemSchema = new Schema({
  nome: { type: String, required: true },
  c: { type: Number, default: 0 }
});

module.exports = model("Usuários", new Schema({
  id: { type: String, required: true },
  primogemas: { type: Number, default: 0 },
  mora: { type: Number, default: 0 },

  level: {
    ar: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    xpMax: { type: Number, default: 375 }
  },

  gacha: {
    pity: {
      five: { type: Number, default: 0 },
      four: { type: Number, default: 0 },
      garantia5: { type: Boolean, default: false }
    }
  },

  personagens: { type: [personagemSchema], default: [] }
}));
