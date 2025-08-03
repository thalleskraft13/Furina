const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  name: "configurar",
  type: 1,
  description: "Toque-me com suas preferências e revele meu verdadeiro esplendor~!",

  run: async (client, interaction) => {
    await interaction.deferReply();

    try {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor("#4A90E2")
              .setTitle("⚖️ A balança da autoridade pesa contra ti!")
              .setDescription(
                "Ah, meu doce mortal... Somente aqueles com a **permissão de Gerenciar Servidor** podem alterar as minhas configurações."
              ),
          ],
        });
      }

      let serverdb = await client.serverdb.findOne({ serverId: interaction.guild.id });
      if (!serverdb) {
        serverdb = new client.serverdb({ serverId: interaction.guild.id });
        await serverdb.save();
      }

      let userdb = await client.userdb.findOne({ id: interaction.user.id });
      if (!userdb) {
        userdb = new client.userdb({ id: interaction.user.id });
        await userdb.save();
      }

      const hasUserPremium = userdb.premium > 0;
      const hasServerPremium = serverdb.premium > 0;

      const createEmbedInicial = () =>
        new EmbedBuilder()
          .setTitle("🎭 Configurações do Grande Palco")
          .setDescription(
            "Toque em uma das minhas engrenagens e moldaremos o espetáculo ao seu gosto!\n\n" +
            "Selecione abaixo a categoria que deseja configurar:\n" +
            "- ⚙️ **Autorole**\n" +
            "- 📜 **Logs**\n" +
            "- 💬 **Mensagens automáticas**" +
            ((hasUserPremium || hasServerPremium)
              ? "\n\n✨ **Maré dourada — Premium** disponível para configurações especiais."
              : "")
          )
          .setColor("#4A90E2")
          .setFooter({ text: "Furina, a Juíza das Marés", iconURL: client.user.displayAvatarURL() });

      const options = [
        {
          label: "Autorole",
          value: "autorole",
          emoji: "⚙️",
          description: "Atribuição automática de cargos",
        },
        {
          label: "Logs",
          value: "logs",
          emoji: "📜",
          description: "Canal de registros de ações",
        },
        {
          label: "Mensagens Automáticas",
          value: "mensagens_auto",
          emoji: "💬",
          description: "Boas-vindas, despedida e mais",
        },
      ];

      if (hasUserPremium || hasServerPremium) {
        options.push({
          label: "Maré dourada — Premium",
          value: "mare_dourada",
          emoji: "✨",
          description: "Configurações especiais para servidores premium",
        });
      }

      const createMenuRow = (customId) =>
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder("Selecione uma configuração")
            .addOptions(options)
        );

      const menuId = client.CustomCollector.create(async (i) => {
        const valor = i.values[0];
        await i.deferUpdate();

        if (valor === "mensagens_auto") {
          const embedMensagens = new EmbedBuilder()
            .setTitle("💬 Configurações de Mensagens Automáticas")
            .setDescription(
              "Aqui estão as melodias automáticas que tocam em seu servidor:\n\n" +
              "👋 **Mensagem de Boas-Vindas**\n🏃 **Mensagem de Saída**\n💬 **Mensagens Automáticas**"
            )
            .setColor("#4A90E2")
            .setFooter({ text: "Furina, regendo cada saudação e despedida!" });

          const botaoBemvindoId = client.CustomCollector.create(async (btn) => {
           await btn.deferUpdate();
            return client.ConfigMsgAuto.abrirPainel(btn, "👋 Mensagem de Boas-Vindas");
          }, { authorId: interaction.user.id, timeout: 120_000 });

          const botaoSaidaId = client.CustomCollector.create(async (btn) => {
          await btn.deferUpdate();
            return client.ConfigMsgAuto.abrirPainel(btn, "🏃 Mensagem de Saída");
          }, { authorId: interaction.user.id, timeout: 120_000 });

          const botaoAutoId = client.CustomCollector.create(async (btn) => {
           await btn.deferUpdate();
            return client.ConfigMsgAuto.abrirListaMensagensCustom(btn);
          }, { authorId: interaction.user.id, timeout: 120_000 });

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(botaoBemvindoId)
              .setLabel("👋 Mensagem de Boas-Vindas")
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId(botaoSaidaId)
              .setLabel("🏃 Mensagem de Saída")
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId(botaoAutoId)
              .setLabel("💬 Mensagem Automática")
              .setStyle(ButtonStyle.Success)
          );

          return i.editReply({
            embeds: [embedMensagens],
            components: [row],
          });
        }

        if (valor === "mare_dourada") {
          return client.MareDourada?.abrirPainel?.(i);
        }

        if (valor === "autorole") {
          return client.ConfigAutorole?.abrirPainel?.(i);
        }

        if (valor === "logs") {
          const embedLogs = new EmbedBuilder()
            .setTitle("📜 Configurações de Logs")
            .setDescription("Ainda em desenvolvimento....")
            .setColor("#4A90E2")
            .setFooter({ text: "Furina, observando cada detalhe." });

          return i.editReply({
            embeds: [embedLogs],
            components: [createMenuRow(menuId)],
          });
        }

        return i.editReply({
          content: "⚠️ Opção inválida.",
          components: [createMenuRow(menuId)],
          embeds: [],
        });
      }, { authorId: interaction.user.id, timeout: 120_000 });

      await interaction.editReply({
        embeds: [createEmbedInicial()],
        components: [createMenuRow(menuId)],
      });
    } catch (err) {
      console.error(err);

      const id = await client.reportarErro({
        erro: err,
        comando: interaction.commandName,
        servidor: interaction.guild,
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
                url: "https://discord.gg/KQg2B5JeBh",
              },
            ],
          },
        ],
        embeds: [],
        files: [],
      });
    }
  },
};
