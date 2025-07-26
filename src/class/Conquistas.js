const { EmbedBuilder } = require("discord.js");

class Conquistas {
  constructor(client) {
    this.client = client;
  }

  async addConquista(userId, id, categoria) {
    const userdb = await this.client.userdb.findOne({ id: userId });
    if (!userdb) return false;

    const jaTem = userdb.conquistas.some(c => c.id === id);
    if (jaTem) return false;

    const conquista = {
      id,
      data: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      categoria
    };

    userdb.conquistas.push(conquista);
    await userdb.save();

    const conquistaInfo = this.client.conquistasJson.find(c => c.id === id);
    let user = null;

    try {
      user = await this.client.users.fetch(userId);

      // Envia DM se permitido
      if (userdb.notificar) {
        if (user.dmChannel === null) await user.createDM();

        const embedDM = new EmbedBuilder()
          .setTitle("🌊✨ Conquista Desbloqueada!")
          .setColor("#00d4ff")
          .setDescription(`Você desbloqueou a conquista **${conquistaInfo?.nome || id}**!\n\n${conquistaInfo?.descricao || "Descrição indisponível."}`)
          .setFooter({ text: "Tribunal de Fontaine • Furina do Discord", iconURL: this.client.user.displayAvatarURL() })
          .setTimestamp();

        await user.send({ embeds: [embedDM] });
      }
    } catch {
      // Usuário não existe ou bloqueou DMs
    }
try {
  const embedLog = new EmbedBuilder()
    .setTitle("🏆 Conquista Desbloqueada")
    .setColor(0x00d4ff)
    .addFields(
      {
        name: "👤 Usuário",
        value: user
          ? `**${user.username}**\nID: \`${user.id}\``
          : `ID: \`${userId}\``,
        inline: false
      },
      {
        name: "🎖️ Conquista",
        value: `**${conquistaInfo?.nome || `Conquista #${id}`}**\n${conquistaInfo?.descricao || "Sem descrição."}`,
        inline: false
      },
      {
        name: "📁 Categoria",
        value: `\`${categoria}\``,
        inline: true
      },
      {
        name: "🕰️ Data",
        value: new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
        inline: true
      }
    )
    .setFooter({ text: "Registro público de conquistas" })
    .setTimestamp();

  

      await this.client.restMessenger.enviar("1398385661978874063", {
        embeds: [embedLog]
      });
    } catch (err) {
      console.error("[Conquistas] Falha ao enviar log público:", err);
    }

    return true;
  }

  async temConquista(userId, id) {
    const userdb = await this.client.userdb.findOne({ id: userId });
    if (!userdb) return false;
    return userdb.conquistas.some(c => c.id === id);
  }

  async listarConquistasPorCategoria(userId) {
    const userdb = await this.client.userdb.findOne({ id: userId });
    if (!userdb) return {};

    const agrupadas = {};
    for (const c of userdb.conquistas || []) {
      if (!agrupadas[c.categoria]) agrupadas[c.categoria] = [];
      agrupadas[c.categoria].push(c);
    }

    return agrupadas;
  }
}

module.exports = Conquistas;
