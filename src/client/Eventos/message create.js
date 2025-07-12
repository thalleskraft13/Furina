const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  evento: "messageCreate",
  run: async (client, message) => {
    if (message.author.bot || !message.guild) return;

    const usuarioId = message.author.id;
    const servidorId = message.guild.id;

    await client.RankAventureiro.addXp(usuarioId, 5);

    try {
      const userdb = await client.userdb.findOne({ id: usuarioId });

      if (servidorId === "1372911248936796231") {
        if (userdb) {
          userdb.primogemas += 100;
          await userdb.save();
        }
      }

      if (userdb && userdb.premium && userdb.premium > Date.now()) {
        userdb.primogemas += 5;
        await userdb.save();
      }

    } catch {}

    await client.GerenciadorSorteio.tratarMensagem(message);

    if (
      message.content === `<@${client.user.id}>` ||
      message.content === `<@!${client.user.id}>`
    ) {
      await message.reply({
        content: "🎭 Oh~ Você ousou mencionar a grandiosa Furina? Excelente escolha! Explore todo o meu esplendor no meu site de comandos!",
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("Website")
              .setURL(client.website + "/comandos")
              .setStyle(ButtonStyle.Link)
          ),
        ],
      });
      return;
    }

    const messageWords = message.content.toLowerCase().match(/\b\w+\b/g);

    if (messageWords && messageWords.length > 0) {
      try {
        const msgAutoList = await client.MsgAuto.find({ serverId: message.guild.id });

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
  },
};
