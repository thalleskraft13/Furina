const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const Furina = require("../index.js");
const Sorteio = require("../mongodb/Sorteio");
const UsuarioServidor = require("../mongodb/UsuarioServidor");

Furina.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  const usuarioId = message.author.id;
  const servidorId = message.guild.id;

  // XP automático ao falar
  await Furina.RankAventureiro.addXp(usuarioId, 5);
  
  try {
    const userdb = await Furina.userdb.findOne({ id: usuarioId });
    if (userdb && userdb.premium && userdb.premium > Date.now()) {
      userdb.primogemas += 5;
      await userdb.save();
    }
  } catch (e) {
      return;
  }
  

  await Furina.GerenciadorSorteio.tratarMensagem(message);
 // await Furina.GerenciadorSorteio.tratarRespostaCanal(message);


  // Resposta ao mencionar o bot
  if (
    message.content === `<@${Furina.user.id}>` ||
    message.content === `<@!${Furina.user.id}>`
  ) {
    await message.reply({
      content:
        "🎭 Oh~ Você ousou mencionar a grandiosa Furina? Excelente escolha! Explore todo o meu esplendor no meu site de comandos!",
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel("Website")
            .setURL(Furina.website + "/comandos")
            .setStyle(ButtonStyle.Link)
        ),
      ],
    });
    return;
  }

  // Mensagens automáticas por palavra-chave
  const messageWords = message.content.toLowerCase().match(/\b\w+\b/g);

  if (messageWords && messageWords.length > 0) {
    try {
      const msgAutoList = await Furina.MsgAuto.find({ serverId: message.guild.id });

      for (const word of messageWords) {
        const matched = msgAutoList.find(
          (item) => item.chaveDeMsg.toLowerCase() === word
        );
        if (matched) {
          await message.reply(matched.resposta);
          break;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar mensagens automáticas:", error);
    }
  }
});