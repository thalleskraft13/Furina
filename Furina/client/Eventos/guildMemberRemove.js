const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  evento: "guildMemberRemove",
  run: async (client, member) => {
    try {
      if (member.user.bot) return;

      const config = await client.serverdb.findOne({ serverId: member.guild.id });
      const saida = config?.mensagens?.saida;

      if (!saida || !saida.ativado) return;

      const canalId = saida.canal;
      if (!canalId) return;

      const canal = member.guild.channels.cache.get(canalId);
      if (!canal?.isTextBased()) return;

      if (!canal.permissionsFor(client.user).has(PermissionFlagsBits.SendMessages)) return;

      // Função para substituir variáveis no texto
      function substituir(texto) {
  if (!texto || typeof texto !== "string") return texto;

  return texto
    .replace(/\(user\.username\)/g, member.user.username)
    .replace(/\(user\.globalName\)/g, member.user.globalName || member.user.username)
    .replace(/\(user\.id\)/g, member.user.id)
    .replace(/\(user\.avatar\)/g, member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
    .replace(/\(@user\)/g, `<@${member.user.id}>`)
    .replace(/\(guild\.name\)/g, member.guild.name)
    .replace(/\(guild\.id\)/g, member.guild.id)
    .replace(/\(guild\.avatar\)/g, member.guild.iconURL({ dynamic: true, size: 1024 }) || "")
    .replace(/\(guild\.membrosTotais\)/g, member.guild.memberCount.toString());
}


      // Validação simples de URL para evitar erros no Discord
      function validarUrl(url) {
        if (!url || typeof url !== "string") return false;
        try {
          const parsed = new URL(url);
          return ["http:", "https:"].includes(parsed.protocol);
        } catch {
          return false;
        }
      }

      if (saida.tipo === "texto" && saida.conteudo) {
        let mensagem = substituir(saida.conteudo);
        await canal.send(mensagem);
      } else if (saida.tipo === "embed" && saida.embed) {
        const embedData = JSON.parse(JSON.stringify(saida.embed));

        if (embedData.title) embedData.title = substituir(embedData.title);
        if (embedData.description) embedData.description = substituir(embedData.description);

        if (embedData.thumbnail?.url) {
          embedData.thumbnail.url = substituir(embedData.thumbnail.url);
          if (!validarUrl(embedData.thumbnail.url)) delete embedData.thumbnail;
        }

        if (embedData.image?.url) {
          embedData.image.url = substituir(embedData.image.url);
          if (!validarUrl(embedData.image.url)) delete embedData.image;
        }

        if (embedData.author) {
          if (embedData.author.name) embedData.author.name = substituir(embedData.author.name);
          if (embedData.author.icon_url) {
            embedData.author.icon_url = substituir(embedData.author.icon_url);
            if (!validarUrl(embedData.author.icon_url)) delete embedData.author.icon_url;
          }
          if (Object.keys(embedData.author).length === 0) delete embedData.author;
        }

        if (embedData.footer) {
          if (embedData.footer.text) embedData.footer.text = substituir(embedData.footer.text);
          if (embedData.footer.icon_url) {
            embedData.footer.icon_url = substituir(embedData.footer.icon_url);
            if (!validarUrl(embedData.footer.icon_url)) delete embedData.footer.icon_url;
          }
          if (Object.keys(embedData.footer).length === 0) delete embedData.footer;
        }

        if (Array.isArray(embedData.fields)) {
          embedData.fields = embedData.fields.map((f) => ({
            name: substituir(f.name),
            value: substituir(f.value),
            inline: f.inline,
          }));
        }

        const embed = new EmbedBuilder(embedData);
        await canal.send({ embeds: [embed], content: `<@${member.user.id}>`});
      }

    } catch (err) {
      console.error("Erro no evento guildMemberRemove:", err);
    }
  }
};
