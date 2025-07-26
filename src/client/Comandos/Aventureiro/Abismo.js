module.exports = {
  name: "abismo",
  description: "Inicia uma batalha no Abismo com sua equipe.",
  dmPermission: false,
  type: 1, // 1 = chat input (slash command)
  options: [],

  run: async (client, interaction) => {
  
    try {
      if (!client.Abismo || typeof client.Abismo.comando !== "function") {
        return interaction.editReply("❌ O sistema do Abismo não está carregado corretamente.");
      }

      await interaction.editReply("Abismo ainda em desenvolvimento....")      // Chama o método de batalha direto da class
      //await client.Abismo.comando(interaction);
    } catch (err) {
      console.error("Erro ao executar o comando Abismo:", err);
      await interaction.editReply("❌ Ocorreu um erro durante a execução da batalha.");
    }
  },
};
