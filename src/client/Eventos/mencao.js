const { codeBlock } = require("discord.js");

module.exports = {
  evento: "messageCreate",
  run: async (client, message) => {
    if (message.author.bot || !message.guild) return;

    const conteudo = message.content.trim();

    const botMention = `<@${client.user.id}>`;
    const botMentionAlt = `<@!${client.user.id}>`;

    const isEvalCommand =
      conteudo.startsWith(`${botMention} eval`) ||
      conteudo.startsWith(`${botMentionAlt} eval`);
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
          content: `❌ Erro ao executar:\n${codeBlock(
            "js",
            err.message.slice(0, 1900)
          )}`,
        });
      }
      return;
    }

    if (isEvalCommand && !isAutorizado) {
      return; // Ignora se não autorizado
    }

    if (conteudo === botMention || conteudo === botMentionAlt) {
      await message.reply({
        content: `🎭 Oh~ Você ousou mencionar a grandiosa Furina? Excelente escolha! Explore todo o meu esplendor no meu menu de comandos, </ajuda:${await client.obterComando(
          "ajuda"
        )}>`,
      });
      return;
    }
  },
};
