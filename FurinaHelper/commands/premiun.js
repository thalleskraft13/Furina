const db = require("../../Furina/client/mongodb/user");

module.exports = {
  config: {
    name: "addpremium",
    description: "Adiciona tempo de premium a um usuário pelo ID",
    usage: "f-addpremium <id> <dias> (0 para permanente)",
  },

  async run(bot, message, args) {
    if (!message.member.roles.cache.has("1374103804882194546")) {
      return message.reply("❌ Você não tem permissão para usar esse comando.");
    }
    const userId = args[0];
    const dias = parseInt(args[1]);

    if (!userId) {
      return message.reply("❌ Você precisa informar o ID do usuário!");
    }

    if (isNaN(dias)) {
      return message.reply("❌ Você precisa informar um número de dias (ou `0` para permanente).");
    }

    // busca ou cria userdb
    let userdb = await db.findOne({ id: userId });
    if (!userdb) {
      userdb = new db({
        id: userId,
        gacha: { pity: { five: 0, four: 0, garantia5: false } },
        personagens: [],
        armas: [],
        primogemas: 0,
        premium: 0,
        notificar: true,
      });
    }

    if (dias === 0) {
      // premium permanente
      userdb.premium = 9999999999999;
    } else {
      // premium por X dias
      const futuro = Date.now() + dias * 24 * 60 * 60 * 1000;
      userdb.premium = futuro;
    }

    await userdb.save();

    return message.reply(`✅ Premium de **${userId}** atualizado com sucesso! ${dias === 0 ? "🌟 Permanente" : `⏳ ${dias} dias`}`);
  },
};
