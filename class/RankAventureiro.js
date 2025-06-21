const { TextDisplayBuilder, ContainerBuilder } = require("discord.js");

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
  }

  async addXp(user, value){

    let userdb = await this.client.userdb.findOne({
      id: user
    });

    if (!userdb){
      let newuser = new this.client.userdb({
        id: user
      })

      await newuser.save();

      userdb = await this.client.userdb.findOne({
      id: user
    });
    }

    userdb.level.xp += value;

    if (userdb.level.xp >= userdb.level.xpMax){
      //se atingir o xp

      userdb.level.ar++;
      userdb.level.xpMax = this.xpRequirements[userdb.level.ar - 1];
      userdb.primogemas += 160;
      userdb.mora += 20000;

      const components = [
        new ContainerBuilder()
            .setAccentColor(2046807)
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Oh là là! Um espetáculo digno dos aplausos mais estrondosos!** 🎭✨\n\nVocê subiu de Rank de Aventureiro! Agora ostenta o glorioso AR ${userdb.level.ar}, com nada menos que ${userdb.level.xp} pontos de experiência pulsando em suas veias! 💫\nComo recompensa por tão magnífico progresso, receba **160 Primogemas** 💎 e **20.000 Mora** 💰!\n\n**O palco da aventura o aguarda — e que comece o segundo ato!** 🎬🌟\n\n📩 *Ah, e caso deseje silenciar os mensageiros dos céus e encerrar essas doces notificações por DM...*\nUse o comando **/notificação desativar** e deixe o silêncio cair como a cortina no fim do espetáculo. 🎼🎭`
),
            ),
];

      
      
      await userdb.save()

      if (userdb.notificar){
        this.client.users.cache.get(user).send({
        components: components,
        flags: 32768
      })
      }
    } else {
      await userdb.save();
    }
  }
}

module.exports = RankAventureiro;