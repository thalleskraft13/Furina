const { token } = require("./config.js");
const fs = require("fs");
const { Client, Collection, GatewayIntentBits, Partials, REST, Routes } = require('discord.js');
const connectMongo = require("../Furina/client/mongodb/connectMongo");
const path = require("path")
class Neuvilette {
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
        this.bot.slashCommandsData = []; // para registrar no Discord
    }

    loadCommands() {
        const commandFiles = fs.readdirSync('./Neuvilette/commands/').filter(f => f.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            this.bot.commands.set(command.config.name, command);
            this.bot.slashCommandsData.push(command.config); // salva os dados para registro
        }

        const commandSubFolders = fs.readdirSync('./Neuvilette/commands/').filter(f => !f.endsWith('.js'));
        commandSubFolders.forEach(folder => {
            const subFiles = fs.readdirSync(`./Neuvilette/commands/${folder}/`).filter(f => f.endsWith('.js'));
            for (const file of subFiles) {
                const command = require(`./commands/${folder}/${file}`);
                this.bot.commands.set(command.config.name, command);
                this.bot.slashCommandsData.push(command.config);
            }
        });
    }

    loadEvents() {
    const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(f => f.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(__dirname, 'events', file));
        if (!event.name || !event.execute) {
            console.warn(`Arquivo de evento inválido: ${file}`);
            continue;
        }
        if (event.once) {
            this.bot.once(event.name, (...args) => event.execute(...args, this.bot));
        } else {
            this.bot.on(event.name, (...args) => event.execute(...args, this.bot));
        }
        console.log(`Evento carregado: ${event.name}`);
    }
    }

    async registerSlashCommands() {
        const rest = new REST({ version: '10' }).setToken(token);

        try {
           // console.log('Iniciando registro de slash commands...');
            await rest.put(
                Routes.applicationCommands(this.bot.user.id),
                { body: this.bot.slashCommandsData },
            );
            //console.log('Slash commands registrados com sucesso!');
        } catch (error) {
            console.error(error);
        }
    }

    handleInteractions() {
        this.bot.on('interactionCreate', async interaction => {
            if (!interaction.isChatInputCommand()) return;

            const command = this.bot.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.run(this.bot, interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Ocorreu um erro ao executar o comando!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Ocorreu um erro ao executar o comando!', ephemeral: true });
                }
            }
        });
    }

    async start() {
        this.loadCommands();
        this.loadEvents();
        this.handleInteractions();

        this.bot.once('ready', async () => {
            await this.registerSlashCommands();
        });

        await connectMongo();
        this.bot.login(token);
    }
}

module.exports = Neuvilette;