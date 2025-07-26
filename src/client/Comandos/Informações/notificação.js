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
    } catch (e) {
      console.log(e)
      return interaction.editReply({
        content: `❌ Oh là là! Algo deu errado ao executar o comando. Por favor, reporte ao servidor de suporte para que possamos trazer justiça a essa falha.\n\n\`\`\`\n${e}\n\`\`\``
      })
    }
  }
}