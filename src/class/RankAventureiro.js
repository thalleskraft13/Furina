const { TextDisplayBuilder, ContainerBuilder, EmbedBuilder } = require("discord.js");

class RankAventureiro {
  constructor(client) {
    this.client = client;
    this.xpRequirements = [
      375, 400, 475, 550, 650, 775, 875, 1000, 1225, 1875, 2425, 3000, 3575,
      4175, 4800, 5425, 6075, 6750, 7450, 8175, 8925, 9700, 10500, 11325, 12175,
      13050, 13950, 14875, 15825, 16800, 17800, 18825, 19875, 20950, 22050,
      23175, 24325, 25500, 26700, 27925, 29175, 30450, 31750, 33075, 34425,
      35800, 37200, 38625, 40075, 41550, 43050, 44575, 46125, 47700, 49300,
      50925, 52575, 54250, 285800
    ];
    this.logChannel = "1387760767155306607";
  }

  async addXp(userId, value, guildId = null) {
    let userdb = await this.client.userdb.findOne({ id: userId });

    if (!userdb) {
      const newUser = new this.client.userdb({ id: userId });
      await newUser.save();
      userdb = newUser;
    }

    userdb.level.xp += value;

    if (userdb.level.xp >= userdb.level.xpMax) {
      userdb.level.ar++;
      userdb.level.xpMax = this.xpRequirements[userdb.level.ar - 1] || userdb.level.xpMax;
      userdb.primogemas += 160;
      userdb.mora += 20000;

      await userdb.save();

      const embedLog = new EmbedBuilder()
        .setTitle("✨ Level Up — Rank de Aventureiro!")
        .setColor("#3DD1D9")
        .setThumbnail(this.client.users.cache.get(userId)?.displayAvatarURL() || null)
        .setDescription(
          `🛡️ **Usuário:** <@${userId}> \`(${userId})\`\n` +
          `🌍 **Servidor:** ${guildId ? `<#${guildId}> \`(${guildId})\`` : "Direto no DM"}\n` +
          `📅 **Data:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
          `🎉 Subiu para o **AR ${userdb.level.ar}**! Recompensas concedidas:\n` +
          `• 💎 160 Primogemas\n` +
          `• 💰 20.000 Mora\n\n` +
          `O espetáculo continua, bravo aventureiro!`
        )
        .setFooter({ text: "Furina do Discord" });

      try {
        await this.client.restMessenger.enviar(this.logChannel, { embeds: [embedLog] });
      } catch (e) {
        console.log("Erro ao enviar log de level up:", e);
      }

      if (userdb.notificar) {
        try {
          const user = await this.client.users.fetch(userId);
          await user.send({
            components: [
              new ContainerBuilder()
                .setAccentColor(2046807)
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    `**Oh là là! Um espetáculo digno dos aplausos mais estrondosos!** 🎭✨\n\n` +
                    `Você subiu de Rank de Aventureiro! Agora ostenta o glorioso AR ${userdb.level.ar}, com nada menos que ${userdb.level.xp} pontos de experiência pulsando em suas veias! 💫\n` +
                    `Como recompensa por tão magnífico progresso, receba **160 Primogemas** 💎 e **20.000 Mora** 💰!\n\n` +
                    `**O palco da aventura o aguarda — e que comece o segundo ato!** 🎬🌟\n\n` +
                    `📩 *Ah, e caso deseje silenciar os mensageiros dos céus e encerrar essas doces notificações por DM...*\n` +
                    `Use o comando **/notificação desativar** e deixe o silêncio cair como a cortina no fim do espetáculo. 🎼🎭`
                  )
                )
            ]
          });
        } catch (err) {
          console.log("Usuário bloqueou as DMs ou não é possível enviar a notificação:", err);
        }
      }

      return true;
    } else {
      await userdb.save();
      return false;
    }
  }
}

module.exports = RankAventureiro;
