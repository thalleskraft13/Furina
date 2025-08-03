const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "duelo",
  description: "Inicia uma batalha no Abismo ou contra outro jogador.",
  dmPermission: false,
  type: 1, // Chat Input
  options: [
    {
      name: "abismo",
      description: "Inicia uma batalha no Abismo com sua equipe.",
      type: 1, // Subcommand
    },
    {
      name: "membro",
      description: "Desafia outro jogador para um duelo PvP.",
      type: 1,
      options: [
        {
          name: "oponente",
          description: "Mencione o membro que deseja desafiar.",
          type: 6, // USER
          required: true,
        },
      ],
    },
    {
      name: "status",
      description: "Mostra suas vitórias e derrotas nos duelos PvP.",
      type: 1,
    },
  ],

  run: async (client, interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const Usuarios = client.userdb;
    await interaction.deferReply();
    
    try {
      if (subcommand === "abismo") {
        if (!client.Abismo || typeof client.Abismo.comando !== "function") {
          return interaction.editReply("❌ O sistema do Abismo não está carregado corretamente.");
        }
        await client.Abismo.comando(interaction);
      }

      else if (subcommand === "membro") {
        if (!client.Pvp || typeof client.Pvp.iniciarDuelo !== "function") {
          return interaction.editReply("❌ O sistema de PvP não está carregado corretamente.");
        }
        const oponente = interaction.options.getUser("oponente");
        if (!oponente || oponente.bot || oponente.id === interaction.user.id) {
          return interaction.editReply("❌ Você precisa mencionar um jogador válido (não pode ser você mesmo ou um bot).");
        }
        await client.Pvp.iniciarDuelo(interaction, oponente.id);
      }

      else if (subcommand === "status") {
        const userId = interaction.user.id;
        const userData = await Usuarios.findOne({ id: userId });

        if (!userData) {
          return interaction.editReply(
            "Ah, minha flor, parece que você ainda não entrou nessa dança PvP comigo... Bora montar seu time e começar a brilhar, tá? 🌿✨"
          );
        }

        const vitorias = userData.vitoriasPvP || 0;
        const derrotas = userData.derrotasPvP || 0;
        const total = vitorias + derrotas;
        const taxaVitoria = total > 0 ? ((vitorias / total) * 100).toFixed(1) : "0.0";

        const embed = new EmbedBuilder()
          .setTitle("🍃✨ Estatísticas do Duelo com a Furina ✨🍃")
          .setDescription(
            `Oi, minha linda(o)! Aqui é a Furina, e vim dar aquela espiadinha no seu progresso, tá? 😌\n\n` +
            `🌸 Você já ganhou **${vitorias}** vez(es)! Mandou muito bem, hein?! 👏\n` +
            `🌿 E perdeu **${derrotas}** vez(es)... Ah, relaxa, isso é só parte da jornada, tá? Todo mundo tropeça, mas a graça tá em levantar com estilo! 💃\n` +
            `🍃 Sua taxa de vitória é de **${taxaVitoria}%** — Tá chegando lá, só não desanima que o jogo tá só começando! 🚀\n\n` +
            `Fica tranquila(o), eu tô aqui na torcida, mandando boas energias e uns ventinhos fresquinhos pra você sempre! 🌬️💖\n` +
            `Se precisar de uma ajudinha, só chamar que a fada Furina dá um jeitinho, pode apostar! 🧚‍♀️`
          )
          .setColor("#9BCB8B") // Verde claro, cor da Furina
          .setFooter({ text: "PvP com o charme e carinho da Furina 🍃" })
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
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

  },
};
