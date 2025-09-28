module.exports = {
    config: {
        name: 'ping',
        description: 'Responde com Pong! e mostra o tempo de resposta',
        options: [],
    },

    run: async (bot, interaction) => {
        const sent = await interaction.reply({ content: '🏓 Ping?', fetchReply: true });
        const latency = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`🏓 Pong! Latência: ${latency}ms`);
    }
};
