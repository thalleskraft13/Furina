const PerfilCard = require("../../../class/Perfil.js");
const { AttachmentBuilder } = require("discord.js");

module.exports = {
  name: "perfil",
  description: "grupo de cm",
  type: 1,
  options: [{
    name: "ver",
    description: "Veja o perfil dramático de alguém!",
    type: 1,
    options: [{
      name: "usuario",
      description: "Mencione ou insira o ID",
      type: 6,
      required: false
    }]
  },{
    name: "sobremim",
    description: "Reescreva seu espetáculo pessoal!",
    type: 1,
    options: [{
      name: "texto",
      description: "Escreva seu sobremim",
      type: 3,
      required: true
    }],
  }],

  run: async (client, interaction) => {
    try {
  if (interaction.options.getSubcommand() === "ver") {
    await interaction.deferReply();
    
      let user = interaction.options.getUser("usuario") || interaction.user;

      let userdb = await client.userdb.findOne({ id: user.id });
      if (!userdb) {
        await new client.userdb({ id: user.id }).save();
        userdb = await client.userdb.findOne({ id: user.id });
      }

    if (userdb.uid === "0") userdb.uid = "Não verificado";

      let userData = {
        userAvatar: user.displayAvatarURL({ extension: "png", size: 512 }),
        userName: user.globalName || user.username,
        uid: userdb.uid,
        sobremim: userdb.perfil.sobremim,
        primogemas: userdb.primogemas,
        mora: userdb.mora,
        conquistas: userdb.conquistas.length,
        rankLevel: userdb.level.ar,
        xp: userdb.level.xp
      };

      let personagem = userdb.perfil.tema;

      let perfil = new PerfilCard(interaction, personagem, userData);
      

      let img = await perfil.gerarImagem();

      await interaction.editReply({
        files: [img],
        content: `${interaction.user}`
      })
      
    } else if (interaction.options.getSubcommand() === "sobremim"){
    await interaction.deferReply({ ephemeral: true })

    let novoSobremim = interaction.options.getString("texto");

    let userdb = await client.userdb.findOne({ id: interaction.user.id });
      if (!userdb) {
        await new client.userdb({ id: interaction.user.id }).save();
        userdb = await client.userdb.findOne({ id: interaction.user.id });
      }

     userdb.perfil.sobremim = novoSobremim;
     await userdb.save();

    return interaction.editReply("Bravo! Seu 'sobre mim' ganhou um novo brilho!")
  }
    } catch (e) {
      console.log(e);
return interaction.editReply(`❌ Oh là là! Algo deu errado ao executar o comando. Por favor, reporte ao servidor de suporte para que possamos trazer justiça a essa falha.\n\n\`\`\`\n${e}\n\`\`\``);

    }
  }
};
