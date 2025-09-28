const { ClusterManager } = require("discord-hybrid-sharding");
require("dotenv").config();
const chalk = require("chalk");
const RestMessenger = require("./class/RestMessenger");

class FurinaApplication {
  constructor() {
    this.token = process.env.token;
    this.LOG_CHANNEL = "1398389204421185596"; // Canal de logs
    this.clusterNames = ["Juíza das Marés", "Orquestra das Fontes"];

    this.furina = {
      info: chalk.hex("#00AEEF").bold,
      cluster: chalk.hex("#7F7FFF").bold,
      warn: chalk.hex("#FFD700").bold,
      error: chalk.hex("#FF4C4C").bold,
      label: chalk.hex("#88CCFF").italic,
    };

    this.restMessenger = new RestMessenger(this.token);

    this.manager = new ClusterManager(`${__dirname}/client/index.js`, {
      totalShards: 2,
      totalClusters: 2,
      shardsPerClusters: 1,
      mode: "process",
      token: this.token,
    });
  }

  logClusterHeader(clusterId) {
    const name = this.clusterNames[clusterId] || `Cluster-${clusterId}`;
    console.log(`\n\n[${new Date().toLocaleTimeString()}]`);
    console.log(this.furina.cluster(`Cluster ${clusterId + 1} iniciado como "${name}"`));
    return name;
  }

  setupClusterEvents() {
    this.manager.on("clusterCreate", (cluster) => {
      const name = this.logClusterHeader(cluster.id);
      console.log(this.furina.info("  - 🧩 Iniciado"));

      cluster.send({ type: "SET_NAME", name });

      this.restMessenger.enviar(this.LOG_CHANNEL, {
        embeds: [{
          title: "🧩 Cluster Iniciado",
          color: 0x00aaff,
          description: `O cluster **${name}** (ID ${cluster.id}) foi iniciado com sucesso.`,
          timestamp: new Date().toISOString(),
        }],
      });
    });

    this.manager.on("clusterDeath", (cluster) => {
      const name = this.clusterNames[cluster.id] || `Cluster-${cluster.id}`;
      console.log(this.furina.error(`\n[${new Date().toLocaleTimeString()}] Cluster ${name} caiu! Reiniciando...`));

      this.restMessenger.enviar(this.LOG_CHANNEL, {
        embeds: [{
          title: "💀 Cluster Caiu",
          color: 0xff5555,
          description: `O cluster **${name}** (ID ${cluster.id}) caiu inesperadamente. Tentando reiniciar...`,
          timestamp: new Date().toISOString(),
        }],
      });

      this.manager.fork(cluster.id);
    });
  }

  setupErrorHandlers() {
    process.on("unhandledRejection", (reason) => {
      const msg = reason instanceof Error ? reason.stack : String(reason);
      console.log(this.furina.error(`🚨 Unhandled Rejection:\n${msg}`));

      this.restMessenger.enviar(this.LOG_CHANNEL, {
        embeds: [{
          title: "🚨 Unhandled Rejection",
          color: 0xffcc00,
          description: `\`\`\`js\n${msg.slice(0, 1900)}\n\`\`\``,
          timestamp: new Date().toISOString(),
        }],
      });
    });

    process.on("uncaughtException", (err) => {
      const msg = err instanceof Error ? err.stack : String(err);
      console.log(this.furina.error(`💥 Uncaught Exception:\n${msg}`));

      this.restMessenger.enviar(this.LOG_CHANNEL, {
        embeds: [{
          title: "💥 Uncaught Exception",
          color: 0xff0000,
          description: `\`\`\`js\n${msg.slice(0, 1900)}\n\`\`\``,
          timestamp: new Date().toISOString(),
        }],
      });
    });

    process.on("uncaughtExceptionMonitor", (err) => {
      const msg = err instanceof Error ? err.stack : String(err);
      console.log(this.furina.warn(`🔍 Monitorando erro:\n${msg}`));

      this.restMessenger.enviar(this.LOG_CHANNEL, {
        embeds: [{
          title: "🔍 Monitoramento de Erro",
          color: 0xffff00,
          description: `\`\`\`js\n${msg.slice(0, 1900)}\n\`\`\``,
          timestamp: new Date().toISOString(),
        }],
      });
    });
  }

  async start() {
    

    this.setupClusterEvents();
    this.setupErrorHandlers();

    await this.manager.spawn({ timeout: -1 });
  }
}

module.exports = FurinaApplication;