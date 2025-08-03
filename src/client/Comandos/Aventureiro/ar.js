const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const ITEMS_PER_PAGE = 10;

module.exports = {
  name: "rank",
  description: "Descubra o brilho do seu Rank de Aventureiro, veja global, servidor ou de outro aventureiro.",
  type: 1,
  options: [
    {
      name: "ver",
      description: "Veja o rank de um aventureiro",
      type: 1,
      options: [
        {
          name: "usuário",
          description: "Mencione um aventureiro para revelar seu Rank",
          type: 6,
          required: false,
        },
      ],
    },
    {
      name: "global",
      description: "Veja o rank global de aventureiros",
      type: 1,
    },
    {
      name: "servidor",
      description: "Veja o rank dos aventureiros do servidor",
      type: 1,
    },
  ],

  run: async (client, interaction) => {
    try {
      const subcommand = interaction.options.getSubcommand();
      await interaction.deferReply();

      // Subcomando de visualizar rank individual
      if (subcommand === "ver") {
        const user = interaction.options.getUser("usuário") || interaction.user;

        let userdb = await client.userdb.findOne({ id: user.id });
        if (!userdb) {
          userdb = new client.userdb({ id: user.id, primogemas: 0, level: { ar: 1, xp: 0, xpMax: 100 } });
          await userdb.save();
        }

        const allUsers = await client.userdb.find({}).sort({ "level.ar": -1, "level.xp": -1 }).lean();
        const globalRank = allUsers.findIndex((u) => u.id === user.id) + 1 || "Não encontrado";

        let serverRank = "Não encontrado";
        if (interaction.guild) {
          const guildMemberIds = interaction.guild.members.cache.map((m) => m.user.id);
          const serverUsers = allUsers.filter((u) => guildMemberIds.includes(u.id));
          serverRank = serverUsers.findIndex((u) => u.id === user.id) + 1 || "Não encontrado";
        }

        const embed = new EmbedBuilder()
          .setTitle(`✨ A aventura brilha para ${user.username}`)
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setColor("#3DD1D9")
          .setDescription(
            `**AR:** ${userdb.level.ar}\n` +
            `**XP:** ${userdb.level.xp} (Faltam ${userdb.level.xpMax - userdb.level.xp} para o próximo nível)\n\n` +
            `🏆 **Rank Global:** ${globalRank}\n` +
            `🏰 **Rank no Servidor:** ${serverRank}\n\n` +
            `"_Que as marés da justiça sempre guiem seu caminho_~"`
          )
          .setFooter({ text: "Sob a luz das marés, brilhe intensamente~" });

        return interaction.editReply({ embeds: [embed] });
      }

      // Subcomando de ranking (global ou servidor)
      let usuarios = await client.userdb.find({}).sort({ "level.ar": -1, "level.xp": -1 }).lean();

      if (subcommand === "servidor") {
        if (!interaction.guild) {
          return interaction.editReply("✨ Este comando só pode ser usado dentro dos domínios do servidor, aventureiro~");
        }

        const membrosIds = interaction.guild.members.cache.map((m) => m.user.id);
        usuarios = usuarios.filter((u) => membrosIds.includes(u.id));
      }

      if (usuarios.length === 0) {
        return interaction.editReply("✨ Aventureiro, não encontrei dados para mostrar o rank.");
      }

      let pagina = 1;
      const totalPaginas = Math.ceil(usuarios.length / ITEMS_PER_PAGE);

      const gerarEmbed = async (pg) => {
        const start = (pg - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageItems = usuarios.slice(start, end);

        let descricao = "";
        for (let i = 0; i < pageItems.length; i++) {
          const u = pageItems[i];
          const user = client.users.cache.get(u.id) || await client.users.fetch(u.id).catch(() => null);
          const username = user ? user.username : "Não encontrado";
          descricao += `\`${start + i + 1}\`. [${username}](https://discord.com/users/${u.id}) — **AR ${u.level.ar}** (XP: ${u.level.xp})\n`;
        }

        return new EmbedBuilder()
          .setTitle(subcommand === "global" ? "🏆 Rank Global de Aventureiros" : "🏰 Rank do Servidor")
          .setDescription(descricao || "✨ Nenhum aventureiro encontrado nesta página.")
          .setFooter({ text: `Página ${pg} de ${totalPaginas} | Sob o olhar atento da justiça~` })
          .setColor("#3DD1D9");
      };

      const atualizarPainel = async (pg, i = interaction) => {
        const embed = await gerarEmbed(pg);
        const row = new ActionRowBuilder();

        if (pg > 1) {
          const voltarId = client.CustomCollector.create(async (btnInt) => {
            if (btnInt.user.id !== interaction.user.id)
              return btnInt.reply({ content: "⚠️ Apenas você pode navegar neste ranking.", ephemeral: true });

            await btnInt.deferUpdate();
            await atualizarPainel(pg - 1, btnInt);
          }, { authorId: interaction.user.id, timeout: 120000 });

          row.addComponents(
            new ButtonBuilder()
              .setCustomId(voltarId)
              .setLabel("⬅️ Voltar")
              .setStyle(ButtonStyle.Primary)
          );
        }

        if (pg < totalPaginas) {
          const proximoId = client.CustomCollector.create(async (btnInt) => {
            if (btnInt.user.id !== interaction.user.id)
              return btnInt.reply({ content: "⚠️ Apenas você pode navegar neste ranking.", ephemeral: true });

            await btnInt.deferUpdate();
            await atualizarPainel(pg + 1, btnInt);
          }, { authorId: interaction.user.id, timeout: 120000 });

          row.addComponents(
            new ButtonBuilder()
              .setCustomId(proximoId)
              .setLabel("Próximo ➡️")
              .setStyle(ButtonStyle.Primary)
          );
        }

        await i.editReply({
          embeds: [embed],
          components: row.components.length ? [row] : [],
        });
      };

      await atualizarPainel(pagina);

    } catch (err) {
      console.error(err);

      const id = await client.reportarErro({
        erro: err,
        comando: interaction.commandName,
        servidor: interaction.guild
      });

      return interaction.editReply({
        content: `❌ Oh là là... Um contratempo inesperado surgiu durante a execução deste comando. Por gentileza, reporte este erro ao nosso servidor de suporte junto com o ID abaixo, para que a justiça divina possa ser feita!\n\n🆔 ID do erro: \`${id}\``,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: "Servidor de Suporte",
                style: 5,
                url: "https://discord.gg/KQg2B5JeBh"
              }
            ]
          }
        ],
        embeds: [],
        files: []
      });
    }
  },
};
