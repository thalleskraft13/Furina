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
      await interaction.deferReply();

      let mensagem = interaction.options.getString('mensagem');
      const tempoStr = interaction.options.getString('tempo');
      const tempoMs = ms(tempoStr);

      // Filtra menções perigosas
      mensagem = mensagem
        .replace(/@everyone/g, '[everyone]')
        .replace(/@here/g, '[here]')
        .replace(/<@&\d+>/g, '[cargo]');

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
        allowedMentions: { users: [interaction.user.id] },
        flags: 64
      });

    } catch (err) {
      console.error(err);

      const id = await client.reportarErro({
        erro: err,
        comando: interaction.commandName,
        servidor: interaction.guild
      });

      return interaction.editReply({
        content: `❌ Oh là là... Um contratempo inesperado surgiu durante a execução deste comando. Por gentileza, reporte este erro ao nosso servidor de suporte junto com o ID abaixo, para que a justiça divina possa ser feita!\n\n🆔 ID do erro: \`${id}\``,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: "Servidor de Suporte",
                style: 5,
                url: "https://discord.gg/KQg2B5JeBh"
              }
            ]
          }
        ],
        embeds: [],
        files: []
      });
    }

  }
};
