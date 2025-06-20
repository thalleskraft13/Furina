const Furina = require("../index.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

let mods = ["890320875142930462"];
let prefix = "g!";

Furina.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  await Furina.RankAventureiro.addXp(message.author.id, 5);

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

  const messageWords = message.content
    .toLowerCase()
    .match(/\b\w+\b/g);

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

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const cmd = args.shift().toLowerCase();
  if (cmd.length === 0) return;
  if (!mods.includes(message.author.id)) return;

  if (cmd === "uid") {
    let user = args[0];
    let uid = args[1];
    let status = args[2];

    if (!user || !uid || !status)
      return message.reply("Formato inválido. \ng!uid <userId> <uid> <status>");

    let userdb = await Furina.userdb.findOne({
      id: user,
    });

    message.reply("Verificação concluída.");

    if (status === "aprovado") {
      userdb.uid = uid;
      userdb.primogemas += 1600;
      await userdb.save();

      Furina.users.cache
        .get(user)
        .send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Verificação Concluída")
              .setDescription(
                `Oh là là! Seu UID foi verificado pelo distinto moderador ${message.author}! E como todo grande ato merece sua recompensa... receba agora 1600 primogemas pelo seu esplêndido desempenho`
              )
              .setColor("Green"),
          ],
        });
    } else if (status === "recusado") {
      Furina.users.cache
        .get(user)
        .send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Verificação Concluída")
              .setDescription(
                `Tsc... que decepção trágica! Seu UID foi analisado pelo moderador ${message.author}, mas, infelizmente, não passou na verificação. O palco exige autenticidade, mon cher!`
              )
              .setColor("Red"),
          ],
        });
    }
  }
});
