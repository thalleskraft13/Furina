const { PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  evento: "messageCreate",
  run: async (client, message) => {
    if (message.author.bot || !message.guild) return;

    const conteudo = message.content.trim().toLowerCase(); // tudo em minúsculo

    try {
      const dadosServidor = await client.serverdb.findOne({ serverId: message.guild.id });
      if (!dadosServidor || !dadosServidor.mensagens_personalizadas?.length) return;

      const respostas = dadosServidor.mensagens_personalizadas.filter(m => m.ativado);

      const substituirVars = (texto) => {
        if (!texto) return "";
        return texto
          .replace(/\(user\.username\)/g, message.author.username)
          .replace(/\(user\.id\)/g, message.author.id)
          .replace(/\(user\.avatar\)/g, message.author.displayAvatarURL({ dynamic: true }))
          .replace(/\(guild\.name\)/g, message.guild.name)
          .replace(/\(guild\.id\)/g, message.guild.id)
          .replace(/\(guild\.membrosTotais\)/g, message.guild.memberCount.toString())
          .replace(/\(@user\)/g, `<@${message.author.id}>`);
      };

      const substituirEmbedVars = (embedJson) => {
        if (!embedJson || typeof embedJson !== "object") return embedJson;
        const substituir = substituirVars;

        if (embedJson.title) embedJson.title = substituir(embedJson.title);
        if (embedJson.description) embedJson.description = substituir(embedJson.description);
        if (embedJson.thumbnail?.url) embedJson.thumbnail.url = substituir(embedJson.thumbnail.url);
        if (embedJson.image?.url) embedJson.image.url = substituir(embedJson.image.url);

        if (embedJson.author) {
          if (embedJson.author.name) embedJson.author.name = substituir(embedJson.author.name);
          if (embedJson.author.icon_url) embedJson.author.icon_url = substituir(embedJson.author.icon_url);
        }

        if (embedJson.footer) {
          if (embedJson.footer.text) embedJson.footer.text = substituir(embedJson.footer.text);
          if (embedJson.footer.icon_url) embedJson.footer.icon_url = substituir(embedJson.footer.icon_url);
        }

        if (Array.isArray(embedJson.fields)) {
          embedJson.fields = embedJson.fields.map(f => ({
            name: substituir(f.name),
            value: substituir(f.value),
            inline: f.inline
          }));
        }

        return embedJson;
      };

      for (const config of respostas) {
        const palavraChave = config.palavra.toLowerCase();
        if (!conteudo.includes(palavraChave)) continue;

        const podeResponder = message.channel
          .permissionsFor(client.user)
          .has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]);

        if (!podeResponder) return;

        try {
          if (config.tipo === "texto") {
            const resposta = substituirVars(config.resposta);
            if (config.modo === "responder") {
              try {
                await message.reply({ content: resposta });
              } catch {
                await message.channel.send({ content: resposta });
              }
            } else {
              await message.channel.send({ content: resposta });
            }
          } else if (config.tipo === "embed" && config.embed) {
            const embedJson = substituirEmbedVars(config.embed);
            const embed = new EmbedBuilder(embedJson);

            if (config.modo === "responder") {
              try {
                await message.reply({ embeds: [embed] });
              } catch {
                await message.channel.send({ embeds: [embed] });
              }
            } else {
              await message.channel.send({ embeds: [embed] });
            }
          }
        } catch (err) {
          console.error("Erro ao enviar resposta automática:", err);
        }

        break; // responde apenas uma vez
      }

    } catch (error) {
      console.error("Erro ao processar mensagens automáticas:", error);
    }
  }
};
