// Imports principais
const { Client, Collection, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
const { getInfo, ClusterClient } = require("discord-hybrid-sharding");
const fs = require("fs");
const chalk = require("chalk");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const os = require("os");
const connectMongo = require("./mongodb/connectMongo");

// Conexões e classes internas
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
const ConfigMsgAuto = require("../class/ConfigMsgAuto");
const ConfigAutorole = require("../class/ConfigAutoRole");
const MareDourada = require("../class/ConfigPremium");
const ReactionEvent = require("../class/EventoReacao");

// Configuração do client principal
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

// Nomes dos clusters
const nomesClusters = ["Juíza das Marés", "Orquestra das Fontes"];
Furina.cluster = new ClusterClient(Furina);
Furina.clusterId = Furina.cluster.id;
Furina.clusterName = nomesClusters[Furina.clusterId] || `Cluster-${Furina.clusterId}`;

// Conexão MongoDB
connectMongo();

// Inicialização de collections
Furina.commands = new Collection();
Furina.events = new Collection();
Furina.convitesGuilda = new Collection();

// Bancos de dados locais
Furina.userdb = require("./mongodb/user");
Furina.serverdb = require("./mongodb/servidores");
Furina.MsgAuto = require("./mongodb/msg");
Furina.guilda = require("./mongodb/guilda");

// Configurações gerais
Furina.website = "https://furina-do-discord.onrender.com";
Furina.bannerAtual = "1.7";
Furina.categories = fs.readdirSync("./Furina/client/Comandos");

// Instâncias de classes personalizadas
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
Furina.ReactionEvent = new ReactionEvent(Furina);

// Função para obter comando pelo nome
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

// Função para reportar erros
Furina.reportarErro = async function ({ erro, comando = "?", servidor = null }) {
  const idErro = uuidv4().slice(0, 30);
  const canalErro = "1401501962234757140";

  const stackFormatado = `\`\`\`js\n${erro.stack || erro.message || String(erro)}\n\`\`\``;

  const embed = new EmbedBuilder()
    .setTitle("❌ Erro Detectado")
    .setDescription("Um erro ocorreu durante a execução de um comando.")
    .addFields(
      { name: "🆔 ID do Erro", value: `\`${idErro}\`` },
      { name: "📘 Comando", value: `\`${comando || "Desconhecido"}\`` },
      {
        name: "🌐 Servidor",
        value: servidor ? `\`${servidor.name}\` (ID: ${servidor.id})` : "*Não informado*",
      },
      { name: "✨️ Cluster", value: `${Furina.clusterName}` },
      {
        name: "📝 Erro",
        value: stackFormatado.length > 1024 ? stackFormatado.slice(0, 1020) + "...\n```" : stackFormatado,
      }
    )
    .setColor("#FF5555")
    .setTimestamp();

  try {
    await Furina.restMessenger.enviar(canalErro, { content: `🔧 Relatório automático de erro \`#${idErro}\``, embeds: [embed.toJSON()] });
  } catch (err) {
    console.error("[Relatório de Erro] Falha ao enviar relatório via REST:", err);
  }

  return idErro;
};

// Carregar handlers
["event_handler", "slash_handler"].forEach(handler => require(`./handlers/${handler}`)(Furina));

// Login do bot
Furina.login(process.env.token);

// Canal para logs de status e shards
const canalLogsStatusId = "1398389204421185596";

// ------------------- SHARDREADY COM ATUALIZAÇÃO POR SHARD -------------------

Furina.on("shardReady", async (shardId) => {
  const pathStatus = "./Furina/status.json";

  async function atualizarStatus() {
    try {
      // Dados simples usando Furina diretamente
      const servidores = Furina.guilds.cache.size;
      const usuarios = Furina.users.cache.size;
      const canais = Furina.channels.cache.size;
      const eventos = Furina.events.size;
      const ping = Furina.ws.ping;
      const memoriaUsoMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const memoriaTotalMB = (require("os").totalmem() / 1024 / 1024).toFixed(2);
      const uptime = Furina.uptime;
      const cpu = process.cpuUsage();

      // Informações do sistema
      const os = require("os");
      const sistema = {
        tipo: os.type(),
        arquitetura: os.arch(),
        plataforma: os.platform(),
        uptimeSegundos: os.uptime()
      };

      // Versões
      const versoes = {
        node: process.version,
        discordJs: require("discord.js").version,
        furina: "1.7"
      };

      // Lê status.json atual
      let statusJson = {};
      if (fs.existsSync(pathStatus)) {
        statusJson = JSON.parse(fs.readFileSync(pathStatus, "utf-8"));
      }

      // Atualiza apenas a entrada desta shard
      statusJson[shardId] = {
        shard: shardId,
        cluster: Furina.clusterName,
        cluster_id: Furina.clusterId,
        status: "Online",
        ping: `${ping}ms`,
        memoria: `${memoriaUsoMB}MB / ${memoriaTotalMB}MB`,
        servidores,
        usuarios,
        canais,
        eventos,
        uptime: `${(uptime / 1000 / 60).toFixed(2)} min`,
        cpu: {
          user: cpu.user,
          system: cpu.system,
          percent: ((cpu.user + cpu.system) / 1000000).toFixed(2) + '%'
        },
        versoes,
        sistema,
        iniciouEm: new Date().toISOString(),
        ultimoUpdate: new Date().toISOString()
      };

      fs.writeFileSync(pathStatus, JSON.stringify(statusJson, null, 2));
      //console.log(chalk.blue(`[STATUS] Shard ${shardId} atualizada.`));

    } catch (err) {
      console.error(`[STATUS] Erro na shard ${shardId}:`, err);
    }
  }

  // Atualiza imediatamente ao iniciar
  await atualizarStatus();

  // Atualiza a cada 1 minuto
  setInterval(atualizarStatus, 60 * 1000);
});



// ------------------- READY E STATUS DINÂMICO -------------------
Furina.once("ready", async () => {
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

  async function atualizarStatusBot() {
    const grupo = statusList[grupoIndex];
    const frase = grupo[Math.floor(Math.random() * grupo.length)];

    await Furina.user.setPresence({
      status: "dnd",
      activities: [{ name: frase, type: 0 }],
    });

    grupoIndex = (grupoIndex + 1) % statusList.length;
  }

  atualizarStatusBot();
  setInterval(atualizarStatusBot, 1000 * 60 * 5);
});

// ------------------- EVENTOS DE GUILDA -------------------
Furina.on("guildCreate", async (guild) => {
  try {
    const embed = new EmbedBuilder()
      .setTitle("✨ A Furina do Discord foi adicionada!")
      .setColor("#3DD1D9")
      .setDescription(`**Servidor:** ${guild.name} (\`${guild.id}\`)\n**Membros:** ${guild.memberCount}\n**Cluster:** ${Furina.clusterName}`)
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

// Exporta client
module.exports = Furina;
