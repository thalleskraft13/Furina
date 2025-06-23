const { Client, Collection, GatewayIntentBits, Partials, EmbedBuilder } = require("discord.js");
const { ClusterClient, getInfo } = require("discord-hybrid-sharding");
const fs = require("fs");
require("dotenv").config();
const chalk = require("chalk");
const connectMongo = require("./mongodb/connectMongo");

const RankAventureiro = require("../class/RankAventureiro.js");
const Banner = require("../class/Banner.js");
const Exploração = require("../class/Exploração.js");

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
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildPresences,
  ],
});

Furina.cluster = new ClusterClient(Furina);
Furina.clusterName = `Cluster-${Furina.cluster.id}`;
let nomes = ["Juíza das Marés", "Orquestra das Fontes"]
Furina.clusterName = nomes[Furina.cluster.id];

// Recebe nome do cluster do processo pai
process.on("message", (msg) => {
  if (msg.type === "SET_NAME") Furina.clusterName = nomes[Furina.cluster.id];
});

// Conectar ao MongoDB
connectMongo();

// Estrutura
Furina.commands = new Collection();
Furina.events = new Collection();
Furina.userdb = require("./mongodb/user.js");
Furina.serverdb = require("./mongodb/servidores.js");
Furina.MsgAuto = require("./mongodb/msg.js");
Furina.website = "https://furina-do-discord.onrender.com";
Furina.RankAventureiro = new RankAventureiro(Furina);
Furina.bannerAtual = "1.0";
Furina.Banner = new Banner(Furina);
Furina.exploracao = new Exploração(Furina);
Furina.categories = fs.readdirSync("./src/client/Comandos");

// Quando o bot estiver pronto
Furina.once("ready", () => {
  const shardId = Furina.shard?.ids?.[0] ?? 0;
  const guilds = Furina.guilds.cache;
  const userSet = new Set();

  for (const guild of guilds.values()) {
    guild.members.cache.forEach((member) => userSet.add(member.user.id));
  }

  const totalUsers = userSet.size;
  const totalGuilds = guilds.size;

  console.log(
    chalk.hex("#7F7FFF")(`🧩 ${Furina.clusterName}`) +
    chalk.hex("#00AEEF")(` | Shard ${shardId} | `) +
    chalk.green(`Servidores: ${totalGuilds} | Usuários únicos: ${totalUsers}`)
  );
});

// Login + carregamento dos handlers e eventos manuais
Furina.login(process.env.token).then(() => {
  // 🔹 Handlers (slash + eventos automáticos)
  ["event_handler", "slash_handler"].forEach((handler) => {
    require(`./handlers/${handler}`)(Furina);
  });

  // 🔹 Eventos diretos de entrada/saída de servidores
  const canalLogsId = "1385561296468054096";

  Furina.on("guildCreate", async (guild) => {
    try {
      const canal = await Furina.channels.fetch(canalLogsId).catch(() => null);
      if (!canal) return;

      const embed = new EmbedBuilder()
        .setTitle("✨ A Furina do Discord foi adicionada!")
        .setColor("#3DD1D9")
        .setDescription(`**Servidor:** ${guild.name} (\`${guild.id}\`)\n**Membros:** ${guild.memberCount}`)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setTimestamp();

      canal.send({ embeds: [embed] });
    } catch (e) {
      console.error("Erro ao processar guildCreate:", e);
    }
  });

  Furina.on("guildDelete", async (guild) => {
    try {
      const canal = await Furina.channels.fetch(canalLogsId).catch(() => null);
      if (!canal) return;

      const embed = new EmbedBuilder()
        .setTitle("💔 A Furina do Discord foi removida!")
        .setColor("#ff4c4c")
        .setDescription(`**Servidor:** ${guild.name} (\`${guild.id}\`)`)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setTimestamp();

      canal.send({ embeds: [embed] });
    } catch (e) {
      console.error("Erro ao processar guildDelete:", e);
    }
  });
});

module.exports = Furina;
