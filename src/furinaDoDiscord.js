const { ClusterManager } = require('discord-hybrid-sharding');
require("dotenv").config()
const { token } = process.env;
const chalk = require('chalk');

const furina = {
  info: chalk.hex('#00AEEF').bold,
  cluster: chalk.hex('#7F7FFF').bold,
  warn: chalk.hex('#FFD700').bold,
  error: chalk.hex('#FF4C4C').bold,
  label: chalk.hex('#88CCFF').italic,
};

const clusterNames = ['Juíza das Marés', 'Orquestra das Fontes'];

const manager = new ClusterManager(`${__dirname}/client/index.js`, {
  totalShards: 2,
  totalClusters: 2,
  shardsPerClusters: 1,
  mode: 'process',
  token,
});

manager.on('clusterCreate', async (cluster) => {
  const name = clusterNames[cluster.id] || `Cluster-${cluster.id}`;
  cluster.send({ type: 'SET_NAME', name });

  try {
    // Pede stats do cluster com timeout de 5s
    const stats = await cluster.request({ type: 'GET_STATS' }, 5000);
    const guildCount = stats.guildCount ?? 0;
    const userCount = stats.userCount ?? 0;

    console.log(
      furina.cluster(`🧩 Cluster ${cluster.id} iniciado como `) +
        furina.label(`"${name}"`) +
        furina.info(` — Servidores: ${guildCount} | Usuários: ${userCount}`)
    );
  } catch (err) {
    console.log(
      furina.cluster(`🧩 Cluster ${cluster.id} iniciado como `) +
        furina.label(`"${name}"`) +
        furina.warn(` — Servidores e usuários: dados indisponíveis`)
    );
  }
});

manager.on('clusterDeath', (cluster) => {
  console.log(
    furina.error(`💀 O Cluster ${cluster.id} caiu! `) + furina.warn('Reiniciando...')
  );
  manager.fork(cluster.id);
});

process.on('unhandledRejection', (reason) => {
  console.log(furina.error('🚨 Unhandled Rejection:\n') + furina.label(reason));
});

process.on('uncaughtException', (err) => {
  console.log(furina.error('💥 Uncaught Exception:\n') + furina.label(err));
});

process.on('uncaughtExceptionMonitor', (err) => {
  console.log(furina.warn('🔍 Monitorando erro:\n') + furina.label(err));
});

console.log(furina.info('\n✨ Iniciando o espetáculo da Furina...\n'));
manager.spawn({ timeout: -1 });