module.exports = {
  name: "configuração",
  type: 1,
  description: "Toque-me com suas preferências e revele meu verdadeiro esplendor~!",

  run: async(client, interaction)=> {

    try {
      return interaction.editReply({
        content: `Ajuste cada detalhe da minha perfeição em meu grandioso palco digital: ${client.website}/dashboard/${interaction.guild.id}`
      })
    } catch (e) {
      console.log(e)

      return interaction.editReply(`❌ Oh là là! Algo deu errado ao executar o comando.  
Por favor, reporte ao servidor de suporte para que possamos trazer justiça a essa falha.\n\n\`\`\`\n${e}\n\`\`\``)
    }
  }
}