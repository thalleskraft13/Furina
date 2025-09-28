const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');

module.exports = {
  name: 'guilda',
  description: 'Gerencie sua guilda',
  options: [
    {
      name: 'convidar',
      description: 'Convida um usuário para sua guilda',
      type: 1, // SUBCOMMAND
      options: [
        {
          name: 'usuario',
          description: 'Usuário que você quer convidar',
          type: 6, // USER
          required: true,
        },
      ],
    },
    {
      name: 'remover',
      description: 'Remove um membro da sua guilda',
      type: 1, // SUBCOMMAND
      options: [
        {
          name: 'usuario',
          description: 'Membro da guilda para remover',
          type: 3, // STRING
          required: true,
          autocomplete: true,
        },
      ],
    },
    {
      name: 'depositar',
      description: 'Deposita primogemas ou mora na guilda',
      type: 1, // SUBCOMMAND
      options: [
        {
          name: 'tipo',
          description: 'O que deseja depositar',
          type: 3,
          required: true,
          choices: [
            { name: 'primogemas', value: 'primogemas' },
            { name: 'mora', value: 'mora' },
          ],
        },
        {
          name: 'quantidade',
          description: 'Quantidade a depositar',
          type: 4, // INTEGER
          required: true,
        },
      ],
    },
    {
      name: 'sacar',
      description: 'Saca primogemas ou mora da guilda',
      type: 1, // SUBCOMMAND
      options: [
        {
          name: 'tipo',
          description: 'O que deseja sacar',
          type: 3,
          required: true,
          choices: [
            { name: 'primogemas', value: 'primogemas' },
            { name: 'mora', value: 'mora' },
          ],
        },
        {
          name: 'quantidade',
          description: 'Quantidade a sacar',
          type: 4, // INTEGER
          required: true,
        },
      ],
    },
    {
      name: 'rank',
      description: 'Mostra ranking global das guildas por riqueza',
      type: 1, // SUBCOMMAND
      options: [
        {
          name: 'pagina',
          description: 'Número da página do ranking',
          type: 4, // INTEGER
          required: false,
        },
      ],
    },
    {
      name: 'iniciar-missao',
      description: 'Inicie as 3 missões diárias para sua guilda',
      type: 1, // SUBCOMMAND
    },
  ],

  autocomplete: async (interaction) => {
    const sub = interaction.options.getSubcommand();

    if (sub !== 'remover') return interaction.respond([]);

    const autorId = interaction.user.id;
    const focused = interaction.options.getFocused().toLowerCase();

    const client = interaction.client;

    const guilda = await client.guilda.findOne({ dono: autorId });
    if (!guilda) return interaction.respond([]);

    const membrosFiltrados = guilda.membros
      .filter((m) => m.id.toLowerCase().includes(focused))
      .slice(0, 25);

    const choices = await Promise.all(
      membrosFiltrados.map(async (m) => {
        try {
          const user = await client.users.fetch(m.id);
          return { name: user.tag, value: m.id };
        } catch {
          return { name: m.id, value: m.id };
        }
      }),
    );

    return interaction.respond(choices);
  },

  run: async (client, interaction) => {
    await interaction.deferReply();
    const sub = interaction.options.getSubcommand();
    const autorId = interaction.user.id;
    return await interaction.editReply("Desativado até a próxima atualizações...");
    if (sub === 'convidar') {
      const user = interaction.options.getUser('usuario');
      return client.GuildaManager
        .adicionarUsuarioDireto(interaction, user.id)
        .catch(async (err) => {
          console.error(err);
          if (!interaction.deferred && !interaction.replied)
            await interaction.editReply({
              content:
                'Ocorreu um erro ao enviar o convite. Tente novamente mais tarde.',
              ephemeral: true,
            });
        });
    }

    if (sub === 'remover') {
      const userId = interaction.options.getString('usuario');
      return client.GuildaManager
        .removerUsuarioDaGuilda(interaction, userId)
        .catch(async (err) => {
          console.error(err);
          if (!interaction.deferred && !interaction.replied)
            await interaction.editReply({
              content:
                'Ocorreu um erro ao remover o usuário da guilda. Tente novamente mais tarde.',
              ephemeral: true,
            });
        });
    }

    if (sub === 'depositar' || sub === 'sacar') {
      const tipo = interaction.options.getString('tipo');
      const quantidade = interaction.options.getInteger('quantidade');

      if (quantidade <= 0)
        return interaction.editReply({
          content: 'A quantidade deve ser maior que zero.',
          ephemeral: true,
        });

      const guilda = await client.guilda.findOne({ dono: autorId });
      if (!guilda)
        return interaction.editReply({
          content: 'Você não possui nenhuma guilda.',
          ephemeral: true,
        });

      const usuario = await client.userdb.findOne({ id: autorId });
      if (!usuario)
        return interaction.editReply({
          content: 'Não consegui encontrar seus dados no banco.',
          ephemeral: true,
        });

      if (sub === 'depositar') {
        if (usuario[tipo] < quantidade)
          return interaction.editReply({
            content: `Você não tem ${quantidade} ${tipo} para depositar.`,
            ephemeral: true,
          });

        usuario[tipo] -= quantidade;
        guilda[tipo] = (guilda[tipo] || 0) + quantidade;

        await usuario.save();
        await guilda.save();

        return interaction.editReply({
          content: `Você depositou ${quantidade} ${tipo} na guilda **${guilda.nome}**.`,
          ephemeral: true,
        });
      }

      if (sub === 'sacar') {
        if ((guilda[tipo] || 0) < quantidade)
          return interaction.editReply({
            content: `A guilda não tem ${quantidade} ${tipo} para sacar.`,
            ephemeral: true,
          });

        guilda[tipo] -= quantidade;
        usuario[tipo] = (usuario[tipo] || 0) + quantidade;

        await usuario.save();
        await guilda.save();

        return interaction.editReply({
          content: `Você sacou ${quantidade} ${tipo} da guilda **${guilda.nome}**.`,
          ephemeral: true,
        });
      }
    }

    if (sub === 'rank') {
      let pagina = interaction.options.getInteger('pagina') || 1;
      if (pagina < 1) pagina = 1;

      const guildas = await client.guilda
        .find({})
        .sort({ primogemas: -1, mora: -1 })
        .lean();

      if (!guildas.length)
        return interaction.editReply({
          content: 'Nenhuma guilda encontrada.',
          ephemeral: true,
        });

      const porPagina = 5;
      const totalPaginas = Math.ceil(guildas.length / porPagina);
      if (pagina > totalPaginas) pagina = totalPaginas;

      const guildasPagina = guildas.slice((pagina - 1) * porPagina, pagina * porPagina);

      let descricao = '';
      for (let i = 0; i < guildasPagina.length; i++) {
        const g = guildasPagina[i];
        const rank = (pagina - 1) * porPagina + i + 1;
        descricao += `**#${rank}** - ${g.nome} (Tag: ${g.tag})\n💎 Primogemas: ${g.primogemas} | 🪙 Mora: ${g.mora}\n\n`;
      }

      const embed = new EmbedBuilder()
        .setTitle('🏆 Ranking Global de Guildas')
        .setDescription(descricao)
        .setFooter({ text: `Página ${pagina} de ${totalPaginas}` })
        .setColor('#00FF7F')
        .setTimestamp();

      const row = new ActionRowBuilder();

      const btnPrev = new ButtonBuilder()
        .setCustomId('guilda_rank_prev')
        .setLabel('⬅️ Anterior')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pagina === 1);

      const btnNext = new ButtonBuilder()
        .setCustomId('guilda_rank_next')
        .setLabel('Próximo ➡️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pagina === totalPaginas);

      row.addComponents(btnPrev, btnNext);

      const mensagem = await interaction.editReply({ embeds: [embed], components: [row] });

      const filtro = (btnInt) =>
        btnInt.user.id === interaction.user.id &&
        ['guilda_rank_prev', 'guilda_rank_next'].includes(btnInt.customId);

      const collector = mensagem.createMessageComponentCollector({
        filter: filtro,
        componentType: ComponentType.Button,
        time: 60000,
      });

      collector.on('collect', async (btnInt) => {
        if (btnInt.customId === 'guilda_rank_prev' && pagina > 1) pagina--;
        else if (btnInt.customId === 'guilda_rank_next' && pagina < totalPaginas) pagina++;

        const guildasAtual = guildas.slice((pagina - 1) * porPagina, pagina * porPagina);

        let descAtual = '';
        for (let i = 0; i < guildasAtual.length; i++) {
          const g = guildasAtual[i];
          const rank = (pagina - 1) * porPagina + i + 1;
          descAtual += `**#${rank}** - ${g.nome} (Tag: ${g.tag})\n💎 Primogemas: ${g.primogemas} | 🪙 Mora: ${g.mora}\n\n`;
        }

        const embedAtual = new EmbedBuilder()
          .setTitle('🏆 Ranking Global de Guildas')
          .setDescription(descAtual)
          .setFooter({ text: `Página ${pagina} de ${totalPaginas}` })
          .setColor('#00FF7F')
          .setTimestamp();

        btnInt.update({
          embeds: [embedAtual],
          components: [
            new ActionRowBuilder().addComponents(
              btnPrev.setDisabled(pagina === 1),
              btnNext.setDisabled(pagina === totalPaginas),
            ),
          ],
        });
      });

      collector.on('end', () => {
        mensagem.edit({
          components: [
            new ActionRowBuilder().addComponents(
              btnPrev.setDisabled(true),
              btnNext.setDisabled(true),
            ),
          ],
        }).catch(() => {});
      });

      return;
    }

    if (sub === 'iniciar-missao') {
      const usuario = await client.userdb.findOne({ id: autorId });
      if (!usuario || !usuario.guilda) {
        return interaction.editReply({
          content: 'Você precisa estar em uma guilda para iniciar missões.',
          ephemeral: true,
        });
      }

      const guilda = await client.guilda.findOne({ tag: usuario.guilda });
      if (!guilda) {
        return interaction.editReply({
          content: 'Guilda não encontrada para o seu tag.',
          ephemeral: true,
        });
      }

      const agora = new Date();
      if (guilda.missoes.length > 0) {
        const missaoExpira = guilda.missoes[0].expira;
        if (missaoExpira > agora) {
          return interaction.editReply({
            content: 'As missões de hoje já foram iniciadas! Volte após a meia-noite para novas missões.',
            ephemeral: true,
          });
        }
      }

      const expira = new Date();
      expira.setHours(24, 0, 0, 0);

      const missoes = [
        {
          tipo: 'mensagens',
          objetivo: 200,
          progresso: 0,
          recompensa: { primogemas: 180, mora: 1000, xp: 100 },
          iniciada: agora,
          expira,
          concluida: false,
        },
        {
          tipo: 'comandos',
          objetivo: 20,
          progresso: 0,
          recompensa: { primogemas: 160, mora: 1500, xp: 120 },
          iniciada: agora,
          expira,
          concluida: false,
        },
        {
          tipo: 'exploracao',
          objetivo: 1,
          progresso: 0,
          recompensa: { primogemas: 220, mora: 2000, xp: 150 },
          iniciada: agora,
          expira,
          concluida: false,
        },
      ];

      guilda.missoes = missoes;

      await guilda.save();

      const embed = new EmbedBuilder()
        .setTitle('✨ Missões Diárias da Guilda')
        .setDescription(
          `Suas missões de hoje foram iniciadas e expiram à meia-noite!\n\n` +
          `1️⃣ Envie 200 mensagens na guilda\n` +
          `2️⃣ Use 20 comandos diferentes\n` +
          `3️⃣ Explore uma nova nação\n\n` +
          `Recompensas: acima de 160 Primogemas em cada missão!`
        )
        .setColor('#1abc9c')
        .setTimestamp();

      return interaction.editReply({ embeds: [embed], ephemeral: false });
    }

    return interaction.editReply({
      content: 'Subcomando inválido.',
      ephemeral: true,
    });
  },
};
