const { EmbedBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, StringSelectMenuBuilder, AttachmentBuilder } = require("discord.js");

module.exports = {
  name: "explorar",
  description: "Grupo de comandos para exploração",
  type: 1,
  options: [
    {
      name: "mondstadt",
      description: "Deixe os ventos de liberdade guiarem sua jornada por Mondstadt.",
      type: 2, // Subcomando group para ter subcomandos dentro
      options: [
        {
          name: "iniciar",
          description: "Inicie sua exploração em Mondstadt.",
          type: 1
        },
        {
          name: "coletar",
          description: "Resgate suas recompensas da exploração em Mondstadt.",
          type: 1
        }
      ]
    }
  ],

  run: async (client, interaction) => {
    try {
      const subcmdgroup = interaction.options.getSubcommandGroup(false);
      const subcmd = interaction.options.getSubcommand();

      let userdb = await client.userdb.findOne({ id: interaction.user.id });
      if (!userdb) {
        userdb = new client.userdb({ id: interaction.user.id });
        await userdb.save();
      }

      if (subcmdgroup === "mondstadt" || interaction.options.getSubcommandGroup() === null) {
        if (subcmd === "iniciar") {
          let img = new AttachmentBuilder("./src/img/nação/mondstadt.jpeg");

          const msg = await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Ato I – Brisas de Mondstadt!")
                .setDescription(`Os ventos sussurram convites...  
Escolha a duração da sua exploração para que Mondstadt revele seus segredos.`)
                .setColor("#3C92FF")
                .setFooter({ text: "Que os ventos te levem aos tesouros ocultos...", iconURL: client.user.displayAvatarURL() })
                .setImage("attachment://mondstadt.jpeg")
            ],
            files: [img],
            components: [
              new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId(`mondstadt_iniciar_${interaction.user.id}_${interaction.id}`)
                  .setPlaceholder("Selecione o tempo de exploração")
                  .addOptions(
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Cena Breve – Voo da Liberdade (1h)")
                      .setDescription("Exploração leve por Mondstadt.")
                      .setValue("1h"),
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Ato Completo – Jornada dos Ventos (5h)")
                      .setDescription("Missão média pelos campos da liberdade.")
                      .setValue("5h"),
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Grande Espetáculo – Balada dos Céus Livres (10h)")
                      .setDescription("Expedição longa e gloriosa.")
                      .setValue("10h")
                  )
              )
            ]
          });

          const collector = msg.createMessageComponentCollector({ componentType: 3, time: 60000 });

          collector.on("collect", async i => {
            if (i.customId === `mondstadt_iniciar_${interaction.user.id}_${interaction.id}` && i.user.id === interaction.user.id) {
              await i.deferUpdate();

              const tempo = i.values[0]; // '1h', '5h' ou '10h'
              const tempoNum = parseInt(tempo);

              // Passa o canal e guild para criar lembrete
              const resposta = await client.exploracao.startMondstadt(
                interaction.user.id,
                tempoNum,
                interaction.channelId,
                interaction.guildId
              );

              return interaction.followUp({ content: resposta, ephemeral: true });
            }
          });

        } else if (subcmd === "coletar") {
          const resposta = await client.exploracao.collectMondstadt(interaction.user.id);
          return interaction.editReply({ content: resposta, ephemeral: true });
        }
      }
    } catch (e) {
      console.log(e);
      return interaction.editReply(`❌ Oh là là! Algo deu errado ao executar o comando. Por favor, reporte ao servidor de suporte para que possamos trazer justiça a essa falha.\n\n\`\`\`\n${e}\n\`\`\``);
    }
  }
};
