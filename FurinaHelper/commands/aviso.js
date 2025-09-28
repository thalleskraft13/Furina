const db = require("../../Furina/client/mongodb/user");

module.exports = {
  config: {
    name: "aviso",
    description: "Ativa ou desativa o aviso de um usuário pelo ID",
    usage: "f-aviso <id> <on/off> [texto]",
  },

  async run(bot, message, args) {
    if (!message.member.roles.cache.has("1374103804882194546")) {
      return message.reply("❌ Você não tem permissão para usar esse comando.");
    }

    const userId = args[0];
    const acao = args[1]; // on ou off
    const texto = args.slice(2).join(" ") || "";

    if (!userId) {
      return message.reply("❌ Informe o ID do usuário.");
    }

    if (!acao || !["on", "off"].includes(acao.toLowerCase())) {
      return message.reply("❌ Use `f-aviso <id> on <texto>` para ativar ou `f-aviso <id> off` para desativar.");
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

    if (acao.toLowerCase() === "on") {
      userdb.aviso = {
        ativado: true,
        texto: texto || "Sem mensagem definida.",
      };
    } else {
      userdb.aviso = {
        ativado: false,
        texto: "",
      };
    }

    await userdb.save();

    return message.reply(
      acao.toLowerCase() === "on"
        ? `📢 Aviso do usuário **${userId}** ativado com a mensagem: **${userdb.aviso.texto}**`
        : `📢 Aviso do usuário **${userId}** desativado com sucesso!`
    );
  },
};
