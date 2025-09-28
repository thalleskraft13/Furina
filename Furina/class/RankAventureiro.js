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

  async addXp(userId, value, guild = null) {
    let userdb = await this.client.userdb.findOne({ id: userId });

    if (!userdb) {
      const newUser = new this.client.userdb({ id: userId });
      await newUser.save();
      userdb = newUser;
    }

    const agora = Date.now();
  let xpToAdd = value;
  if (userdb.premium && userdb.premium > agora) {
    xpToAdd = Math.floor(value * 1.5);
  }

  userdb.level.xp += xpToAdd;
    

    if (userdb.level.xp >= userdb.level.xpMax) {
      userdb.level.ar++;
      userdb.level.xpMax = this.xpRequirements[userdb.level.ar - 1] || userdb.level.xpMax;
      userdb.primogemas += 160;
      userdb.mora += 20000;

      await userdb.save();

      const arAtual = userdb.level.ar;

      if ([17, 45, 60].includes(arAtual)) {
        let conquistaId = null;
        if (arAtual === 17) conquistaId = 10;
        else if (arAtual === 45) conquistaId = 11;
        else if (arAtual === 60) conquistaId = 12;

        if (conquistaId) {
          try {
            await this.client.conquistas.addConquista(userId, conquistaId, "Progressão");
          } catch (e) {
            console.log("Erro ao adicionar conquista de AR:", e);
          }
        }
      }

      const embedLog = new EmbedBuilder()
        .setTitle("✨ Level Up — Rank de Aventureiro!")
        .setColor("#3DD1D9")
        .setThumbnail(this.client.users.cache.get(userId)?.displayAvatarURL() || null)
        .setDescription(
          `🛡️ **Usuário:** <@${userId}> \`(${userId})\`\n` +
          `🌍 **Servidor:** ${guild ? `**${guild.name}**\`(${guild.id})\`` : "Direto no DM"}\n` +
          `📅 **Data:** <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
          `🎉 Subiu para o **AR ${arAtual}**! Recompensas concedidas:\n` +
          `• 💎 160 Primogemas\n` +
          `• 💰 20.000 Mora\n\n` +
          `O espetáculo continua, bravo aventureiro!`
        )
        .setFooter({ text: "Furina do Discord" });

      try {
        await this.client.restMessenger.enviar(this.logChannel, { embeds: [embedLog] });
      } catch (e) {
        
      }

      if (userdb.notificar) {
        try {
          const user = await this.client.users.cache.get(userId);
          await user.send({
            embeds: [
              new EmbedBuilder()
                .setColor(2046807)
                .setTitle("**Oh là là! Um espetáculo digno dos aplausos mais estrondosos!** 🎭✨")
                 .setDescription(`Você subiu de Rank de Aventureiro! Agora ostenta o glorioso AR ${arAtual}, com nada menos que ${userdb.level.xp} pontos de experiência pulsando em suas veias! 💫\n` +
                    `Como recompensa por tão magnífico progresso, receba **160 Primogemas** 💎 e **20.000 Mora** 💰!\n\n` +
                    `**O palco da aventura o aguarda — e que comece o segundo ato!** 🎬🌟\n\n` +
                    `📩 *Ah, e caso deseje silenciar os mensageiros dos céus e encerrar essas doces notificações por DM...*\n` +
                    `Use o comando **/notificações desativar** e deixe o silêncio cair como a cortina no fim do espetáculo. 🎼🎭`
                  )
            ]
          });
        } catch (err) {
          
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
