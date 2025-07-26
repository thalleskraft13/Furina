const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "serverinfo",
  description: "Mostra informações detalhadas sobre o servidor.",
  type: 1,

  run: async (client, interaction) => {
    try {
   //   await interaction.deferReply();

      const guild = interaction.guild;

      // Contagens
      const totalMembros = guild.memberCount;
      const bots = guild.members.cache.filter((m) => m.user.bot).size;
      const humanos = totalMembros - bots;

      const canaisTexto = guild.channels.cache.filter((c) => c.type === 0).size; // GuildText
      const canaisVoz = guild.channels.cache.filter((c) => c.type === 2).size; // GuildVoice
      const cargos = guild.roles.cache.size;

      const dono = await guild.fetchOwner();

      // Banner / Splash / Icon
      const bannerURL = guild.bannerURL({ size: 4096, dynamic: true }) || null;
      const iconeURL = guild.iconURL({ size: 512, dynamic: true }) || null;
      const splashURL = guild.splashURL({ size: 512, dynamic: true }) || null;

      // Boosts
      const boostLevel = guild.premiumTier ? guild.premiumTier : 0;
      const boostCount = guild.premiumSubscriptionCount || 0;

      // Criado em timestamp
      const criadoEm = `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`;

      // Criando embed
      const embed = new EmbedBuilder()
        .setTitle(`📊 Informações do servidor: ${guild.name}`)
        .setColor("#5865F2")
        .setThumbnail(iconeURL)
        .setImage(bannerURL)
        .addFields(
          { name: "🆔 ID do servidor", value: guild.id, inline: true },
          { name: "👑 Dono", value: `${dono.user.tag}`, inline: true },
          { name: "📅 Criado em", value: criadoEm, inline: false },
          { name: "💎 Boost Level", value: `Nível ${boostLevel} (${boostCount} boosts)`, inline: true },
          { name: "👥 Membros", value: `👤 Humanos: ${humanos}\n🤖 Bots: ${bots}\n🔢 Total: ${totalMembros}`, inline: true },
          { name: "📁 Canais", value: `📝 Texto: ${canaisTexto}\n🔊 Voz: ${canaisVoz}`, inline: true },
          { name: "🎭 Cargos", value: `${cargos}`, inline: true }
        );

      if (splashURL) {
        embed.addFields({ name: "🌉 Splash", value: `[Clique aqui](${splashURL})`, inline: true });
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      if (interaction.deferred || interaction.replied) {
        return interaction.editReply({
          content: `❌ Ocorreu um erro ao buscar as informações do servidor.\n\`\`\`\n${error}\n\`\`\``,
        });
      } else {
        return interaction.reply({
          content: `❌ Ocorreu um erro ao buscar as informações do servidor.\n\`\`\`\n${error}\n\`\`\``,
          ephemeral: true,
        });
      }
    }
  },
};
