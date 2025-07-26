const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, ComponentType, TextInputStyle } = require("discord.js");

module.exports = {
  name: "uid",
  description: "grupo de cmd",
  type: 1,
  options: [
    {
      name: "salvar",
      description: "Registre seu UID no seu perfil para que o espetáculo continue brilhando com todo esplendor!",
      type: 1,
    },
    {
      name: "ver",
      description: "Descubra o UID de um distinto membro e desvende seus segredos com graça e estilo",
      type: 1,
      options: [
        {
          name: "membro",
          description: "Mencione ou insira o Id",
          type: 6,
          required: true,
        },
      ],
    },
  ],

  run: async (client, interaction) => {
    try {
      let cmd = interaction.options.getSubcommand();

      if (cmd === "salvar") {
        let msg = await interaction.editReply({
          content: `Ah, meu caro! Vejo que ainda não há um UID gravado em seus registros. Salve-o agora para que a magia possa prosseguir!`,
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel("Enviar Uid")
                .setCustomId("enviar-uid-" + interaction.user.id)
                .setStyle(ButtonStyle.Secondary)
            ),
          ],
        });

        const collector = msg.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 40000,
        });

        collector.on("collect", async (i) => {
          if (i.customId !== "enviar-uid-" + interaction.user.id) return;

          const modal = new ModalBuilder()
            .setCustomId("uid")
            .setTitle("Envio de UID a Verificação");

          let op_1 = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("1")
              .setLabel("Digite seu nome no Genshin Impact")
              .setStyle(TextInputStyle.Short)
          );

          let op_2 = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("2")
              .setLabel("Digite seu Uid no Genshin Impact")
              .setStyle(TextInputStyle.Short)
          );

          modal.addComponents(op_1, op_2);
          await i.showModal(modal);
        });
      } else if (cmd === "ver") {
        let user = interaction.options.getUser("membro");

        let userdb = await client.userdb.findOne({ id: user.id });
        if (!userdb) {
          await new client.userdb({ id: user.id }).save();
          userdb = await client.userdb.findOne({ id: user.id });
        }

        if (userdb.uid === "0") {
          return interaction.editReply(
            "Ah, mon cher, este usuário ainda não revelou seu UID nos bastidores do perfil."
          );
        } else {
          return interaction.editReply(
            `Bravo! O UID do estimado ${user} foi encontrado: ${userdb.uid}. Que a sorte esteja sempre a seu favor!`
          );
        }
      }
    } catch (e) {
      console.log(e);
      return interaction.editReply(
        `❌ Oh là là! Algo deu errado ao executar o comando. Por favor, reporte ao servidor de suporte para que possamos trazer justiça a essa falha.\n\n\`\`\`\n${e}\n\`\`\``
      );
    }
  },
};