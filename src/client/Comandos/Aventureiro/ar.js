const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
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

      let usuarios = await client.userdb.find({}).sort({ "level.ar": -1, "level.xp": -1 }).lean();

      if (subcommand === "servidor") {
        if (!interaction.guild) {
          return interaction.editReply(
            "✨ Este comando só pode ser usado dentro dos domínios do servidor, aventureiro~"
          );
        }
        const membrosIds = interaction.guild.members.cache.map((m) => m.user.id);
        usuarios = usuarios.filter((u) => membrosIds.includes(u.id));
      }

      if (usuarios.length === 0) {
        return interaction.editReply("✨ Aventureiro, não encontrei dados para mostrar o rank.");
      }

      let page = 1;
      const totalPages = Math.ceil(usuarios.length / ITEMS_PER_PAGE);

      async function gerarEmbed(pageNum) {
        const start = (pageNum - 1) * ITEMS_PER_PAGE;
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
          .setTitle(
            subcommand === "global"
              ? "🏆 Rank Global de Aventureiros"
              : "🏰 Rank do Servidor"
          )
          .setDescription(descricao || "✨ Nenhum aventureiro encontrado nesta página.")
          .setFooter({ text: `Página ${pageNum} de ${totalPages} | Sob o olhar atento da justiça~` })
          .setColor("#3DD1D9");
      }

      function gerarBotoes(pageNum) {
        return new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("voltar")
            .setLabel("⬅️ Voltar")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pageNum <= 1),
          new ButtonBuilder()
            .setCustomId("proximo")
            .setLabel("Próximo ➡️")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(pageNum >= totalPages)
        );
      }

      await interaction.editReply({
        embeds: [await gerarEmbed(page)],
        components: [gerarBotoes(page)],
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 120000,
      });

      collector.on("collect", async (btnInt) => {
        if (btnInt.user.id !== interaction.user.id) {
          return btnInt.reply({
            content: "✨ Somente o aventureiro que iniciou a jornada pode usar estes botões~",
            ephemeral: true,
          });
        }

        if (btnInt.customId === "voltar" && page > 1) {
          page--;
        } else if (btnInt.customId === "proximo" && page < totalPages) {
          page++;
        }

        await btnInt.update({
          embeds: [await gerarEmbed(page)],
          components: [gerarBotoes(page)],
        });
      });

    } catch (e) {
      console.error(e);
      return interaction.editReply(
        `❌ Ôh là là! Algo deslizou na justiça das marés... por favor, reporte ao suporte.\n\n\`\`\`\n${e}\n\`\`\``
      );
    }
  },
};
