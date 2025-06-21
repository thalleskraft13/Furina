const { 
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, 
  ComponentType, TextInputStyle, TextDisplayBuilder, ThumbnailBuilder, SectionBuilder, 
  SeparatorBuilder, SeparatorSpacingSize, ContainerBuilder 
} = require("discord.js");

module.exports = {
  name: "perfil",
  description: "Contemple os segredos gravados em seu pergaminho... ou desvende os mistérios alheios",
  type: 1,
  options: [{
    name: "usuário",
    description: "Mencione um usuário",
    type: 6,
    required: false
  }],

  run: async (client, interaction) => {
    try {
      let user = interaction.options.getUser("usuário") || interaction.user;

      let author = await client.userdb.findOne({ id: interaction.user.id });

      if (!author) {
        await new client.userdb({ id: interaction.user.id }).save();
        author = await client.userdb.findOne({ id: interaction.user.id });
      }

      if (author.uid === "0") {
        let msg = await interaction.editReply({
          content: `Ah, meu caro! Vejo que ainda não há um UID gravado em seus registros. Salve-o agora para que a magia possa prosseguir!`,
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel("Enviar Uid")
                .setCustomId("enviar-uid-" + interaction.user.id)
                .setStyle(ButtonStyle.Secondary)
            )
          ]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 40000
        });

        collector.on("collect", async (i) => {
          if (i.customId !== "enviar-uid-" + interaction.user.id) return;

          const modal = new ModalBuilder()
            .setCustomId('uid')
            .setTitle('Envio de UID a Verificação');

          let op_1 = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('1')
              .setLabel("Digite seu nome no Genshin Impact")
              .setStyle(TextInputStyle.Short)
          );

          let op_2 = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('2')
              .setLabel("Digite seu Uid no Genshin Impact")
              .setStyle(TextInputStyle.Short)
          );

          modal.addComponents(op_1, op_2);
          await i.showModal(modal);
        });

      } else {
        let userdb = await client.userdb.findOne({ id: user.id });

        if (!userdb) {
          await new client.userdb({ id: user.id }).save();
          userdb = await client.userdb.findOne({ id: user.id });
        }

        await interaction.editReply({
          flags: 32768,
          components: [
            new ContainerBuilder()
              .setAccentColor(16254213)
              .addSectionComponents(
                new SectionBuilder()
                  .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL("https://i.imgur.com/bNp2LFp.png")
                  )
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`# ${user.username}    | ${userdb.uid}`),
                  ),
              )
              .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
              )
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `Pity: ${userdb.gacha.pity.five}\nPrimogemas: ${userdb.primogemas}\nMora: ${userdb.mora}\n`
                ),
              )
              .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
              )
              .addSectionComponents(
                new SectionBuilder()
                  .setThumbnailAccessory(
                    new ThumbnailBuilder().setURL("https://i.imgur.com/thdXp8V.png")
                  )
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("# Personagens obtidos"),
                  ),
              )
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `${userdb.personagens.map(p => `**${p.nome}** | Constelação: ${p.c}`).join(" \n ")}`
                ),
              )
              .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
              ),
          ]
        });
      }
    } catch (e) {
      console.log(e);
      return interaction.editReply(
        `❌ Oh là là! Algo deu errado ao executar o comando. Por favor, reporte ao servidor de suporte para que possamos trazer justiça a essa falha.\n\n\`\`\`\n${e}\n\`\`\``
      );
    }
  }
};
