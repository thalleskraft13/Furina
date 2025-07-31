const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionsBitField,
  time,
} = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const ms = require('ms');
const Sorteio = require('../client/mongodb/Sorteio');

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

  // Método principal para lidar com botões de sorteio
  async tratarBotao(interaction) {
    const customId = interaction.customId;
    if (!customId) return;

    if (customId.startsWith('sorteio_participar_')) {
      await this.participar(interaction);
    } else if (customId.startsWith('sorteio_iniciar_')) {
      const parts = customId.split('_');
      const sorteioId = parts[2];
      const autorId = parts[3];
      await this.iniciarSorteio(interaction, sorteioId, autorId);
    }
  }

  // Criar sorteio via comando, perguntas sequenciais e salvamento no DB
  async criarSorteioComando(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({
        content: 'Você precisa da permissão Gerenciar Mensagens para usar este comando.',
        ephemeral: true,
      });
    }

    const userId = interaction.user.id;
    const channelInter = interaction.channel;

    const dadosSorteio = {
      premio: null,
      tempoMs: null,
      qtdVencedores: null,
      channelId: null,
      cargosObrigatorios: [],
      bonusPorCargo: [],
      autorId: userId,
      guildId: interaction.guild.id,
    };

    const perguntar = async (pergunta, ephemeral = false) => {
      await interaction.followUp({ content: pergunta });
      try {
        const resposta = await this.bot.CustomCollector.coletarMensagem({
          userId,
          channel: channelInter,
          time: 300000,
        });
        
        return resposta.content;
      } catch {
        await interaction.followUp({
          content: '⏰ Tempo esgotado para responder. Use /criar_sorteio para tentar novamente.',
          ephemeral: true,
        });
        throw new Error('Tempo esgotado');
      }
    };

    try {
      dadosSorteio.premio = await perguntar('📌 Qual é o prêmio do sorteio?');

      while (true) {
        const tempoResposta = await perguntar('📌 Qual a duração do sorteio? (Exemplo: 10m, 1h, 1d)');
        const tempoMs = ms(tempoResposta);
        if (!tempoMs || tempoMs <= 0) {
          await interaction.followUp({
            content: '❌ Tempo inválido. Use formatos como 10m, 1h, 1d.',
            ephemeral: true,
          });
          continue;
        }
        dadosSorteio.tempoMs = tempoMs;
        break;
      }

      while (true) {
        const vencedoresResposta = await perguntar(
          '📌 Quantos vencedores terá o sorteio? (Digite um número inteiro)',
        );
        const qtd = parseInt(vencedoresResposta, 10);
        if (isNaN(qtd) || qtd < 1) {
          await interaction.followUp({
            content: '❌ Quantidade inválida. Digite um número inteiro maior que zero.',
            ephemeral: true,
          });
          continue;
        }
        dadosSorteio.qtdVencedores = qtd;
        break;
      }

      let canal;
      while (true) {
        const canalResposta = await perguntar(
          '📌 Qual canal deseja enviar o sorteio? Mencione ou digite o nome exato do canal.',
        );
        if (!canalResposta) continue;

        if (interaction.guild.channels.cache.some(c => c.id === canalResposta)) {
          canal = interaction.guild.channels.cache.get(canalResposta);
        } else if (
          interaction.guild.channels.cache.some(c => `<#${c.id}>` === canalResposta.trim())
        ) {
          canal = interaction.guild.channels.cache.find(c => `<#${c.id}>` === canalResposta.trim());
        } else if (interaction.guild.channels.cache.some(c => c.name === canalResposta.trim())) {
          canal = interaction.guild.channels.cache.find(c => c.name === canalResposta.trim());
        } else if (
          interaction.guild.channels.cache.some(c => c.toString() === canalResposta.trim())
        ) {
          canal = interaction.guild.channels.cache.find(c => c.toString() === canalResposta.trim());
        } else {
          canal = null;
        }

        if (!canal || canal.type !== 0) {
          await interaction.followUp({
            content: '❌ Canal inválido. Por favor, mencione ou digite o nome exato do canal de texto.',
            ephemeral: true,
          });
          continue;
        }

        dadosSorteio.channelId = canal.id;
        break;
      }

      while (true) {
        const cargosResposta = await perguntar(
          '📌 Quais cargos são obrigatórios para participar? Mencione-os ou envie IDs separados por vírgula, ou digite "nenhum".',
          true,
        );

        if (cargosResposta.toLowerCase() === 'nenhum') {
          dadosSorteio.cargosObrigatorios = [];
          break;
        }

        const cargosSplit = cargosResposta
          .split(',')
          .map(x => x.trim())
          .filter(Boolean);

        const cargosParseados = cargosSplit.map(c => {
          const match = c.match(/^<@&(\d+)>$/);
          return match ? match[1] : c;
        });

        const cargosValidos = cargosParseados.filter(id => interaction.guild.roles.cache.has(id));

        if (cargosValidos.length !== cargosParseados.length) {
          await interaction.followUp({
            content:
              '❌ Alguns cargos não são válidos ou não foram encontrados no servidor. Tente novamente ou envie "nenhum".',
            ephemeral: true,
          });
          continue;
        }

        dadosSorteio.cargosObrigatorios = cargosValidos;
        break;
      }

      while (true) {
        const bonusResposta = await perguntar(
          '📌 Agora envie os bônus por cargo no formato: `<@&ID> número`, separados por vírgula, ou digite "nenhum".',
          true,
        );

        if (bonusResposta.toLowerCase() === 'nenhum') {
          dadosSorteio.bonusPorCargo = [];
          break;
        }

        const bonusSplit = bonusResposta.split(',').map(x => x.trim()).filter(Boolean);

        const bonusParsed = [];

        let erro = false;

        for (const parte of bonusSplit) {
          const match = parte.match(/^<@&(\d+)> (\d+)$/);
          if (!match) {
            erro = true;
            break;
          }
          const cargoId = match[1];
          const bonus = parseInt(match[2], 10);

          if (isNaN(bonus) || bonus < 1 || !interaction.guild.roles.cache.has(cargoId)) {
            erro = true;
            break;
          }
          bonusParsed.push({ cargoId, bonus });
        }

        if (erro) {
          await interaction.followUp({
            content: '❌ Formato inválido ou dados incorretos. Tente novamente ou digite "nenhum".',
            ephemeral: true,
          });
          continue;
        }

        dadosSorteio.bonusPorCargo = bonusParsed;
        break;
      }

      // Criar e salvar sorteio
      const sorteioId = uuidv4();

      const novoSorteio = new Sorteio({
        sorteioId,
        guildId: dadosSorteio.guildId,
        channelId: dadosSorteio.channelId,
        autorId: dadosSorteio.autorId,
        premio: dadosSorteio.premio,
        quantidadeVencedores: dadosSorteio.qtdVencedores,
        tempoMs: dadosSorteio.tempoMs,
        cargoRequisitos: dadosSorteio.cargosObrigatorios,
        bonusCargos: dadosSorteio.bonusPorCargo,
        participantes: [],
        finalizado: false,
        criadoEm: new Date(),
        iniciado: false,
      });

      await novoSorteio.save().catch(console.error);

      const embed = new EmbedBuilder()
        .setTitle('🎉 Novo Sorteio!')
        .setDescription(
          `**Prêmio:** ${dadosSorteio.premio}\n` +
            `**Vencedores:** ${dadosSorteio.qtdVencedores}\n` +
            `**Requisitos de Cargos:** ${
              dadosSorteio.cargosObrigatorios.length > 0
                ? dadosSorteio.cargosObrigatorios.map(c => `<@&${c}>`).join(', ')
                : 'Nenhum'
            }\n` +
            `**Bônus por Cargo:** ${
              dadosSorteio.bonusPorCargo.length > 0
                ? dadosSorteio.bonusPorCargo.map(b => `<@&${b.cargoId}> (+${b.bonus})`).join(', ')
                : 'Nenhum'
            }`,
        )
        .setColor('#4A90E2');

      const btnIniciar = new ButtonBuilder()
        .setCustomId(`sorteio_iniciar_${sorteioId}_${userId}`)
        .setLabel('Iniciar Sorteio')
        .setStyle(ButtonStyle.Success);

      const row = new ActionRowBuilder().addComponents(btnIniciar);

      await interaction.followUp({
        content: `✅ Sorteio criado com sucesso! ID: \`${sorteioId}\``,
        embeds: [embed],
        components: [row],
        ephemeral: false,
      });
    } catch (err) {
      if (err.message === 'Tempo esgotado') return;
      console.error('Erro ao criar sorteio:', err);
      await interaction.followUp({
        content: '❌ Ocorreu um erro ao criar o sorteio. Tente novamente mais tarde.',
        ephemeral: true,
      });
    }
  }

  async iniciarSorteio(interaction, sorteioId, autorId) {
    await interaction.deferReply({ ephemeral: true });

    const sorteioDoc = await Sorteio.findOne({ sorteioId }).catch(console.error);
    if (!sorteioDoc) return interaction.editReply('Sorteio não encontrado.');
    if (sorteioDoc.finalizado) return interaction.editReply('Sorteio já finalizado.');
    if (sorteioDoc.iniciado) return interaction.editReply('Sorteio já iniciado.');
    if (interaction.user.id !== autorId)
      return interaction.editReply('Apenas o autor do sorteio pode iniciar.');

    sorteioDoc.iniciado = true;
    await sorteioDoc.save().catch(console.error);

    const dataExec = new Date(Date.now() + sorteioDoc.tempoMs);

    await this.gerenciadorTarefas.criarTarefa(
      'encerrarSorteio',
      { sorteioId: sorteioDoc.sorteioId, guildId: sorteioDoc.guildId },
      dataExec,
    ).catch(console.error);

    await interaction.editReply('Sorteio iniciado com sucesso!');

    const canal = await this.bot.channels.fetch(sorteioDoc.channelId).catch(() => null);
    if (!canal) return;

    const botaoParticipar = new ButtonBuilder()
      .setCustomId(`sorteio_participar_${sorteioId}`)
      .setLabel('Participar')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(botaoParticipar);

    const dataFim = new Date(Date.now() + sorteioDoc.tempoMs);

    const embed = new EmbedBuilder()
      .setTitle('🎉 Sorteio iniciado!')
      .setDescription(
        `**✨ Prêmio:** ${sorteioDoc.premio}\n` +
          `**🎯 Vencedores:** ${sorteioDoc.quantidadeVencedores}\n` +
          `**⏳ Termina em:** ${time(dataFim, 'R')} (${time(dataFim, 'f')})\n\n` +
          (sorteioDoc.cargoRequisitos.length > 0
            ? `**📜 Requisitos de Cargos:** ${sorteioDoc.cargoRequisitos
                .map(id => `<@&${id}>`)
                .join(', ')}\n`
            : '') +
          (sorteioDoc.bonusCargos.length > 0
            ? `**🎁 Bônus por Cargo:** ${sorteioDoc.bonusCargos
                .map(b => `<@&${b.cargoId}> (+${b.bonus})`)
                .join(', ')}\n`
            : '') +
          `\n<:furina:1150189550846025819> Boa sorte, viajantes! Que a justiça divina sorria para você!`,
      )
      .setColor('#4A90E2');

    await canal.send({ embeds: [embed], components: [row] }).catch(console.error);
  }

  async participar(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const parts = interaction.customId.split('_');
    const sorteioId = parts.slice(2).join('_');
    const sorteioDoc = await Sorteio.findOne({ sorteioId }).catch(console.error);
    if (!sorteioDoc) return interaction.editReply('Sorteio não encontrado.');
    if (sorteioDoc.finalizado) return interaction.editReply('Sorteio já finalizado.');

    const membro = interaction.member;

    if (sorteioDoc.cargoRequisitos.length > 0) {
      const temCargo = sorteioDoc.cargoRequisitos.some(c => membro.roles.cache.has(c));
      if (!temCargo) return interaction.editReply('Você não possui os cargos necessários para participar.');
    }

    if (sorteioDoc.participantes.includes(membro.id)) {
      return interaction.editReply('Você já está participando do sorteio.');
    }

    sorteioDoc.participantes.push(membro.id);
    await sorteioDoc.save().catch(console.error);

    return interaction.editReply(
      '💫 Hah! Vejo que decidiu desafiar o destino! Sua entrada foi registrada — agora, prove que a sorte está do seu lado!',
    );
  }

  async encerrar(interaction, sorteioId) {
    //await interaction.deferReply({ ephemeral: true });

    const sorteioDoc = await Sorteio.findOne({ sorteioId }).catch(console.error);
    if (!sorteioDoc) return interaction.editReply('Sorteio não encontrado.');
    if (sorteioDoc.finalizado) return interaction.editReply('Sorteio já foi finalizado.');
    

    await this.encerrarSorteio(sorteioDoc);

    return interaction.editReply('Sorteio encerrado com sucesso.');
  }

  async reroll(interaction, sorteioId) {
   // await interaction.deferReply({ ephemeral: true });

    const sorteioDoc = await Sorteio.findOne({ sorteioId }).catch(console.error);
    if (!sorteioDoc) return interaction.editReply('Sorteio não encontrado.');
    if (!sorteioDoc.finalizado) return interaction.editReply('Sorteio não foi finalizado ainda.');
    
    const vencedores = this.sortearVencedores(sorteioDoc);

    sorteioDoc.vencedores = vencedores;
    await sorteioDoc.save().catch(console.error);

    const canal = await this.bot.channels.fetch(sorteioDoc.channelId).catch(() => null);
    if (!canal) return interaction.editReply('Canal do sorteio não encontrado.');

    const embed = new EmbedBuilder()
      .setTitle('🎉 Sorteio Rerolado!')
      .setDescription(
        `Prêmio: **${sorteioDoc.premio}**\nNovos vencedores:\n${vencedores.map(v => `<@${v}>`).join('\n')}`,
      )
      .setColor('Gold');

    await canal.send({ embeds: [embed] }).catch(console.error);

    return interaction.editReply('Sorteio rerolado e vencedores anunciados.');
  }

  async encerrarSorteio(sorteioDoc) {
    if (sorteioDoc.finalizado) return;

    const canal = await this.bot.channels.fetch(sorteioDoc.channelId).catch(() => null);
    if (!canal) return;

    const vencedores = this.sortearVencedores(sorteioDoc);

    sorteioDoc.vencedores = vencedores;
    sorteioDoc.finalizado = true;
    await sorteioDoc.save().catch(console.error);

    const content =
      `💙 O grande julgamento chegou ao fim! Veja quem foi agraciado pela sorte divina do Arconte da Justiça!\n\n` +
      (vencedores.length > 0
        ? vencedores.map(v => `<@${v}>`).join('\n')
        : '⚠️ Nenhum vencedor foi selecionado.');

    await canal.send({ content }).catch(console.error);
  }

  sortearVencedores(sorteioDoc) {
    const participantesPonderados = [];

    for (const participanteId of sorteioDoc.participantes) {
      let entradas = 1;

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

    const vencedores = new Set();

    while (vencedores.size < sorteioDoc.quantidadeVencedores && vencedores.size < participantesPonderados.length) {
      const sorteado = participantesPonderados[Math.floor(Math.random() * participantesPonderados.length)];
      vencedores.add(sorteado);
    }

    return Array.from(vencedores);
  }
}

module.exports = GerenciadorSorteios;
