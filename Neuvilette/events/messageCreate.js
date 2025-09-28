const { user, react } = require("../../Furina/client/mongodb/edenServer");
const { Collection } = require("discord.js");

let messageCount = 0;
let interval = Math.floor(Math.random() * 40) + 1; // spawn aleatório
let activeReactions = new Collection();

const reactionRewards = {
    "🔥": 10,
    "💎": 50,
    "⭐": 30,
    "🍀": 40,
    "🎁": 15
};

// Função de sorteio ponderado inverso
function weightedRandomInverse(weights) {
    // Soma total dos pesos invertidos
    const entries = Object.entries(weights);
    const inverted = entries.map(([key, value]) => [key, 1 / value]); // inverso do ponto
    const total = inverted.reduce((sum, [, w]) => sum + w, 0);
    let rand = Math.random() * total;
    for (const [key, w] of inverted) {
        if (rand < w) return key;
        rand -= w;
    }
    return entries[0][0]; // fallback
}

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message, bot) {
        if (!message.guild || message.author.bot) return;

        messageCount++;

        if (messageCount >= interval) {
            messageCount = 0;

            // Escolhe emoji baseado nos pontos (mais pontos = mais raro)
            const chosenEmoji = weightedRandomInverse(reactionRewards);

            try {
                await message.react(chosenEmoji);
            } catch (err) {
                console.error("Erro ao reagir:", err);
                return;
            }

            // Salva no banco
            const newReact = new react({
                messageId: message.id,
                emoji: chosenEmoji,
                expires: Date.now() + 60 * 1000, // expira em 1 minuto
                quemUsou: []
            });

            await newReact.save();
            activeReactions.set(message.id, newReact);

            // Próximo spawn aleatório
            interval = Math.floor(Math.random() * 40) + 1;
        }
    }
};
