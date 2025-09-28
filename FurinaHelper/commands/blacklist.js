const db = require("../../Furina/client/mongodb/user");

module.exports = {
  config: {
    name: "blacklist",
  },
  run: async (bot, message, args) => {
    if (!message.member.roles.cache.has("1374103804882194546")) {
      return message.reply("❌ Você não tem permissão para usar esse comando.");
    }

    let action = args[0]; // ativar, desativar, info
    let userId = args[1];
    let tempoArg = args[2]; // opcional: tempo (ex: 10m, 2h, 1d)
    let motivo = args.slice(tempoArg ? 3 : 2).join(" ") || "Motivo não informado";

    if (!["ativar", "desativar", "info"].includes(action)) {
      return message.reply(
        "⚠️ Use: `blacklist <ativar|desativar|info> <id> [tempo] [motivo]`"
      );
    }

    if (!userId) {
      return message.reply("⚠️ Você precisa informar o ID do usuário.");
    }

    // Busca ou cria usuário no banco
    let userdb = await db.findOne({ id: userId });
    if (!userdb) {
      userdb = new db({ id: userId });
      await userdb.save();
    }

    if (action === "ativar") {
      let ilimitado = true;
      let tempo = 0;

      if (tempoArg && /^[0-9]+[smhd]$/.test(tempoArg)) {
        const valor = parseInt(tempoArg.slice(0, -1));
        const unidade = tempoArg.slice(-1);

        let multiplicador = {
          s: 1000,
          m: 60 * 1000,
          h: 60 * 60 * 1000,
          d: 24 * 60 * 60 * 1000,
        }[unidade];

        tempo = Date.now() + valor * multiplicador;
        ilimitado = false;
      }

      userdb.blacklist = {
        motivo,
        equipe: {
          id: message.author.id,
          username: message.author.username,
        },
        tempo: {
          ilimitado,
          tempo,
        },
      };

      await userdb.save();

      return message.reply(
        `⛔ O usuário <@${userId}> foi adicionado à blacklist.\n` +
          `Motivo: **${motivo}**\n` +
          (ilimitado
            ? "⏳ Punição permanente"
            : `⏳ Expira em <t:${Math.floor(tempo / 1000)}:R>`)
      );
    }

    if (action === "desativar") {
      userdb.blacklist = undefined;
      await userdb.save();

      return message.reply(
        `✅ O usuário <@${userId}> foi removido da blacklist.`
      );
    }

    if (action === "info") {
      if (!userdb.blacklist) {
        return message.reply(`ℹ️ O usuário <@${userId}> não está na blacklist.`);
      }

      const { motivo, equipe, tempo } = userdb.blacklist;

      return message.reply(
        `🚫 O usuário <@${userId}> está na blacklist.\n` +
          `**Motivo:** ${motivo}\n` +
          `**Adicionado por:** ${equipe?.username || "Desconhecido"}\n` +
          (tempo?.ilimitado
            ? "⏳ Permanente"
            : `⏳ Expira em <t:${Math.floor(tempo.tempo / 1000)}:R>`)
      );
    }
  },
};
