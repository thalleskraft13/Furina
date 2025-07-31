module.exports = {
  name: "configuração",
  type: 1,
  description: "Toque-me com suas preferências e revele meu verdadeiro esplendor~!",

  run: async(client, interaction)=> {

    await interaction.deferReply({ ephemeral: true })
    try {
      return interaction.editReply({
        content: `Desativado até a próxima atualização...`
      })
    } catch (e) {
      console.log(e)

      return interaction.editReply(`❌ Oh là là! Algo deu errado ao executar o comando.  
Por favor, reporte ao servidor de suporte para que possamos trazer justiça a essa falha.\n\n\`\`\`\n${e}\n\`\`\``)
    }
  }
}