module.exports = {
    config: {
        name: 'ping',
        description: 'Obtenha meu ping atual',
        usage: `f-ping`,
    },
    async run (bot,message,args) {

        message.reply({
            content: `Pong! ${bot.ws.ping}ms`
        })
    }
}