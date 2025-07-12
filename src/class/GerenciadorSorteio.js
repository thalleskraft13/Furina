const {
  ModalBuilder, TextInputBuilder, TextInputStyle,
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  EmbedBuilder, PermissionsBitField, time
} = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const ms = require('ms');
const Sorteio = require('../client/mongodb/Sorteio');
const UsuarioServidor = require('../client/mongodb/UsuarioServidor');

class GerenciadorSorteios {
  constructor(bot, gerenciadorTarefas) {
    this.bot = bot;
    this.gerenciadorTarefas = gerenciadorTarefas;
    this.sorteiosPendentes = new Map();

    this.bot.on('encerrarSorteio', async ({ sorteioId }) => {
      if (!sorteioId) return;
      const sorteioDoc = await Sorteio.findOne({ sorteioId }).catch(console.error);
      if (!sorteioDoc) return;
      await this.encerrarSorteio(sorteioDoc).catch(console.error);
    });
  }

  // Inicia o fluxo da criação, pergunta se quer criar o sorteio
  async criarSorteioComando(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: "Você precisa da permissão Gerenciar Mensagens para usar este comando.", ephemeral: true });
    }

    const botao = new ButtonBuilder()
      .setCustomId("criar_sorteio_confirmar_" + interaction.user.id)
      .setLabel("Criar Sorteio")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(botao);

    // Use reply para comandos slash iniciais (se for deferido antes, use editReply)
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply({ content: "Deseja criar um novo sorteio?", components: [row], ephemeral: true });
    } else {
      await interaction.reply({ content: "Deseja criar um novo sorteio?", components: [row], ephemeral: true });
    }
  }

  // Abre o modal para preencher prêmio, tempo e vencedores
  async abrirModal(interaction) {
    const modal = new ModalBuilder()
      .setCustomId(`modal_sorteio_${interaction.user.id}`)
      .setTitle("Criar Sorteio");

    const premioInput = new TextInputBuilder()
      .setCustomId("premio")
      .setLabel("Prêmio")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Ex: 100 primogemas")
      .setRequired(true);

    const tempoInput = new TextInputBuilder()
      .setCustomId("tempo")
      .setLabel("Tempo (ex: 1m, 1d, 1w)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Ex: 10m")
      .setRequired(true);

    const vencedoresInput = new TextInputBuilder()
      .setCustomId("vencedores")
      .setLabel("Quantidade de vencedores")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Ex: 1")
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(premioInput),
      new ActionRowBuilder().addComponents(tempoInput),
      new ActionRowBuilder().addComponents(vencedoresInput),
    );

    await interaction.showModal(modal);
  }

  // Trata o modal e perguntas sequenciais após o modal (canal, cargos, bônus)
  async tratarModal(interaction) {
    if (!interaction.isModalSubmit()) return;
    if (!interaction.customId.startsWith('modal_sorteio_')) return;
    if (!interaction.customId.endsWith(interaction.user.id)) {
      return interaction.reply({ content: "Este modal não é para você.", ephemeral: true });
    }

    const premio = interaction.fields.getTextInputValue('premio');
    const tempoTexto = interaction.fields.getTextInputValue('tempo');
    const tempoMs = ms(tempoTexto);
    if (!tempoMs || tempoMs <= 0) {
      return interaction.reply({ content: "Tempo inválido. Use um formato válido como 1m, 10m, 1h, 1d.", ephemeral: true });
    }
    const vencedores = parseInt(interaction.fields.getTextInputValue('vencedores'));
    if (isNaN(vencedores) || vencedores < 1) {
      return interaction.reply({ content: "Quantidade de vencedores inválida.", ephemeral: true });
    }

    const sorteioId = uuidv4();

    this.sorteiosPendentes.set(interaction.user.id, {
      sorteioId,
      premio,
      tempo: tempoMs,
      quantidadeVencedores: vencedores,
      guildId: interaction.guild.id,
      channelId: null,
      cargoRequisitos: [],
      bonusCargos: [],
      mensagemMin: 0,
      participantes: [],
      iniciado: false,
      finalizado: false,
      autorId: interaction.user.id,
    });

    await interaction.reply({ content: `📌 Qual canal deseja enviar o sorteio? Mencione ou digite o nome exato do canal. Você tem 30 segundos.`, ephemeral: true });

    const filterMsg = m => m.author.id === interaction.user.id && m.guild?.id === interaction.guild.id;
    const collector = interaction.channel.createMessageCollector({ filter: filterMsg, time: 30000, max: 1 });

    collector.on('collect', async (m) => {
      let channel = null;

      if (m.mentions.channels.size > 0) {
        channel = m.mentions.channels.first();
      } else {
        // Canal tipo 0 (GUILD_TEXT)
        channel = m.guild.channels.cache.find(c => c.name === m.content && c.type === 0);
      }

      if (!channel) {
        await interaction.followUp({ content: "Canal inválido ou não encontrado. Use /criar_sorteio para tentar novamente.", ephemeral: true });
        this.sorteiosPendentes.delete(interaction.user.id);
        return;
      }

      const data = this.sorteiosPendentes.get(interaction.user.id);
      data.channelId = channel.id;
      this.sorteiosPendentes.set(interaction.user.id, data);

      await interaction.followUp({ content: "📌 Quais cargos são obrigatórios para participar? Envie menções ou IDs separados por vírgula. Ou envie 'nenhum'. Você tem 30 segundos.", ephemeral: true });

      const collectorCargos = interaction.channel.createMessageCollector({ filter: filterMsg, time: 30000, max: 1 });
      collectorCargos.on('collect', async (msgCargos) => {
        let cargosInput = msgCargos.content.toLowerCase() === 'nenhum' ? [] : msgCargos.content.split(',').map(x => x.trim());

        cargosInput = cargosInput.map(c => {
          const mentionMatch = c.match(/^<@&(\d+)>$/);
          if (mentionMatch) return mentionMatch[1];
          return c;
        }).filter(Boolean);

        const guildRoles = interaction.guild.roles.cache;
        const cargosValidos = cargosInput.filter(cId => guildRoles.has(cId));

        if (cargosInput.length > 0 && cargosValidos.length !== cargosInput.length) {
          await interaction.followUp({ content: "Alguns cargos enviados não são válidos no servidor. Use /criar_sorteio para tentar novamente.", ephemeral: true });
          this.sorteiosPendentes.delete(interaction.user.id);
          return;
        }

        data.cargoRequisitos = cargosValidos;
        this.sorteiosPendentes.set(interaction.user.id, data);

        await interaction.followUp({ content: "📌 Agora envie os bônus de entrada por cargo no formato: `<@&ID> número`, separados por vírgula. Ou envie 'nenhum'. Exemplo: `<@&12345> 2, <@&67890> 3`", ephemeral: true });

        const collectorBonus = interaction.channel.createMessageCollector({ filter: filterMsg, time: 60000, max: 1 });
        collectorBonus.on('collect', async (msgBonus) => {
          const input = msgBonus.content.toLowerCase();
          if (input === 'nenhum') {
            data.bonusCargos = [];
          } else {
            const partes = input.split(',').map(x => x.trim());
            const bonusCargos = [];

            for (const parte of partes) {
              const match = parte.match(/^<@&(\d+)> (\d+)$/);
              if (!match) {
                await interaction.followUp({ content: "Formato inválido no bônus. Use /criar_sorteio para tentar novamente.", ephemeral: true });
                this.sorteiosPendentes.delete(interaction.user.id);
                return;
              }
              const cargoId = match[1];
              const bonus = parseInt(match[2]);
              if (isNaN(bonus) || bonus < 1) {
                await interaction.followUp({ content: "Número de bônus inválido. Use /criar_sorteio para tentar novamente.", ephemeral: true });
                this.sorteiosPendentes.delete(interaction.user.id);
                return;
              }
              if (!interaction.guild.roles.cache.has(cargoId)) {
                await interaction.followUp({ content: `Cargo ${cargoId} não encontrado no servidor. Use /criar_sorteio para tentar novamente.`, ephemeral: true });
                this.sorteiosPendentes.delete(interaction.user.id);
                return;
              }
              bonusCargos.push({ cargoId, bonus });
            }

            data.bonusCargos = bonusCargos;
          }

          this.sorteiosPendentes.set(interaction.user.id, data);

          const sorteio = new Sorteio({
            sorteioId: data.sorteioId,
            guildId: data.guildId,
            channelId: data.channelId,
            autorId: data.autorId,
            premio: data.premio,
            quantidadeVencedores: data.quantidadeVencedores,
            tempoMs: data.tempo,
            cargoRequisitos: data.cargoRequisitos,
            bonusCargos: data.bonusCargos,
            participantes: [],
            finalizado: false,
            criadoEm: new Date(),
            iniciado: false,
          });

          await sorteio.save().catch(console.error);

          this.sorteiosPendentes.delete(interaction.user.id);

          
          // Envia mensagem no canal com embed e botão iniciar
          const canal = interaction.guild.channels.cache.get(data.channelId);
          if (!canal) {
            await interaction.followUp({ content: "Canal não encontrado.", ephemeral: true });
            return;
          }

          const embed = new EmbedBuilder()
            .setTitle("🎉 Novo Sorteio!")
            .setDescription(`**Prêmio:** ${data.premio}\n**Vencedores:** ${data.quantidadeVencedores}\n**Requisitos de Cargos:** ${data.cargoRequisitos.length > 0 ? data.cargoRequisitos.map(c => `<@&${c}>`).join(', ') : 'Nenhum'}\n**Bônus por Cargo:** ${data.bonusCargos.length > 0 ? data.bonusCargos.map(b => `<@&${b.cargoId}> (${b.bonus} entradas)`).join(', ') : 'Nenhum'}`)
            .setColor('Blue');

          const btnIniciar = new ButtonBuilder()
            .setCustomId(`sorteio_iniciar_${data.sorteioId}_${interaction.user.id}`)
            .setLabel("Iniciar Sorteio")
            .setStyle(ButtonStyle.Success);

          const row = new ActionRowBuilder().addComponents(btnIniciar);

          await interaction.followUp({ content: `Id do sorteio: ${data.sorteioId}`, embeds: [embed], components: [row], ephemeral: false}).catch(console.error);
        });

        collectorBonus.on('end', collected => {
          if (collected.size === 0) {
            interaction.followUp({ content: "Tempo esgotado para bônus de entrada. Use /criar_sorteio para tentar novamente.", ephemeral: true });
            this.sorteiosPendentes.delete(interaction.user.id);
          }
        });
      });

      collectorCargos.on('end', collected => {
        if (collected.size === 0) {
          interaction.followUp({ content: "Tempo esgotado para cargos obrigatórios. Use /criar_sorteio para tentar novamente.", ephemeral: true });
          this.sorteiosPendentes.delete(interaction.user.id);
        }
      });
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.followUp({ content: "Tempo esgotado para canal. Use /criar_sorteio para tentar novamente.", ephemeral: true });
        this.sorteiosPendentes.delete(interaction.user.id);
      }
    });
  }

  // Método para iniciar sorteio - muda estado e agenda tarefa para encerrar
  async iniciarSorteio(interaction, sorteioId, autorId) {
    await interaction.deferReply({ ephemeral: true });

    const sorteioDoc = await Sorteio.findOne({ sorteioId }).catch(console.error);
    if (!sorteioDoc) return interaction.editReply("Sorteio não encontrado.");
    if (sorteioDoc.finalizado) return interaction.editReply("Sorteio já finalizado.");
    if (sorteioDoc.iniciado) return interaction.editReply("Sorteio já iniciado.");
    if (interaction.user.id !== autorId) return interaction.editReply("Apenas o autor do sorteio pode iniciar.");

    sorteioDoc.iniciado = true;
    await sorteioDoc.save().catch(console.error);

    const dataExec = new Date(Date.now() + sorteioDoc.tempoMs);

    await this.gerenciadorTarefas.criarTarefa('encerrarSorteio', { sorteioId: sorteioDoc.sorteioId, guildId: sorteioDoc.guildId }, dataExec).catch(console.error);

    await interaction.editReply("Sorteio iniciado com sucesso!");

    const canal = await this.bot.channels.fetch(sorteioDoc.channelId).catch(() => null);
    if (!canal) return;

    const botaoParticipar = new ButtonBuilder()
      .setCustomId(`sorteio_participar_${sorteioId}`)
      .setLabel('Participar')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(botaoParticipar);

    const dataFim = new Date(Date.now() + sorteioDoc.tempoMs);


    const embed = new EmbedBuilder()
      .setTitle("🎉 Sorteio iniciado!")
      .setDescription(
    `**✨ Prêmio:** ${sorteioDoc.premio}\n` +
    `**🎯 Vencedores:** ${sorteioDoc.quantidadeVencedores}\n` +
    `**⏳ Termina em:** ${time(dataFim, 'R')} (${time(dataFim, 'f')})\n\n` +
    (sorteioDoc.cargoRequisitos.length > 0
      ? `**📜 Requisitos de Cargos:** ${sorteioDoc.cargoRequisitos.map(id => `<@&${id}>`).join(', ')}\n`
      : '') +
    (sorteioDoc.bonusCargos.length > 0
      ? `**🎁 Bônus por Cargo:** ${sorteioDoc.bonusCargos.map(b => `<@&${b.cargoId}> (+${b.bonus})`).join(', ')}\n`
      : '') +
    `\n<:furina:1150189550846025819> Boa sorte, viajantes! Que a justiça divina sorria para você!`
  )
  .setColor("#4A90E2")

    await canal.send({ embeds: [embed], components: [row] }).catch(console.error);
  }

  // Participar do sorteio, considerando cargos, mensagem mínima e evitar duplicados
  async participar(interaction) {
    await interaction.deferReply({ ephemeral: true });

    // customId sorteio_participar_<sorteioId>
    const parts = interaction.customId.split('_');
    const sorteioId = parts.slice(2).join('_'); // Para caso sorteioId tenha underscores
    const sorteioDoc = await Sorteio.findOne({ sorteioId }).catch(console.error);
    if (!sorteioDoc) return interaction.editReply("Sorteio não encontrado.");
    if (sorteioDoc.finalizado) return interaction.editReply("Sorteio já finalizado.");

    const membro = interaction.member;

    // Verifica cargos obrigatórios
    if (sorteioDoc.cargoRequisitos.length > 0) {
      const temCargo = sorteioDoc.cargoRequisitos.some(c => membro.roles.cache.has(c));
      if (!temCargo) return interaction.editReply("Você não possui os cargos necessários para participar.");
    }

    // Evita participar duas vezes
    if (sorteioDoc.participantes.includes(membro.id)) {
      return interaction.editReply("Você já está participando do sorteio.");
    }

    sorteioDoc.participantes.push(membro.id);
    await sorteioDoc.save().catch(console.error);

    return interaction.editReply("💫 Hah! Vejo que decidiu desafiar o destino! Sua entrada foi registrada — agora, prove que a sorte está do seu lado!");
  }

  // Encerrar sorteio manualmente por comando
  async encerrar(interaction, sorteioId) {
   // await interaction.deferReply({ ephemeral: true });

    const sorteioDoc = await Sorteio.findOne({ sorteioId }).catch(console.error);
    if (!sorteioDoc) return interaction.editReply("Sorteio não encontrado.");
    if (sorteioDoc.finalizado) return interaction.editReply("Sorteio já foi finalizado.");
    if (interaction.user.id !== sorteioDoc.autorId) {
      return interaction.editReply("Apenas o autor do sorteio pode encerrar.");
    }

    await this.encerrarSorteio(sorteioDoc);

    return interaction.editReply("Sorteio encerrado com sucesso.");
  }

  // Reroll - escolher novos vencedores depois de finalizado
  async reroll(interaction, sorteioId) {
   // await interaction.deferReply({ ephemeral: true });

    const sorteioDoc = await Sorteio.findOne({ sorteioId }).catch(console.error);
    if (!sorteioDoc) return interaction.editReply("Sorteio não encontrado.");
    if (!sorteioDoc.finalizado) return interaction.editReply("Sorteio não foi finalizado ainda.");
    if (interaction.user.id !== sorteioDoc.autorId) {
      return interaction.editReply("Apenas o autor do sorteio pode reroll.");
    }

    // Sorteia novamente
    const vencedores = this.sortearVencedores(sorteioDoc);

    sorteioDoc.vencedores = vencedores;
    await sorteioDoc.save().catch(console.error);

    const canal = await this.bot.channels.fetch(sorteioDoc.channelId).catch(() => null);
    if (!canal) return interaction.editReply("Canal do sorteio não encontrado.");

    const embed = new EmbedBuilder()
      .setTitle("🎉 Sorteio Rerolado!")
      .setDescription(`Prêmio: **${sorteioDoc.premio}**\nNovos vencedores:\n${vencedores.map(v => `<@${v}>`).join('\n')}`)
      .setColor("Gold");

    await canal.send({ embeds: [embed] }).catch(console.error);

    return interaction.editReply("Sorteio rerolado e vencedores anunciados.");
  }

  // Encerrar sorteio - sortear vencedores, marcar finalizado e enviar mensagem
  async encerrarSorteio(sorteioDoc) {
    if (sorteioDoc.finalizado) return;

    const canal = await this.bot.channels.fetch(sorteioDoc.channelId).catch(() => null);
    if (!canal) return;

    const vencedores = this.sortearVencedores(sorteioDoc);

    sorteioDoc.vencedores = vencedores;
    sorteioDoc.finalizado = true;
    await sorteioDoc.save().catch(console.error);

    const content = `💙 O grande julgamento chegou ao fim! Veja quem foi agraciado pela sorte divina do Arconte da Justiça!\n\n${
  vencedores.length > 0 ? vencedores.map(v => `<@${v}>`).join('\n') : "⚠️ Nenhum vencedor foi selecionado."
}`;


    await canal.send({ content }).catch(console.error);
  }

  // Sorteia os vencedores considerando bônus por cargo e participantes válidos
  sortearVencedores(sorteioDoc) {
    const participantesPonderados = [];

    for (const participanteId of sorteioDoc.participantes) {
      let entradas = 1; // Entrada padrão

      const membro = this.bot.guilds.cache.get(sorteioDoc.guildId)?.members.cache.get(participanteId);
      if (membro) {
        for (const bonus of sorteioDoc.bonusCargos) {
          if (membro.roles.cache.has(bonus.cargoId)) {
            entradas += bonus.bonus;
          }
        }
      }

      for (let i = 0; i < entradas; i++) {
        participantesPonderados.push(participanteId);
      }
    }

    if (participantesPonderados.length === 0) return [];

    // Embaralhar array
    for (let i = participantesPonderados.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participantesPonderados[i], participantesPonderados[j]] = [participantesPonderados[j], participantesPonderados[i]];
    }

    const vencedoresSet = new Set();
    for (const participante of participantesPonderados) {
      if (vencedoresSet.size >= sorteioDoc.quantidadeVencedores) break;
      vencedoresSet.add(participante);
    }

    return Array.from(vencedoresSet);
  }

  // Incrementa mensagens do usuário (para requisito mínimo)
  async tratarMensagem(message) {
    if (message.author.bot) return;

    let usuarioServidor = await UsuarioServidor.findOne({ servidorId: message.guild.id, usuarioId: message.author.id }).catch(console.error);
    if (!usuarioServidor) {
      usuarioServidor = new UsuarioServidor({
        servidorId: message.guild.id,
        usuarioId: message.author.id,
        mensagens: 1,
      });
    } else {
      usuarioServidor.mensagens++;
    }
    await usuarioServidor.save().catch(console.error);
  }

  // Trata interação de botões
  async tratarBotao(interaction) {
    if (!interaction.isButton()) return;

    const customId = interaction.customId;

    if (customId.startsWith('criar_sorteio_confirmar_')) {
      
      return this.abrirModal(interaction);
    }

    if (customId.startsWith('sorteio_iniciar_')) {
      const parts = customId.split('_');
      const sorteioId = parts[2];
      const autorId = parts[3];
      if (interaction.user.id !== autorId) {
        return interaction.reply({ content: "Apenas o autor do sorteio pode iniciar.", ephemeral: true });
      }
      return this.iniciarSorteio(interaction, sorteioId, autorId);
    }

    if (customId.startsWith('sorteio_participar_')) {
      return this.participar(interaction);
    }

    if (customId.startsWith('sorteio_encerrar_')) {
      const sorteioId = customId.replace('sorteio_encerrar_', '');
      return this.encerrar(interaction, sorteioId);
    }

    if (customId.startsWith('sorteio_reroll_')) {
      const sorteioId = customId.replace('sorteio_reroll_', '');
      return this.reroll(interaction, sorteioId);
    }
  }
}

module.exports = GerenciadorSorteios;
