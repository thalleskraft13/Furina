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

    if (userdb.notificar) {
      try {
        const user = await this.client.users.fetch(userId);
        if (user.dmChannel === null) await user.createDM();

        const conquistaInfo = this.client.conquistasJson.find(c => c.id === id);

        const { EmbedBuilder } = require("discord.js");

        const embed = new EmbedBuilder()
          .setTitle("🌊✨ Conquista Desbloqueada!")
          .setColor("#00d4ff")
          .setDescription(`Você desbloqueou a conquista **${conquistaInfo?.nome || id}**!\n\n${conquistaInfo?.descricao || "Descrição indisponível."}`)
          .setFooter({ text: "Tribunal de Fontaine • Furina do Discord", iconURL: this.client.user.displayAvatarURL() })
          .setTimestamp();

        await user.send({ embeds: [embed] });
      } catch {
        // usuário bloqueou DM ou não pode receber mensagem
      }
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

    const conquistas = userdb.conquistas || [];

    const agrupadas = {};

    for (const c of conquistas) {
      if (!agrupadas[c.categoria]) agrupadas[c.categoria] = [];
      agrupadas[c.categoria].push(c);
    }

    return agrupadas;
  }
}

module.exports = Conquistas;
