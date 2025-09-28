const { user } = require("../../Furina/client/mongodb/edenServer");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  config: {
    name: 'pontos',
    description: 'Veja seus pontos ou o ranking do evento',
    options: [
      {
        name: "ver",
        description: "Veja seus pontos ou de outro usuário",
        type: 1, // Subcomando
        options: [
          {
            name: "usuario",
            description: "Mencione um usuário ou veja seus próprios pontos",
            type: 6,
            required: false
          }
        ]
      },
      {
        name: "rank",
        description: "Veja o ranking do evento (Top 30)",
        type: 1 // Subcomando
      }
    ],
  },

  run: async (bot, interaction) => {
    const sub = interaction.options.getSubcommand();

    if (sub === "ver") {
      const userOption = interaction.options.getUser("usuario") || interaction.user;

      let userData = await user.findOne({ userId: userOption.id });
      if (!userData) {
        userData = new user({ userId: userOption.id });
        await userData.save();
      }

      const pontos = userData.reactEvent.pontos || 0;

      const ranking = await user.find({}).sort({ "reactEvent.pontos": -1 });
      const position = ranking.findIndex(u => u.userId === userOption.id) + 1;

      if (userOption.id === interaction.user.id) {
        return interaction.reply({
          content: `Você tem **${pontos} pontos** no evento e está na **posição ${position}**.`
        });
      } else {
        return interaction.reply({
          content: `${userOption} tem **${pontos} pontos** no evento e está na **posição ${position}**.`
        });
      }
    }

    if (sub === "rank") {
      const ranking = await user.find({}).sort({ "reactEvent.pontos": -1 }).limit(30);

      const embed = new EmbedBuilder()
        .setTitle("🏆 Ranking do Evento (Top 30)")
        .setColor("Gold")
        .setDescription(ranking.map((u, i) => {
          const userTag = bot.users.cache.get(u.userId)?.username || "Usuário desconhecido";
          const userUrl = `https://discord.com/users/${u.userId}`;
          const pontos = u.reactEvent.pontos || 0;
          return `**${i + 1}.** [${userTag}](${userUrl}) — ${pontos} pontos`;
        }).join("\n"))
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }
  }
};
