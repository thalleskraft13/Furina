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
  } else if (interaction.isModalSubmit()){
    if (interaction.customId ===  "uid"){

      console.log("recebido")
      

      let nome  = interaction.fields.getTextInputValue("1")

      let uid = interaction.fields.getTextInputValue("2");

  await furina.channels.cache.get("1374001383984074833")
      .send({
        embeds: [new EmbedBuilder()
                 .setTitle("Verificação de Uid")
                 .setDescription(`Nome: ${nome}\nUid: ${uid}`)
                 .setColor("Orange")
                 ],
        content: `UserId: ${interaction.user.id} | @everyone`
      })

      await interaction.reply({
        content: `O grandioso ritual de verificação foi iniciado! Seu UID foi enviado aos olhos atentos do destino. Agora, adicione o portador do UID **662543202** no jogo para que a confirmação possa ocorrer. A avaliação levará cerca de 24 horas, e você será informado se a bênção da verificação foi concedida… ou recusada. Para mais detalhes, dirija-se ao salão de suporte: https://discord.gg/aC5yqnXvmv`,
        ephemeral: true
      })
      
    }
  }
});