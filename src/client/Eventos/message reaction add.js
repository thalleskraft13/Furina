const Furina = require("../index.js");
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

Furina.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  const { message } = reaction;
  const reacao = reaction.emoji.name;

  let serverdb = await Furina.serverdb.findOne({
    serverId: message.guild.id
  });

 
  if (!serverdb) {
    const newGuild = new Furina.serverdb({
      serverId: message.guild.id
    });

    await newGuild.save();
    serverdb = await Furina.serverdb.findOne({ serverId: message.guild.id });
  }

  
  if (serverdb.logs?.react?.ativado === true) {
    const channel = Furina.channels.cache.get(serverdb.logs.react.channel);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle("✨ Logs de Reação")
      .setDescription(`🎭 Oh là là~ ${user} não resistiu e expressou-se com ${reacao}! Que espetáculo de reação!`)
      .setColor("Blue")
      .setTimestamp();

    const button = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Ir para a mensagem")
        .setURL(`https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`)
        .setStyle(ButtonStyle.Link)
    );

    try {
      await channel.send({ embeds: [embed], components: [button] });
    } catch (error) {
      const dono = await Furina.users.fetch(message.guild.ownerId).catch(() => null);
      if (dono) {
        dono.send({
          content: `⚠️ Configuração de logs de reação: Não foi possível enviar mensagens no canal configurado. Verifique minhas permissões.`
        }).catch(() => null);
      }
    }
  }
});
