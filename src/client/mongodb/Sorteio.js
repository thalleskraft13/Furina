const mongoose = require('mongoose');

const BonusCargoSchema = new mongoose.Schema({
  cargoId: String,
  bonus: Number,
});

const SorteioSchema = new mongoose.Schema({
  sorteioId: String, // ID personalizado gerado
  premio: String,
  guildId: String,
  channelId: String,
  mensagemId: String,
  dataCriacao: { type: Date, default: Date.now },
  dataFinalizacao: Date,

  participantes: [String], // IDs dos usuários participantes
  cargoRequisitos: [String], // IDs de cargos obrigatórios
  bonusCargos: [BonusCargoSchema], // Cargos com bônus de entrada

  quantidadeVencedores: { type: Number, default: 1 },
  mensagemMin: { type: Number, default: 0 }, // Mensagens mínimas

  finalizado: { type: Boolean, default: false },
  tempoMs: { type: Number, default: 0 },
});

module.exports = mongoose.model('Sorteio', SorteioSchema);
