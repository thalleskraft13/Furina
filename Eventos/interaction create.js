const { ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } = require("discord.js");
const furina = require("../index.js");

furina.on("interactionCreate", async (interaction) => {

  if (interaction.isChatInputCommand()) {
  
  const command = furina.commands.get(interaction.commandName);

    if (!command) return;

    await interaction.deferReply();
    await furina.RankAventureiro.addXp(interaction.user.id, 10);
    
    try {
      command.run(furina, interaction);
    } catch (e) {
      await interaction.reply({
        content: `<:1000210943:1373427433570832475> | Inacreditável! Um comando tão inexistente quanto uma peça sem protagonista!`
      })
      console.error(e)
    };
  };
});