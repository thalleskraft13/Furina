const { Schema, model } = require("mongoose");

const ServidorSchema = new Schema({
  serverId: { type: String, required: true, unique: true }, // ID do servidor Discord
  usoDeComandos: { type: Number, default: 0 },              // contador de comandos usados
  parceiro: { type: Boolean, default: false },              // status de parceiro
  logs: {
    react: {
      ativado: { type: Boolean, default: false },           // se o sistema de logs de reação está ativo
      channel: { type: String, default: null }               // canal de logs de reação
    }
  }
});

module.exports = model("Servidores", ServidorSchema);
