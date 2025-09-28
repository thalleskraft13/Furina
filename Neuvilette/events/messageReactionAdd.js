const { user, react } = require("../../Furina/client/mongodb/edenServer");

module.exports = {
    name: 'messageReactionAdd',
    once: false,
    async execute(reaction, userReact, bot) {
        if (!reaction.message.guild || userReact.bot) return;

        // Busca evento de reação no banco
        const reactionData = await react.findOne({ messageId: reaction.message.id });
        if (!reactionData) return;

        // Verifica se expirou
        if (Date.now() > reactionData.expires) return;

        // Verifica se emoji corresponde
        if (reaction.emoji.name !== reactionData.emoji) return;

        // Verifica se usuário já reagiu
        if (reactionData.quemUsou.includes(userReact.id)) return;

        // Adiciona usuário à lista de quem reagiu
        reactionData.quemUsou.push(userReact.id);
        await reactionData.save();

        // Busca ou cria usuário no banco
        let userData = await user.findOne({ userId: userReact.id });
        if (!userData) {
            userData = new user({
                userId: userReact.id,
                reactEvent: { pontos: 0 }
            });
        }

        // Incrementa pontos
        // Define os pontos baseado no emoji
        const pontosEmoji = {
            "🔥": 10,
            "💎": 50,
            "⭐": 30,
            "🍀": 40,
            "🎁": 15
        };

        const pontos = pontosEmoji[reaction.emoji.name] || 0;
        userData.reactEvent.pontos += pontos;
        await userData.save();
    }
};
