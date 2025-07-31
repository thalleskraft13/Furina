const { Client, Collection, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
const { getInfo, ClusterClient } = require("discord-hybrid-sharding");
const fs = require("fs");
const chalk = require("chalk");
require("dotenv").config();

const connectMongo = require("./mongodb/connectMongo");
const GerenciadorSorteios = require("../class/GerenciadorSorteio");
const GerenciadorTarefas = require("../class/GerenciadorTarefas");
const RestMessenger = require("../class/RestMessenger");
const RankAventureiro = require("../class/RankAventureiro");
const Abismo = require("../class/Abismo");
const Banner = require("../class/Banner");
const Exploracao = require("../class/Exploração");
const Conquistas = require("../class/Conquistas");
const GuildaManager = require("../class/guilda");
const Pvp = require("../class/Pvp");
const CustomCollector = require("../class/Collector")

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
Furina.cluster = new ClusterClient(Furina);
Furina.clusterId = Furina.cluster.id;
Furina.clusterName = nomesClusters[Furina.clusterId] || `Cluster-${Furina.clusterId}`;


connectMongo();

Furina.commands = new Collection();
Furina.events = new Collection();
Furina.convitesGuilda = new Collection();

Furina.userdb = require("./mongodb/user");
Furina.serverdb = require("./mongodb/servidores");
Furina.MsgAuto = require("./mongodb/msg");
Furina.guilda = require("./mongodb/guilda");

Furina.website = "https://furina-do-discord.onrender.com";
Furina.bannerAtual = "1.5";
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
Furina.Abismo = new Abismo(Furina);
Furina.Pvp = new Pvp(Furina);
Furina.CustomCollector = new CustomCollector(Furina);
Furina.obterComando = async function (nome) {
  try {
    const comandos = await Furina.application.commands.fetch();
    const comando = comandos.find(cmd => cmd.name === nome);
    return comando ? comando.id : null;
  } catch (err) {
    console.error(`Erro ao obter o comando "${nome}":`, err);
    return null;
  }
};

["event_handler", "slash_handler"].forEach((handler) => {
  require(`./handlers/${handler}`)(Furina);
});

Furina.login(process.env.token);

const canalLogsStatusId = "1398389204421185596"; // novo canal para status e shards


    Furina.on("shardReady", async (shardId) => {
  try {
    const results = await Furina.cluster.broadcastEval(c => c.guilds.cache.size);
    const servidores = results.reduce((prev, val) => prev + val, 0);
    const resultadosUsuarios = await Furina.cluster.broadcastEval(c => c.users.cache.size);
    const usuarios = resultadosUsuarios.reduce((a, b) => a + b, 0);

    
    console.log(
      chalk.hex("#00AEEF")(` Shard ${shardId} iniciada`) +
      chalk.green(` | Servidores: ${servidores} | Usuários (cache): ${usuarios}`)
    );

    const embed = new EmbedBuilder()
      .setTitle("🧩 Shard Iniciada")
      .setColor("#00AEEF")
      .setDescription(`A shard \`${shardId}\` foi iniciada com sucesso.`)
      .addFields(
        { name: "🌐 Servidores", value: String(servidores), inline: true },
        { name: "👥 Usuários (cache)", value: String(usuarios), inline: true },
        { name: "🎭 Cluster", value: `\`${Furina.clusterName}\``, inline: false }
      )
      .setTimestamp();

    await Furina.restMessenger.enviar("1398389204421185596", { embeds: [embed] });
  } catch (error) {
    console.error("Erro ao calcular servidores:", error);
  }
});

  

Furina.once("ready",async() => {
  
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

  async function atualizarStatus() {
    const grupo = statusList[grupoIndex];
    const frase = grupo[Math.floor(Math.random() * grupo.length)];

    await Furina.user.setPresence({
      status: "dnd",
      activities: [{ name: frase, type: 0 }],
    });

    // Log da mudança de status
    try {
      const embed = new EmbedBuilder()
        .setTitle("🔄 Presença Atualizada")
        .setColor("#FFD700")
        .setDescription(`A presença do bot foi atualizada com uma nova mensagem de status.`)
        .addFields(
          { name: "📣 Frase", value: frase, inline: false },
          { name: "🎭 Cluster", value: `\`${Furina.clusterName}\``, inline: true },
          { name: "🧩 Shards", value: `${Furina.shard?.ids?.join(", ") || "Desconhecido"}`, inline: true }
        )
        .setTimestamp();

      await Furina.restMessenger.enviar(canalLogsStatusId, { embeds: [embed] });
    } catch (error) {
      console.error("Erro ao enviar log de status:", error);
    }

    grupoIndex = (grupoIndex + 1) % statusList.length;
  }

  atualizarStatus();
  setInterval(atualizarStatus, 1000 * 60 * 5);
});

Furina.on("guildCreate", async (guild) => {
  try {
    const embed = new EmbedBuilder()
      .setTitle("✨ A Furina do Discord foi adicionada!")
      .setColor("#3DD1D9")
      .setDescription(
        `**Servidor:** ${guild.name} (\`${guild.id}\`)\n` +
        `**Membros:** ${guild.memberCount}\n` +
        `**Cluster:** ${Furina.clusterName}`
      )
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setTimestamp();

    await Furina.restMessenger.enviar("1385561296468054096", { embeds: [embed] });
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

    await Furina.restMessenger.enviar("1385561296468054096", { embeds: [embed] });
  } catch (e) {
    console.error("Erro ao processar guildDelete:", e);
  }
});

module.exports = Furina;
