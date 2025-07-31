const { ActionRowBuilder, ButtonBuilder, ButtonStyle, codeBlock } = require("discord.js");

module.exports = {
  evento: "messageCreate",
  run: async (client, message) => {
    if (message.author.bot || !message.guild) return;

    const conteudo = message.content.trim();

    // ============================
    // 1. EVAL com @menção do bot
    // ============================
    const botMention = `<@${client.user.id}>`;
    const botMentionAlt = `<@!${client.user.id}>`;

    const isEvalCommand = conteudo.startsWith(`${botMention} eval`) || conteudo.startsWith(`${botMentionAlt} eval`);
    const isAutorizado = message.author.id === "890320875142930462";

    if (isEvalCommand && isAutorizado) {
      const code = conteudo
        .replace(`${botMention} eval`, "")
        .replace(`${botMentionAlt} eval`, "")
        .trim();

      try {
        let result = await eval(code);
        if (typeof result !== "string") {
          result = require("util").inspect(result, { depth: 1 });
        }

        await message.reply({
          content: `✨ Resultado:\n${codeBlock("js", result.slice(0, 1900))}`,
        });
      } catch (err) {
        await message.reply({
          content: `❌ Erro ao executar:\n${codeBlock("js", err.message.slice(0, 1900))}`,
        });
      }
      return;
    }

    if (isEvalCommand && !isAutorizado) {
      // Ignora completamente
      return;
    }

    // ============================
    // 2. Resposta ao mencionar o bot
    // ============================
    if (conteudo === botMention || conteudo === botMentionAlt) {
      await message.reply({
        content:
          `🎭 Oh~ Você ousou mencionar a grandiosa Furina? Excelente escolha! Explore todo o meu esplendor no meu menu de comandos, </ajuda:${await client.obterComando("ajuda")}>`,
      });
      return;
    }

    // ============================
    // 3. Mensagens automáticas por palavra-chave
    // ============================
    const messageWords = conteudo.toLowerCase().match(/\b\w+\b/g);

    if (messageWords && messageWords.length > 0) {
      try {
        const msgAutoList = await client.MsgAuto.find({
          serverId: message.guild.id
        });

        for (const word of messageWords) {
          const matched = msgAutoList.find(
            (item) => item.chaveDeMsg.toLowerCase() === word
          );
          if (matched) {
            await message.reply(matched.resposta);
            break;
          }
        }
      } catch (error) {
        console.error("Erro ao buscar mensagens automáticas:", error);
      }
    }
  }
};
