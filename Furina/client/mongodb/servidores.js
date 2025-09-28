const { Schema, model } = require("mongoose");

const MensagemAutoSchema = new Schema({
  ativado: { type: Boolean, default: false },
  canal: { type: String, default: null },
  tipo: { type: String, enum: ["texto", "embed"], default: "texto" },
  conteudo: { type: String, default: null },
  embed: { type: Object, default: null }
}, { _id: false });

const ServidorSchema = new Schema({
  serverId: { type: String, required: true, unique: true },
  usoDeComandos: { type: Number, default: 0 },
  parceiro: { type: Boolean, default: false },
  premium: { type: Number, default: 0 },
  logs: {
    react: {
      ativado: { type: Boolean, default: false },
      channel: { type: String, default: null }
    }
  },
  autorole: {
     cargos: { type: [String], default: [] }
   },
  mensagens: {
    boas_vindas: { type: MensagemAutoSchema, default: () => ({}) },
    saida: { type: MensagemAutoSchema, default: () => ({}) },
    automatica: { type: MensagemAutoSchema, default: () => ({}) }
  },
  mensagens_personalizadas: {
  type: [
    {
      palavra: { type: String, required: true },
      resposta: { type: String },
      embed: { type: Object, default: null },
      tipo: { type: String, enum: ["texto", "embed"], default: "texto" },
      modo: { type: String, enum: ["responder", "enviar"], default: "responder" },
      ativado: { type: Boolean, default: true }
    }
  ],
  default: []
},

  mareDouradaConfig: {
    bonusDaily: { type: Boolean, default: false },
    primogemasPorMsg: { type: Boolean, default: false },
    diminuiPity: { type: Boolean, default: false },
  },

  furinaEventos: { type: Boolean, default: false }

});

module.exports = model("Servidores", ServidorSchema);
