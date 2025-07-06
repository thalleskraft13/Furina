const TarefaModel = require('../client/mongodb/tarefas');

class GerenciadorTarefas {
  constructor(client) {
    this.client = client;
    this.checarIntervalo = 60 * 1000;
    this.logChannel = "1387746271099621497";
    this.iniciar();
  }

  iniciar() {
    this.interval = setInterval(() => this.checarTarefasPendentes(), this.checarIntervalo);
  }

  async checarTarefasPendentes() {
    const agora = new Date();

    const tarefas = await TarefaModel.find({
      status: 'pendente',
      timestampExecucao: { $lte: agora },
    });

    for (const tarefa of tarefas) {
      if (tarefa.guildId && !this.client.guilds.cache.has(tarefa.guildId)) {
        continue;
      }

      try {
        await this.executarTarefa(tarefa);
        tarefa.status = 'executada';
        await tarefa.save();
        await this.enviarLogEmbed(tarefa, "✅ Tarefa Executada", `A tarefa foi executada com sucesso.`, 0x57F287);
      } catch (err) {
        console.error(`[TAREFAS] Erro ao executar tarefa ${tarefa._id}:`, err);
        await this.enviarLogErro(tarefa, err);
      }
    }
  }

  async executarTarefa(tarefa) {
    switch (tarefa.tipo) {
      case 'encerrarSorteio':
        if (!tarefa.dados?.sorteioId) {
          console.warn(`[TAREFAS] Sorteio sem ID na tarefa ${tarefa._id}`);
          return;
        }

        this.client.emit('encerrarSorteio', {
          sorteioId: tarefa.dados.sorteioId,
        });

        await this.enviarLogEmbed(tarefa, "🎁 Encerramento de Sorteio", `O sorteio \`${tarefa.dados.sorteioId}\` foi encerrado.`, 0x3B88C3);
        break;

      case 'lembrete': {
        const { canalId, userId, mensagem } = tarefa.dados;

        if (!canalId || !mensagem || !userId) {
          console.warn(`[TAREFAS] Dados inválidos em lembrete ${tarefa._id}`);
          return;
        }

        const canal = await this.client.channels.fetch(canalId).catch(() => null);
        if (!canal || !canal.isTextBased()) {
          console.warn(`[TAREFAS] Canal inválido ou não encontrado`);
          return;
        }

        try {
          await canal.send(`🎭 <@${userId}>, lembre-se de: **${mensagem}**\nComo Arconte da Justiça, espero que isso tenha valido a espera~ ✨`);
          await this.enviarLogEmbed(tarefa, "⏰ Lembrete Enviado", `Lembrete enviado para <@${userId}> no canal <#${canalId}>.`, 0xFEE75C);
        } catch (e) {
          console.error(`[TAREFAS] Erro ao enviar lembrete no canal ${canalId}:`, e.message);
          await this.enviarLogErro(tarefa, e);
        }
        break;
      }

      default:
        await this.enviarLogEmbed(tarefa, "❓ Tipo Desconhecido", `Tipo: \`${tarefa.tipo}\``, 0x9C9C9C);
        console.log(`[TAREFAS] Tipo de tarefa desconhecido: ${tarefa.tipo}`);
    }
  }

  async criarTarefa(tipo, dados, dataExecucao) {
    if (!(dataExecucao instanceof Date) || isNaN(dataExecucao.getTime())) {
      throw new Error("Data de execução inválida ao criar tarefa.");
    }

    const novaTarefa = new TarefaModel({
      tipo,
      dados,
      guildId: dados.guildId || null,
      timestampExecucao: dataExecucao,
      status: 'pendente',
    });

    await novaTarefa.save();
    

    await this.enviarLogEmbed(novaTarefa, "🆕 Nova Tarefa Criada", `Tipo: \`${tipo}\`\nExecução: <t:${Math.floor(dataExecucao.getTime() / 1000)}:F>`, 0x3DD1D9);
  }

  async enviarLogEmbed(tarefa, titulo, descricao, cor) {
    const embed = {
      title: titulo,
      description: descricao,
      color: cor,
      fields: [
        { name: "ID da Tarefa", value: `\`${tarefa._id}\`` },
        { name: "Tipo", value: `\`${tarefa.tipo}\``, inline: true },
        { name: "Guild ID", value: tarefa.guildId ? `\`${tarefa.guildId}\`` : "`Global`", inline: true },
        { name: "Execução", value: `<t:${Math.floor(tarefa.timestampExecucao.getTime() / 1000)}:R>` }
      ],
      timestamp: new Date().toISOString()
    };

    await this.client.restMessenger.enviar(this.logChannel, { embeds: [embed] });
  }

  async enviarLogErro(tarefa, erro) {
    const embed = {
      title: "❌ Erro ao Executar Tarefa",
      description: `Erro: \`\`\`${erro.message}\`\`\``,
      color: 0xFF4C4C,
      fields: [
        { name: "ID da Tarefa", value: `\`${tarefa._id}\`` },
        { name: "Tipo", value: `\`${tarefa.tipo}\``, inline: true },
        { name: "Guild ID", value: tarefa.guildId ? `\`${tarefa.guildId}\`` : "`Global`", inline: true },
      ],
      timestamp: new Date().toISOString()
    };

    await this.client.restMessenger.enviar(this.logChannel, { embeds: [embed] });
  }
}

module.exports = GerenciadorTarefas;