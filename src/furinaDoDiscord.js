const { ClusterManager } = require("discord-hybrid-sharding");
require("dotenv").config();
const chalk = require("chalk");

const token = process.env.token;

const furina = {
  info: chalk.hex("#00AEEF").bold,
  cluster: chalk.hex("#7F7FFF").bold,
  warn: chalk.hex("#FFD700").bold,
  error: chalk.hex("#FF4C4C").bold,
  label: chalk.hex("#88CCFF").italic,
};

const clusterNames = ["Juíza das Marés", "Orquestra das Fontes"];

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
}

manager.on("clusterCreate", (cluster) => {
  logClusterHeader(cluster.id);
  console.log(furina.info("  - 🧩 Iniciado"));
  cluster.send({ type: "SET_NAME", name: clusterNames[cluster.id] || `Cluster-${cluster.id}` });
});

// Removido o manager.on("message") para não receber infos do cluster

manager.on("clusterDeath", (cluster) => {
  logClusterHeader(cluster.id);
  console.log(furina.error("  - 💀 Caiu! Reiniciando..."));
  manager.fork(cluster.id);
});

process.on("unhandledRejection", (reason) => {
  console.log(furina.error(`🚨 Unhandled Rejection:\n${reason instanceof Error ? reason.stack : reason}`));
});

process.on("uncaughtException", (err) => {
  console.log(furina.error(`💥 Uncaught Exception:\n${err instanceof Error ? err.stack : err}`));
});

process.on("uncaughtExceptionMonitor", (err) => {
  console.log(furina.warn(`🔍 Monitorando erro:\n${err instanceof Error ? err.stack : err}`));
});

console.log(furina.info("\n✨ Iniciando o espetáculo da Furina...\n"));

manager.spawn({ timeout: -1 });
