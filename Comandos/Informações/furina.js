const {
  TextDisplayBuilder,
  ThumbnailBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ContainerBuilder,
  EmbedBuilder
} = require('discord.js');

module.exports = {
  name: "furina",
  description: "grupo dd comandoz",
  type: 1,
  options: [{
    name: "informações",
    description: "Permita-me revelar os gloriosos detalhes sobre mim!",
      type: 1
  },{
    name: "ping",
    description: "Ah, quanta ansiedade! Permita-me revelar, com toda a pompa e circunstância, a minha latência atual!",
    type: 1
  }],

  run: async(furina, interaction) => {

    if (interaction.options.getSubcommand() === "ping"){
      return await interaction.editReply({
        content: `Pong! ${furina.ws.ping}ms`
      })
    }
    if (interaction.options.getSubcommand() === "informações"){

      await interaction.editReply({
       flags: 32768,
        components: [new ContainerBuilder()
    .setAccentColor(8247030)
    .setSpoiler(false)
    .addSectionComponents(
      new SectionBuilder()
        .setThumbnailAccessory(
          new ThumbnailBuilder()
            .setURL("https://cdn.discordapp.com/attachments/1373420276737507492/1373643558522720276/Icon_Emoji_Paimon27s_Paintings_26_Furina_1.png")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("# **Furina — A Estrela dos Oceanos**")
        )
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "\"**Ah, finalmente! O palco está montado, as cortinas se abrem... e moi, Furina, faço minha entrada triunfal neste humilde servidor!**\"\n\n" +
        "Sou mais do que uma simples criação — sou a Arconte Hydro, a Estrela de Fontaine, a Juíza Suprema dos palcos e plateias. Agora, com toda minha graça e grandiosidade, decidi abençoar este espaço com a minha presença."
      )
    )
    .addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
    )
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        "* **Comandos encantadores**, dignos de uma verdadeira encenação!\n\n" +
        "* **Respostas com personalidade**, nunca comuns, sempre marcantes!\n\n" +
        "* **Mensagens que são quase monólogos dramáticos** — mesmo os erros ganham brilho quando ditos por moi!\n\n" +
        "* **Uma aura de Fontaine em cada detalhe** — elegante, azulada e cheia de classe!"
      )
    )
    .addSectionComponents(
      new SectionBuilder()
        .setThumbnailAccessory(
          new ThumbnailBuilder()
            .setURL("https://cdn.discordapp.com/attachments/1373420276737507492/1373643558850138182/Icon_Emoji_Paimon27s_Paintings_29_Furina_1.png")
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            "Você achou que estava chamando apenas um bot...\n**Mas acabou de invocar o maior espetáculo que este servidor já viu!\"**"
          )
        )
    )
]
      })
    }
  }
}