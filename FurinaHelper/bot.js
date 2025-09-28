const { prefix, token } = require("./config.js");
const fs = require("fs");
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const connectMongo = require("../Furina/client/mongodb/connectMongo");

class FurinaHelper {
    constructor() {
        this.bot = new Client({
            partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.ThreadMember,
  ],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
  ],
        });

        this.bot.commands = new Collection();
    }

    loadCommands() {
        const commandFiles = fs.readdirSync('./FurinaHelper/commands/').filter(f => f.endsWith('.js'));
        for (const file of commandFiles) {
            const props = require(`./commands/${file}`);
            
            this.bot.commands.set(props.config.name, props);
        }

        const commandSubFolders = fs.readdirSync('./FurinaHelper/commands/').filter(f => !f.endsWith('.js'));
        commandSubFolders.forEach(folder => {
            const subFiles = fs.readdirSync(`./FurinaHelper/commands/${folder}/`).filter(f => f.endsWith('.js'));
            for (const file of subFiles) {
                const props = require(`./commands/${folder}/${file}`);
                
                this.bot.commands.set(props.config.name, props);
            }
        });
    }

    loadEvents() {
        const eventFiles = fs.readdirSync('./FurinaHelper/events/').filter(f => f.endsWith('.js'));
        for (const file of eventFiles) {
            const event = require(`./events/${file}`);
            if (event.once) {
                this.bot.once(event.name, (...args) => event.execute(...args, this.bot));
            } else {
                this.bot.on(event.name, (...args) => event.execute(...args, this.bot));
            }
        }
    }

    handleMessages() {
        this.bot.on("messageCreate", async message => {
            if (message.author.bot) return;
            if (message.channel.type === "dm") return;

            const messageArray = message.content.split(" ");
            const cmd = messageArray[0];
            const args = messageArray.slice(1);

            if (!cmd.startsWith(prefix)) return;

            const commandFile = this.bot.commands.get(cmd.slice(prefix.length));
            if (commandFile) commandFile.run(this.bot, message, args);
        });
    }

   async start() {
        this.loadCommands();
        this.loadEvents();
        this.handleMessages();
        this.bot.login(token);
        await connectMongo();
   }
}

module.exports = FurinaHelper;