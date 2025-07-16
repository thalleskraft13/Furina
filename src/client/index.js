const { Client, Collection, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
const { getInfo, ClusterClient} = require("discord-hybrid-sharding");
const fs = require("fs");
const chalk = require("chalk");
require("dotenv").config();

const connectMongo = require("./mongodb/connectMongo");
const GerenciadorSorteios = require("../class/GerenciadorSorteio");
const GerenciadorTarefas = require("../class/GerenciadorTarefas");
const RestMessenger = require("../class/RestMessenger");
const RankAventureiro = require("../class/RankAventureiro");
const Banner = require("../class/Banner");
const Exploracao = require("../class/Exploração");
const Conquistas = require("../class/Conquistas");
const GuildaManager = require("../class/guilda")

const Furina = new Client({
  shards: getInfo().SHARD_LIST,
  shardCount: getInfo().TOTAL_SHARDS,
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

const nomesClusters = ["Juíza das Marés", "Orquestra das Fontes"];
Furina.clusterId = getInfo().CLUSTER_ID || 0;
Furina.clusterName = nomesClusters[Furina.clusterId] || `Cluster-${Furina.clusterId}`;
Furina.cluster = new ClusterClient(Furina);

connectMongo();

Furina.commands = new Collection();
Furina.events = new Collection();
Furina.convitesGuilda = new Collection();

Furina.userdb = require("./mongodb/user");
Furina.serverdb = require("./mongodb/servidores");
Furina.MsgAuto = require("./mongodb/msg");
Furina.guilda = require("./mongodb/guilda")

Furina.website = "https://furina-do-discord.onrender.com";
Furina.bannerAtual = "1.3";
Furina.categories = fs.readdirSync("./src/client/Comandos");

Furina.RankAventureiro = new RankAventureiro(Furina);
Furina.Banner = new Banner(Furina);
Furina.exploracao = new Exploracao(Furina);
Furina.GerenciadorTarefas = new GerenciadorTarefas(Furina);
Furina.GerenciadorSorteio = new GerenciadorSorteios(Furina, Furina.GerenciadorTarefas);
Furina.restMessenger = new RestMessenger(process.env.token);
Furina.conquistas = new Conquistas(Furina);
Furina.GuildaManager = new GuildaManager(Furina);
Furina.conquistasJson = require("../class/data/conquistas.js");

["event_handler", "slash_handler"].forEach((handler) => {
  require(`./handlers/${handler}`)(Furina);
});

Furina.login(process.env.token);

Furina.on("shardReady", (shardId) => {
  console.log(
      chalk.hex("#00AEEF")(` Shard ${shardId} iniciada`) +
      chalk.green(
        ` | Servidores: ${Furina.guilds.cache.size} | Usuários (cache): ${Furina.users.cache.size}`
      )
  );
});

Furina.once("ready", () => {
  const statusList = [
    [
      "O julgamento está prestes a começar~",
      "As marés dançam ao meu favor~",
      "A plateia está em silêncio, aguardando o espetáculo~",
      "A justiça será encenada com perfeição!",
      "Quem ousa interromper minha performance?",
      "Cada palavra minha é poesia... e sentença~",
    ],
    [
      "Entre drama e destino, eu escolho os dois!",
      "Você é o próximo a subir no palco do julgamento~",
      "Culpado ou inocente? Que dilema encantador!",
      "Os aplausos não mentem, mon cher~",
      "Minha voz é lei, meu gesto é arte~",
      "O palco está armado, e eu sou a estrela~",
    ],
  ];

  let grupoIndex = Furina.clusterId;

  function atualizarStatus() {
    const grupo = statusList[grupoIndex];
    const frase = grupo[Math.floor(Math.random() * grupo.length)];

    Furina.user.setPresence({
      status: "dnd",
      activities: [{ name: frase, type: 0 }],
    });

    grupoIndex = (grupoIndex + 1) % statusList.length;
  }

  atualizarStatus();
  setInterval(atualizarStatus, 1000 * 60 * 5);
});

const canalLogsId = "1385561296468054096";

Furina.on("guildCreate", async (guild) => {
  try {
    const embed = new EmbedBuilder()
      .setTitle("✨ A Furina do Discord foi adicionada!")
      .setColor("#3DD1D9")
      .setDescription(
        `**Servidor:** ${guild.name} (\`${guild.id}\`)\n**Membros:** ${guild.memberCount}`
      )
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setTimestamp();

    await Furina.restMessenger.enviar(canalLogsId, { embeds: [embed] });
  } catch (e) {
    console.error("Erro ao processar guildCreate:", e);
  }
});

Furina.on("guildDelete", async (guild) => {
  try {
    const embed = new EmbedBuilder()
      .setTitle("💔 A Furina do Discord foi removida!")
      .setColor("#ff4c4c")
      .setDescription(`**Servidor:** ${guild.name} (\`${guild.id}\`)`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setTimestamp();

    await Furina.restMessenger.enviar(canalLogsId, { embeds: [embed] });
  } catch (e) {
    console.error("Erro ao processar guildDelete:", e);
  }
});

module.exports = Furina;
