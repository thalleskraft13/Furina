const fs = require("fs");
const FurinaStatus = require("../../Furina/status.json");

module.exports = {
  config: {
    name: "furina",
    description: "Mostra ping e status de todas as shards/clusters",
    usage: `f-ping`,
  },

  async run(bot, message, args) {
    try {
      if (!FurinaStatus || Object.keys(FurinaStatus).length === 0) {
        return message.channel.send("❌ Status das shards ainda não está disponível.");
      }

      for (const shardId in FurinaStatus) {
        const s = FurinaStatus[shardId];
        let resposta = "```";
        resposta += `
Shard: ${s.shard} | Cluster: ${s.cluster} (ID: ${s.cluster_id})
Status: ${s.status || "Desconhecido"}
Ping: ${s.ping || "Desconhecido"}
Memória: ${s.memoria || "Desconhecida"}
CPU: ${s.cpu ? s.cpu.percent : "Desconhecida"}
Servidores: ${s.servidores || "Desconhecido"}
Usuários (cache): ${s.usuarios || "Desconhecido"}
Canais (cache): ${s.canais || "Desconhecido"}
Eventos: ${s.eventos || "Desconhecido"}
Uptime: ${s.uptime || "Desconhecido"}
-------------------------------
`;
        resposta += "```";

        await message.channel.send({ content: resposta });
      }
    } catch (err) {
      console.error("Erro ao executar comando ping:", err);
      message.channel.send("❌ Ocorreu um erro ao obter o status das shards.");
    }
  },
};
