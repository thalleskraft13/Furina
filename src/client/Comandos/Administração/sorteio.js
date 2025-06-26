module.exports = {
  name: "sorteio",
  description: "Gerenciar sorteios (criar, reroll, encerrar)",
  options: [
    {
      name: "criar",
      type: 1, // Subcomando
      description: "Criar um novo sorteio"
    },
    {
      name: "reroll",
      type: 1, // Subcomando
      description: "Realizar reroll de um sorteio finalizado",
      options: [
        {
          name: "id",
          description: "ID do sorteio",
          type: 3, // String
          required: true
        }
      ]
    },
    {
      name: "encerrar",
      type: 1, // Subcomando
      description: "Encerrar um sorteio manualmente",
      options: [
        {
          name: "id",
          description: "ID do sorteio",
          type: 3, // String
          required: true
        }
      ]
    }
  ],

  run: async (client, interaction) => {
    // interaction já está deferido

    const subCommand = interaction.options.getSubcommand();;
    const gerenciador = client.GerenciadorSorteio;

    switch (subCommand) {
      case "criar":
        return gerenciador.criarSorteioComando(interaction);

      case "reroll": {
        const id = interaction.options.getString("id");
        return gerenciador.reroll(interaction, id);
      }

      case "encerrar": {
        const id = interaction.options.getString("id");
        return gerenciador.encerrar(interaction, id);
      }

      default:
        return interaction.editReply({ content: "Subcomando inválido.", ephemeral: true });
    }
  }
};
