const {
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");

const Corrida = require("../../../class/corrida")

module.exports = {
  name: "minigame",
  description: "Desafie outro jogador para um minigame!",
  dm_permission: false,
  default_member_permissions: PermissionFlagsBits.SendMessages,
  options: [
    {
      name: "corrida",
      description: "Desafie alguém para uma corrida divertida!",
      type: 1, // subcommand
      options: [
        {
          name: "jogador",
          description: "Usuário que você deseja desafiar",
          type: ApplicationCommandOptionType.User,
          required: true,
        },
        {
          name: "aposta",
          description: "Quantidade de primogemas apostadas (opcional)",
          type: ApplicationCommandOptionType.Integer,
          min_value: 0,
          required: false,
        },
      ],
    },
  ],

  async run(client, interaction) {
    const sub = interaction.options.getSubcommand();
    if (sub !== "corrida") return;

    const desafiante = interaction.user;
    const desafiado = interaction.options.getUser("jogador");
    const aposta = interaction.options.getInteger("aposta") || 0;

    // Verificações iniciais
  /*  if (desafiado.bot || desafiado.id === client.user.id) {
      return interaction.reply({
        content: "Você não pode desafiar bots ou o próprio sistema para uma corrida!",
        ephemeral: true,
      });
    }*/

    if (desafiado.id === desafiante.id) {
      return interaction.reply({
        content: "Você não pode desafiar a si mesmo!",
        ephemeral: true,
      });
    }

    // Buscar os dados dos usuários
    const userData = await client.userdb.findOne({ id: desafiante.id });
    const targetData = await client.userdb.findOne({ id: desafiado.id });

    /*

    if (!userData || !targetData) {
      return interaction.reply({
        content: "Um dos jogadores não possui registro no sistema.",
        ephemeral: true,
      });
    }

    
    if (aposta > 0) {
      if (userData.primogemas < aposta) {
        return interaction.reply({
          content: "Você não possui primogemas suficientes para essa aposta.",
          ephemeral: true,
        });
      }

      if (targetData.primogemas < aposta) {
        return interaction.reply({
          content: `${desafiado.username} não possui primogemas suficientes para essa aposta.`,
          ephemeral: true,
        });
      }
    }

    
    if (!userData.equipe?.[0]) {
      return interaction.reply({
        content: "Você precisa ter pelo menos um personagem na equipe para participar!",
        ephemeral: true,
      });
    }

    if (!targetData.equipe?.[0]) {
      return interaction.reply({
        content: `${desafiado.username} não possui personagem na equipe para participar da corrida.`,
        ephemeral: true,
      });
    }*/

    targetData.equipe[0] = "Furina";

    await interaction.deferReply();
    const CorridaGame = new Corrida(
  client,
  desafiante,
  desafiado,
  userData.equipe[0],
  targetData.equipe[0],
  interaction,
  aposta
);

await CorridaGame.iniciar();

  },
};
