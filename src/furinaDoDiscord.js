const { ClusterManager } = require("discord-hybrid-sharding");
require("dotenv").config();
const chalk = require("chalk");
const RestMessenger = require("./class/RestMessenger");
const token = process.env.token;

const furina = {
  info: chalk.hex("#00AEEF").bold,
  cluster: chalk.hex("#7F7FFF").bold,
  warn: chalk.hex("#FFD700").bold,
  error: chalk.hex("#FF4C4C").bold,
  label: chalk.hex("#88CCFF").italic,
};

const clusterNames = ["Juíza das Marés", "Orquestra das Fontes"];
const LOG_CHANNEL = "1398389204421185596"; // Canal de logs

const restMessenger = new RestMessenger(token);

const manager = new ClusterManager(`${__dirname}/client/index.js`, {
  totalShards: 2,
  totalClusters: 2,
  shardsPerClusters: 1,
  mode: "process",
  token,
});

function logClusterHeader(clusterId) {
  const name = clusterNames[clusterId] || `Cluster-${clusterId}`;
  console.log(`\n\n[${new Date().toLocaleTimeString()}]`);
  console.log(furina.cluster(`Cluster ${clusterId + 1} iniciado como "${name}"`));
  return name;
}

manager.on("clusterCreate", (cluster) => {
  const name = logClusterHeader(cluster.id);
  console.log(furina.info("  - 🧩 Iniciado"));

  cluster.send({ type: "SET_NAME", name });

  restMessenger.enviar(LOG_CHANNEL, {
    embeds: [{
      title: "🧩 Cluster Iniciado",
      color: 0x00aaff,
      description: `O cluster **${name}** (ID ${cluster.id}) foi iniciado com sucesso.`,
      timestamp: new Date().toISOString()
    }]
  });
});

manager.on("clusterDeath", (cluster) => {
  const name = clusterNames[cluster.id] || `Cluster-${cluster.id}`;
  console.log(furina.error(`\n[${new Date().toLocaleTimeString()}] Cluster ${name} caiu! Reiniciando...`));

  restMessenger.enviar(LOG_CHANNEL, {
    embeds: [{
      title: "💀 Cluster Caiu",
      color: 0xff5555,
      description: `O cluster **${name}** (ID ${cluster.id}) caiu inesperadamente. Tentando reiniciar...`,
      timestamp: new Date().toISOString()
    }]
  });

  manager.fork(cluster.id);
});

// LOGS DE ERROS GLOBAIS

process.on("unhandledRejection", (reason) => {
  const msg = reason instanceof Error ? reason.stack : String(reason);
  console.log(furina.error(`🚨 Unhandled Rejection:\n${msg}`));

  restMessenger.enviar(LOG_CHANNEL, {
    embeds: [{
      title: "🚨 Unhandled Rejection",
      color: 0xffcc00,
      description: `\`\`\`js\n${msg.slice(0, 1900)}\n\`\`\``,
      timestamp: new Date().toISOString()
    }]
  });
});

process.on("uncaughtException", (err) => {
  const msg = err instanceof Error ? err.stack : String(err);
  console.log(furina.error(`💥 Uncaught Exception:\n${msg}`));

  restMessenger.enviar(LOG_CHANNEL, {
    embeds: [{
      title: "💥 Uncaught Exception",
      color: 0xff0000,
      description: `\`\`\`js\n${msg.slice(0, 1900)}\n\`\`\``,
      timestamp: new Date().toISOString()
    }]
  });
});

process.on("uncaughtExceptionMonitor", (err) => {
  const msg = err instanceof Error ? err.stack : String(err);
  console.log(furina.warn(`🔍 Monitorando erro:\n${msg}`));

  restMessenger.enviar(LOG_CHANNEL, {
    embeds: [{
      title: "🔍 Monitoramento de Erro",
      color: 0xffff00,
      description: `\`\`\`js\n${msg.slice(0, 1900)}\n\`\`\``,
      timestamp: new Date().toISOString()
    }]
  });
});

// Início
console.log(furina.info("\n✨ Iniciando o espetáculo da Furina...\n"));
manager.spawn({ timeout: -1 });
