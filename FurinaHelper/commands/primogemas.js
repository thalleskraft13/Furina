const db = require("../../Furina/client/mongodb/user");

module.exports = {
  config: {
    name: "primogemas",
  },
  run: async (bot, message, args) => {
    // Verificação de Permissão
    if (!message.member.roles.cache.has("1374103804882194546")) {
      return message.reply("❌ Você não tem permissão para usar esse comando.");
    }

    let action = args[0]; // add, remove ou zerar
    let userId = args[1];
    let amount = Number(args[2]) || 0;

    if (!["add", "remove", "zerar"].includes(action)) {
      return message.reply("⚠️ Use: `primogemas <add|remove|zerar> <id> <quantidade>`");
    }

    if (!userId) {
      return message.reply("⚠️ Você precisa informar o ID do usuário.");
    }

    // Busca ou cria usuário no banco
    let userdb = await db.findOne({ id: userId });
    if (!userdb) {
      userdb = new db({ id: userId, primogemas: 0 });
      await userdb.save();
    }

    // Executa ação
    if (action === "add") {
      userdb.primogemas += amount;
    } else if (action === "remove") {
      userdb.primogemas = Math.max(0, userdb.primogemas - amount); // não deixar negativo
    } else if (action === "zerar") {
      userdb.primogemas = 0;
    }

    await userdb.save();

    return message.reply({
      content: `✅ O usuário \`${userId}\` agora possui **${userdb.primogemas}** primogemas.`,
    });
  },
};
