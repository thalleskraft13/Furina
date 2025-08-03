module.exports = {
  name: "notificações",
  description: "grupo de cmd",
  type: 1,
  options: [{
    name: "ativar",
    description: "Receba as bênçãos do vento direto no seu DM para estar sempre por dentro",
    type: 1
  },{
    name: "desativar",
    description: "Deixe o silêncio cair sobre as notificações e aproveite a calmaria no seu DM",
    type: 1
  }],

  run: async(client, interaction) => {

    try {
  let option = interaction.options.getSubcommand()
      await interaction.deferReply({ ephemeral: true })  
  let ativadoOuNao;
    if (option === "ativar") ativadoOuNao = true;
    if (option === "desativar") ativadoOuNao = false;

    let userdb = await client.userdb.findOne({
      id: interaction.user.id
    })

    if (!userdb){
      let newuser = new client.userdb({
        id: interaction.user.id
      })

      await newuser.save();

      userdb = await client.userdb.findOne({
      id: interaction.user.id
    })
    }

    userdb.notificar = ativadoOuNao;
    await userdb.save();

    return interaction.editReply({
      content: `${ativadoOuNao ? "Suas notificações foram ativadas! Que os ventos tragam boas novas até você" : "Suas notificações foram desativadas! Que o silêncio seja seu conforto e descanso."}`
    }) 
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
}