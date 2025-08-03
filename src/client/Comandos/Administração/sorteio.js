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
