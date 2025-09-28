const {
    TextDisplayBuilder,
    ThumbnailBuilder,
    SectionBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ButtonBuilder,
    ButtonStyle,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    ActionRowBuilder,
    ContainerBuilder
} = require('discord.js');

module.exports = {
    config: {
        name: "nahidaPobre",
        description: "Obtenha meu ping atual",
        usage: "f-ping"
    },

    async run(bot, message, args) {

        if (!message.member.roles.cache.has("1374103804882194546")) {
      return message.reply("❌ Você não tem permissão para usar esse comando.");
        }
        
const components = [
        new ContainerBuilder()
            .setAccentColor(16711680)
            .addSectionComponents(
                new SectionBuilder()
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL("https://files.catbox.moe/jh4p16.webp")
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("# ꔫ̲٫᷆⃕✦՞  '  𝐈rmisυׁׅl 𝐇𖦹use﹒✿॒ਊ๑⏝⊹ \n\n>>> ꙕ ﹕ᘓ﹐𝐔ma house de __Genshin Impact__ focada em entretenimento, diversão e rp! 𝐇ouse nova, com diversas vagas disponíveis a seu dispor.﹒𝐞︵"),
                    ),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true),
            )
            .addSectionComponents(
                new SectionBuilder()
                    .setButtonAccessory(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel("Adicione a Furina")
                            .setEmoji({
                                name: "💙",
                            })
                            .setURL("https://discord.com/oauth2/authorize?client_id=1314904179680219136&permissions=8&response_type=code&redirect_uri=https%3A%2F%2Ffurina-do-discord.onrender.com%2Fauth%2Fdiscord%2Fcallback&integration_type=0&scope=bot+identify+guilds")
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("୨୧﹒﹑𝐎rganização﹒ᜊ﹒お\n୨୧﹒﹑𝐀dms e staffs atenciosos﹒ᜊ﹒お\n୨୧﹒﹑𝐄ventos sempre em dia﹒ᜊ﹒お\n୨୧﹒﹑𝐂hat acolhedor﹒ᜊ﹒お\n୨୧﹒﹑𝐍oite de jogos e mais﹒ᜊ﹒お\n ⧓꯭  ﹒✿͡❥﹒﹕︶︶︶。က ‿︐  🪽 ﹕ ✿﹒"),
                    ),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://files.catbox.moe/v01ew6.jpg"),
                    ),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addActionRowComponents(
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel("Convite do Servidor")
                            .setURL("https://discord.gg/37fs78KVbZ"),
                    ),
            ),
];

        message.channel.send({
            flags: 32768,
            components: components
        })
    }
};
