const ms = require('ms');

module.exports = {
  name: "lembrete",
  description: "Crie um lembrete para ser lembrado mais tarde.",
  type: 1,
  options: [
    {
      name: "mensagem",
      description: "O que você deseja lembrar?",
      type: 3,
      required: true
    },
    {
      name: "tempo",
      description: "Quando lembrar? (ex: 10m, 2h, 1d)",
      type: 3,
      required: true
    }
  ],

  run: async (client, interaction) => {
    try {
      const mensagem = interaction.options.getString('mensagem');
      const tempoStr = interaction.options.getString('tempo');
      const tempoMs = ms(tempoStr);

      if (!tempoMs || tempoMs < 5000 || tempoMs > 31536000000) {
        return interaction.editReply({
          content: '⏳ Tempo inválido! Use algo como `10m`, `2h`, `1d` (mínimo 5 segundos, máximo 1 ano).',
          flags: 64
        });
      }

      const dataExecucao = new Date(Date.now() + tempoMs);

      await client.GerenciadorTarefas.criarTarefa('lembrete', {
        canalId: interaction.channel.id,
        userId: interaction.user.id,
        mensagem,
        guildId: interaction.guildId
      }, dataExecucao);

      return interaction.editReply({
        content: `⏰ O tempo está marcado! Em **${tempoStr}**, <@${interaction.user.id}>, como Arconte da Justiça, espero que isso tenha valido a espera~ ✨`,
        flags: 64
      });

    } catch (e) {
      console.error(e);
      return interaction.editReply({
        content: `❌ Um deslize ocorreu no fluxo da justiça. Por favor, tente novamente ou reporte o erro.\n\n\`\`\`\n${e}\n\`\`\``,
        flags: 64
      });
    }
  }
};
