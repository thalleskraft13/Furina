module.exports = {
    name: 'ready',
    once: true,
    execute(bot) {
        bot.user.setPresence({ activities: [{ name: "Ajudando membros do servidor oficial"}] });
    }
}