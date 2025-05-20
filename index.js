const { Client, Collection, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");
require("dotenv").config();
const RankAventureiro = require("./class/RankAventureiro.js")
const Banner = require("./class/Banner.js")
const Exploração = require("./class/Exploração.js");

const Furina = new Client({
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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
  ],
});


Furina.commands = new Collection();
Furina.events = new Collection();
Furina.userdb = require("./mongodb/user.js")
Furina.RankAventureiro = new RankAventureiro(Furina);
Furina.bannerAtual = "1.0"
Furina.Banner = new Banner(Furina);
Furina.exploracao = new Exploração(Furina);
module.exports = Furina;

Furina.categories =  fs.readdirSync("./Comandos");


["event_handler", "slash_handler"].forEach((handler) => {
  require(`./handlers/${handler}`)(Furina);
});


Furina.login(process.env.token);