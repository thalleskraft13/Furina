const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  PermissionsBitField,
} = require("discord.js");

const permissoesPTBR = {
  CREATE_INSTANT_INVITE: "Criar convite instantâneo",
  KICK_MEMBERS: "Expulsar membros",
  BAN_MEMBERS: "Banir membros",
  ADMINISTRATOR: "Administrador",
  MANAGE_CHANNELS: "Gerenciar canais",
  MANAGE_GUILD: "Gerenciar servidor",
  ADD_REACTIONS: "Adicionar reações",
  VIEW_AUDIT_LOG: "Ver registros de auditoria",
  PRIORITY_SPEAKER: "Prioridade para falar",
  STREAM: "Transmitir",
  VIEW_CHANNEL: "Visualizar canal",
  SEND_MESSAGES: "Enviar mensagens",
  SEND_TTS_MESSAGES: "Enviar mensagens TTS",
  MANAGE_MESSAGES: "Gerenciar mensagens",
  EMBED_LINKS: "Incorporar links",
  ATTACH_FILES: "Enviar arquivos",
  READ_MESSAGE_HISTORY: "Ler histórico de mensagens",
  MENTION_EVERYONE: "Mencionar @everyone",
  USE_EXTERNAL_EMOJIS: "Usar emojis externos",
  VIEW_GUILD_INSIGHTS: "Ver estatísticas do servidor",
  CONNECT: "Conectar",
  SPEAK: "Falar",
  MUTE_MEMBERS: "Silenciar membros",
  DEAFEN_MEMBERS: "Ensurdecer membros",
  MOVE_MEMBERS: "Mover membros",
  USE_VAD: "Usar detecção de voz",
  CHANGE_NICKNAME: "Alterar apelido",
  MANAGE_NICKNAMES: "Gerenciar apelidos",
  MANAGE_ROLES: "Gerenciar cargos",
  MANAGE_WEBHOOKS: "Gerenciar webhooks",
  MANAGE_EMOJIS_AND_STICKERS: "Gerenciar emojis e figurinhas",
  USE_APPLICATION_COMMANDS: "Usar comandos de aplicação",
  REQUEST_TO_SPEAK: "Solicitar para falar",
  MANAGE_THREADS: "Gerenciar threads",
  USE_PUBLIC_THREADS: "Usar threads públicas",
  USE_PRIVATE_THREADS: "Usar threads privadas",
  MODERATE_MEMBERS: "Moderador de membros",
  MANAGE_EVENTS: "Gerenciar eventos"
};


module.exports = {
  name: "usuario",
  description: "Mostra informações do usuário e membro no servidor. Pode mencionar outro usuário opcionalmente.",
  type: 1,

  options: [
    {
      name: "mencao",
      description: "Usuário para ver as informações (opcional)",
      type: 6, // USER type
      required: false,
    },
  ],

  run: async (client, interaction) => {
    try {
     // await interaction.deferReply({ ephemeral: false });

      const targetUser = interaction.options.getUser("mencao") || interaction.user;
      const guild = interaction.guild;

      // Tentativa de pegar o membro no servidor (se for bot ou membro removido pode ser null)
      const member = await guild.members.fetch(targetUser.id).catch(() => null);

      // Cor do maior cargo ou azul Furina padrão
      const corMaiorCargo = member?.roles.highest.color || 0x5865f2;

      // Embed do usuário Discord
      const userEmbed = new EmbedBuilder()
        .setTitle("📌 Informações do Usuário (Discord)")
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
        .setColor("#5865F2")
        .addFields(
          { name: "🧑 Nome de usuário", value: `${targetUser.tag}`, inline: true },
          { name: "🆔 ID", value: targetUser.id, inline: true },
          { name: "📅 Conta criada em", value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: "Informações globais do Discord" });

      if (!member) {
        // Se não é membro do servidor, só manda info do usuário
        return interaction.editReply({
          embeds: [userEmbed],
        });
      }

      // Menor cargo (ignorando @everyone)
      const menorCargo = member.roles.cache
        .filter((r) => r.id !== guild.id)
        .sort((a, b) => a.position - b.position)
        .first();

      // Embed do membro
      const memberEmbed = new EmbedBuilder()
        .setTitle("🏷️ Informações do Membro (Servidor)")
        .setThumbnail(member.displayAvatarURL({ dynamic: true, size: 512 }))
        .setColor(corMaiorCargo)
        .addFields(
          { name: "📛 Nome no servidor", value: `${member.displayName}`, inline: true },
          { name: "📌 Maior cargo", value: member.roles.highest.id === guild.id ? "Nenhum" : `${member.roles.highest}`, inline: true },
          { name: "🪪 Menor cargo", value: menorCargo ? `${menorCargo}` : "Nenhum", inline: true },
          { name: "📍 Nome do servidor", value: guild.name, inline: false },
          { name: "📅 Entrou em", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false }
        )
        .setFooter({ text: "Informações locais do servidor" });

      // Botão Permissões
      const button = new ButtonBuilder()
        .setCustomId("ver_permissoes")
        .setLabel("📋 Permissões")
        .setStyle(ButtonStyle.Secondary);

      const buttonAvatar = new ButtonBuilder()
        .setCustomId("baixar_avatar")
        .setLabel("📥 Baixar Avatar")
        .setStyle(ButtonStyle.Link)
        .setURL(targetUser.displayAvatarURL({ dynamic: true, size: 1024 }));


      const row = new ActionRowBuilder().addComponents(button, buttonAvatar);

      const reply = await interaction.editReply({
        embeds: [userEmbed, memberEmbed],
        components: [row],
      });

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000,
      });

      collector.on("collect", async (btn) => {
        if (btn.user.id !== interaction.user.id) {
          return btn.reply({ content: "❌ Só quem usou o comando pode usar este botão!", ephemeral: true });
        }
        await btn.deferReply({ ephemeral: true })

        const permissoes = member.permissions.toArray();

        // Traduz e formata
        const permissoesFormatadas = permissoes.length
          ? permissoes
              .map((p) => {
                const pt = permissoesPTBR[p] || p; // fallback caso não tenha tradução
                return `**\`${pt}\`**`;
              })
              .join("\n")
          : "❌ Nenhuma permissão detectada.";

        const permEmbed = new EmbedBuilder()
          .setTitle(`🔐 Permissões de ${member.displayName}`)
          .setDescription(permissoesFormatadas)
          .setColor("#5865F2")
          .setFooter({ text: "Essas permissões são do servidor atual." });

        await btn.followUp({
          embeds: [permEmbed],
          ephemeral: true,
        });
      });

      collector.on("end", () => {
        reply.edit({ components: [] }).catch(() => {});
      });
    } catch (error) {
      console.error(error);
      if (interaction.deferred || interaction.replied) {
        return interaction.editReply({
          content: `❌ Ocorreu um erro ao buscar os dados do usuário.\n\`\`\`\n${error}\n\`\`\``,
        });
      } else {
        return interaction.reply({
          content: `❌ Ocorreu um erro ao buscar os dados do usuário.\n\`\`\`\n${error}\n\`\`\``,
          ephemeral: true,
        });
      }
    }
  },
};
