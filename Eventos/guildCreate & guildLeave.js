const { EmbedBuilder } = require("discord.js");
const furina = require("../index")
const canalLogsId = "1385561296468054096"; 
furina.on("guildCreate", async (guild) => {
  const canal = await furina.channels.fetch(canalLogsId).catch(() => null);
  if (!canal) return;

  const embed = new EmbedBuilder()
    .setTitle("✨ A Furina do Discord foi adicionada!")
    .setColor("#3DD1D9")
    .setDescription(`**Servidor:** ${guild.name} (\`${guild.id}\`)\n**Membros:** ${guild.memberCount}`)
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setTimestamp();

  canal.send({ embeds: [embed] });
});

furina.on("guildDelete", async (guild) => {
  const canal = await furina.channels.fetch(canalLogsId).catch(() => null);
  if (!canal) return;

  const embed = new EmbedBuilder()
    .setTitle("💔 A Furina do Discord foi removida!")
    .setColor("#ff4c4c")
    .setDescription(`**Servidor:** ${guild.name} (\`${guild.id}\`)`)
    .setThumbnail(guild.iconURL({ dynamic: true }))
    .setTimestamp();

  canal.send({ embeds: [embed] });
});
