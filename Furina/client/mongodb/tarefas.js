const mongoose = require("mongoose");

const tarefaSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
  },
  dados: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  guildId: {
    type: String,
    default: null,
  },
  timestampExecucao: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pendente', 'executada'],
    default: 'pendente',
  },
});

module.exports = mongoose.model("Tarefa", tarefaSchema);
