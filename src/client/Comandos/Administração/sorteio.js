module.exports = {
  name: "sorteio",
  description: "Gerenciar sorteios (criar, reroll, encerrar)",
  options: [
    {
      name: "criar",
      type: 1,
      description: "Criar um novo sorteio"
    },
    {
      name: "reroll",
      type: 1,
      description: "Realizar reroll de um sorteio finalizado",
      options: [
        {
          name: "id",
          description: "ID do sorteio",
          type: 3,
          required: true
        }
      ]
    },
    {
      name: "encerrar",
      type: 1,
      description: "Encerrar um sorteio manualmente",
      options: [
        {
          name: "id",
          description: "ID do sorteio",
          type: 3,
          required: true
        }
      ]
    }
  ],

  run: async (client, interaction) => {
    const subCommand = interaction.options.getSubcommand();
    const gerenciador = client.GerenciadorSorteio;

    await interaction.deferReply({ ephemeral: true });

    // Checa permissões básicas apenas para reroll e encerrar
    if (["reroll", "encerrar"].includes(subCommand)) {
      const hasPermission = interaction.member.permissions.has("ManageMessages");
      if (!hasPermission) {
        return interaction.editReply({
          content: "❌ Você precisa da permissão `Gerenciar Mensagens` para usar este subcomando."
        });
      }
    }

    try {
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
          return interaction.editReply({
            content: "Subcomando inválido."
          });
      }
    } catch (err) {
      console.error("Erro ao executar subcomando do sorteio:", err);
      return interaction.editReply({
        content: "❌ Ocorreu um erro ao executar o comando."
      });
    }
  }
};
