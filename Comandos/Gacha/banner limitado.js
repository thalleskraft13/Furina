const Discord = require("discord.js");

module.exports = {
  name: "banner-limitado",
  description: "Revele qual estrela cinco estrelas reina no banner desta cena!",
  type: 1,
  run: async(Furina, interaction) => {

    const file = new Discord.AttachmentBuilder('./img/banners/' + Furina.bannerAtual + ".jpeg");

    await interaction.editReply({
      files: [file],
      content: `${interaction.user}`,
      components: [new Discord.ActionRowBuilder()
                  .addComponents(
                    new Discord.ButtonBuilder()
                    .setLabel("1")
                    .setEmoji("<:1000211202:1373804510148821133>")
                    .setCustomId(`giros_1_${interaction.id}`)
                    .setStyle(Discord.ButtonStyle.Secondary),
                    new Discord.ButtonBuilder()
                    .setLabel("10")
                    .setEmoji("<:1000211202:1373804510148821133>")
                    .setCustomId(`giros_10_${interaction.id}`)
                    .setStyle(Discord.ButtonStyle.Secondary)
                  )]
    })
  }
}