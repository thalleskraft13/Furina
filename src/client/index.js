const { Client, Collection, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
const { getInfo, ClusterClient } = require("discord-hybrid-sharding");
const fs = require("fs");
const chalk = require("chalk");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");


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
const CustomCollector = require("../class/Collector");
const ConfigMsgAuto = require("../class/ConfigMsgAuto")
const ConfigAutorole = require("../class/ConfigAutoRole")
const MareDourada = require("../class/ConfigPremium")
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
Furina.bannerAtual = "1.6";
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
Furina.ConfigMsgAuto = new ConfigMsgAuto(Furina);
Furina.ConfigAutorole = new ConfigAutorole(Furina);
Furina.MareDourada = new MareDourada(Furina);
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

Furina.reportarErro = async function ({
  erro,
  comando = "?",
  servidor = null,
}) {
  const idErro = uuidv4().slice(0, 30); // ID curto e único
  const canalErro = "1401501962234757140";

  const stackFormatado = `\`\`\`js\n${erro.stack || erro.message || String(erro)}\n\`\`\``;

  const embed = new EmbedBuilder()
    .setTitle("❌ Erro Detectado")
    .setDescription(`Um erro ocorreu durante a execução de um comando.`)
    .addFields(
      { name: "🆔 ID do Erro", value: `\`${idErro}\`` },
      { name: "📘 Comando", value: `\`${comando || "Desconhecido"}\`` },
      {
        name: "🌐 Servidor",
        value: servidor
          ? `\`${servidor.name}\` (ID: ${servidor.id})`
          : "*Não informado*",
      },
      {
        name: "✨️ Cluster",
        value: `${Furina.clusterName}`
      },
      {
        name: "📝 Erro",
        value: stackFormatado.length > 1024
          ? stackFormatado.slice(0, 1020) + "...\n```"
          : stackFormatado,
      }
    )
    .setColor("#FF5555")
    .setTimestamp();


  try {
    await Furina.restMessenger.enviar(canalErro, {
      content: `🔧 Relatório automático de erro \`#${idErro}\``,
      embeds: [embed.toJSON()],
    });
  } catch (err) {
    console.error("[Relatório de Erro] Falha ao enviar relatório via REST:", err);
  }

  return idErro;
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
