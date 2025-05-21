const { EmbedBuilder,  AttachmentBuilder } = require("discord.js");

module.exports = {
  name: "elemental",
  description: "A justiça será lançada com fúria elemental! Escolha seu alvo — e que os céus decidam o resto!",
  type: 1,
  options: [{
    name: "usuário",
    description: 'Insira o ID ou mencione o usuário',
    type: 6,
    required: true
  }],

  run: async(Furina, interaction) => {

    let user = interaction.options.getUser("usuário");
    if (interaction.user === user){
      return await interaction.editReply({
        content: `Autoataque? Que desperdício de energia… Cuide melhor de si mesmo antes de querer julgar os outros.`
      })
    } else if (user.id === Furina.user.id){

      let embed = new EmbedBuilder()
      .setDescription(`Insistir em desafiar ${interaction.user}? Prepare-se, pois a justiça não tolera afrontas!`)
      .setColor("#3A86FF")
      .setImage("attachment://Furina.gif")


      let gif = new AttachmentBuilder("img/gif/Furina.gif");

      return await interaction.editReply({
        embeds: [embed],
        files: [gif]
      })      
    } else {


    const ataquesUltimates = [
  {
    personagem: "Diluc",
    ataque: `${interaction.user} invoca as chamas da fúria com Templário Carmesim, incinerando ${user} em um mar de fogo!`,
    cor: "#FF4C29"
  },
  {
    personagem: "Diluc",
    ataque: `O poder de Templário Carmesim explode! ${interaction.user} queima ${user} com chamas devastadoras!`,
    cor: "#FF4C29"
  },
  {
    personagem: "Furina",
    ataque: `${interaction.user} convoca a Justiça Implacável, inundando ${user} com a força da Hydro divina!`,
    cor: "#3A86FF"
  },
  {
    personagem: "Furina",
    ataque: `A maré da sentença de ${interaction.user} rompe, submergindo ${user} na fúria do Arconte Hydro!`,
    cor: "#3A86FF"
  },
  {
    personagem: "Qiqi",
    ataque: `${interaction.user} libera Presença Preservadora, envolvendo ${user} numa névoa que cura e pune!`,
    cor: "#A7C7E7" 
  },
  {
    personagem: "Qiqi",
    ataque: `${user} sente o toque gélido da Presença Preservadora invocada por ${interaction.user}, um julgamento frio e implacável!`,
    cor: "#A7C7E7"
  },
  {
    personagem: "Jean",
    ataque: `${interaction.user} convoca a Tempestade do Norte, varrendo ${user} com o furacão da justiça!`,
    cor: "#C1A56F"
  },
  {
    personagem: "Jean",
    ataque: `O vento de Jean sopra com força total! ${interaction.user} arrasta ${user} para longe com a Tempestade do Norte!`,
    cor: "#C1A56F"
  },
  {
    personagem: "Mona",
    ataque: `${interaction.user} ativa Dilúvio Astral, prendendo ${user} numa ilusão esmagadora!`,
    cor: "#6C63FF"
  },
  {
    personagem: "Mona",
    ataque: `Sob o poder do Dilúvio Astral de ${interaction.user}, ${user} é envolvido numa armadilha líquida inescapável!`,
    cor: "#6C63FF"
  },
  {
    personagem: "Keqing",
    ataque: `${interaction.user} invoca Estrela Cadente, lançando relâmpagos que fulminam ${user}!`,
    cor: "#C7DFFF"
  },
  {
    personagem: "Keqing",
    ataque: `Com Estrela Cadente, ${interaction.user} rasga o céu e desfere um ataque elétrico fatal contra ${user}!`,
    cor: "#C7DFFF"
  }
];



  const index = Math.floor(Math.random() * ataquesUltimates.length);

    
  let atq = ataquesUltimates[index];

      let gif = new AttachmentBuilder(`img/gif/${atq.personagem}.gif`);

      let embed = new EmbedBuilder()
      .setDescription(`${atq.ataque}`)
      .setColor(`${atq.cor}`)
      .setImage(`attachment://${atq.personagem}.gif`)

      return await interaction.editReply({
        embeds: [embed],
        files: [gif]
      })

    }
  }
}