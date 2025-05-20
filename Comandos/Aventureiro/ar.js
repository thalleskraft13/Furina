const { TextDisplayBuilder, ThumbnailBuilder, SectionBuilder, ContainerBuilder } = require('discord.js');

module.exports = {
  name: "rank-de-aventureiro",
  description: "Descubra o brilho do seu Rank de Aventureiro.",
  type: 1,
  options: [{
    name: "usuário",
    description: "Mencione um aventureiro para revelar seu Rank",
    type: 6
  }],

  run: async(client, interaction) => {
    const user = interaction.options.getUser('usuário') || interaction.user;

    
    let userdb = await client.userdb.findOne({ id: user.id });
    if (!userdb) {
      await new client.userdb({ id: user.id }).save();
      userdb = await client.userdb.findOne({ id: user.id });
    }

    await interaction.editReply({
      flags: 32768,
      components: [new ContainerBuilder()
            .setAccentColor(3033725)
            .addSectionComponents(
                new SectionBuilder()
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL(user.displayAvatarURL())
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(`# **Ah, o esplendor de sua jornada!**\n**Rank de Aventureiro:** AR ${userdb.level.ar} \n**Experiência total acumulada:** ${userdb.level.xp} EXP  \n**Experiência restante para o próximo salto:** ${userdb.level.xpMax - userdb.level.xp} EXP\n\n<:1000210946:1373427405737168947> O palco está montado, a cortina está prestes a subir... Prepare-se para brilhar como nunca antes!`),
                    
                    ),
            ),
]
    })
  }
};
