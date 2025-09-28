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
            "- 💬 **Mensagens automáticas**\n" +
            "- 🎉 **Eventos**" +
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
        {
          label: "Eventos",
          value: "eventos",
          emoji: "🎉",
          description: "Ativar ou desativar eventos do bot",
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

        if (valor === "eventos") {
          const embedEventos = new EmbedBuilder()
            .setTitle("🎉 Configuração de Eventos")
            .setDescription(
              `O sistema de eventos está atualmente: **${serverdb.furinaEventos ? "Ativo ✅" : "Desativado ❌"}**\n\n` +
              "Clique no botão abaixo para alternar o estado do evento."
            )
            .setColor("#4A90E2");

          const toggleId = client.CustomCollector.create(async (btn) => {
            await btn.deferUpdate();

            // alterna o estado
            serverdb.furinaEventos = !serverdb.furinaEventos;
            await serverdb.save();

            return btn.editReply({
              embeds: [
                new EmbedBuilder()
                  .setTitle("🎉 Configuração de Eventos")
                  .setDescription(
                    `O sistema de eventos agora está: **${serverdb.furinaEventos ? "Ativo ✅" : "Desativado ❌"}**`
                  )
                  .setColor("#4A90E2")
              ],
              components: [createMenuRow(menuId)],
            });
          }, { authorId: interaction.user.id, timeout: 120_000 });

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(toggleId)
              .setLabel(serverdb.furinaEventos ? "Desativar Eventos" : "Ativar Eventos")
              .setStyle(ButtonStyle.Primary)
          );

          return i.editReply({
            embeds: [embedEventos],
            components: [row],
          });
        }

        // resto das opções continua igual
        if (valor === "mensagens_auto") {
          // ... seu código existente para mensagens automáticas
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
        content: `❌ Um erro ocorreu! Reporte este ID: \`${id}\``,
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
      });
    }
  },
};
