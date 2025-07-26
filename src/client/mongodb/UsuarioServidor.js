const { Schema, model } = require("mongoose");

const usuarioServidorSchema = new Schema({
  servidorId: { type: String, required: true },
  usuarioId: { type: String, required: true },
  mensagens: { type: Number, default: 0 },
  sorteioId: { type: String}
});




module.exports = model("UsuarioServidor", usuarioServidorSchema);
