const ms = require("ms");

module.exports = {
  name: "diárias",
  description: "Até os mais ilustres devem cumprir suas tarefas",
  type: 1,
  run: async(client, interaction) => {
    let userdb = await client.userdb.findOne({
      id: interaction.user.id
    })

    if (!userdb){
      let newuser = new client.userdb({ id: interaction.user.id });

      await newuser.save();

      userdb = await client.userdb.findOne({
      id: interaction.user.id
    })
    }

    if (Date.now() < userdb.daily){
      return await interaction.editReply({
        content: "Você já fez suas diárias hoje? Non?! Hah… então volte mais tarde, s'il vous plaît!"
      })
    } else {

      userdb.primogemas += 60;
      userdb.mora += 20000;
      userdb.daily = Date.now() + ms("24h");
      await userdb.save();
      client.RankAventureiro.addXp(interaction.user.id, 30);

      return await interaction.editReply({
        content: "Ah là là~ Missão cumprida! Você resgatou suas recompensas diárias: 60 Primogemas, 20.000 de Mora e 20 de XP! Uma performance digna de aplausos!"
      })
    }
  }
}