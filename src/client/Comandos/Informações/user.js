const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
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
      type: 6,
      required: false,
    },
  ],

  run: async (client, interaction) => {
    try {
      // deferReply() já foi chamado antes de chegar aqui

      const targetUser = interaction.options.getUser("mencao") || interaction.user;
      const guild = interaction.guild;
      const member = await guild.members.fetch(targetUser.id).catch(() => null);
      const corMaiorCargo = member?.roles.highest.color || 0x5865f2;

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
        return interaction.editReply({ embeds: [userEmbed] });
      }

      const menorCargo = member.roles.cache
        .filter((r) => r.id !== guild.id)
        .sort((a, b) => a.position - b.position)
        .first();

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

      // Aqui cria o ID do botão e registra callback que SÓ executa quando clicar no botão
      const permissoesBtnId = client.CustomCollector.create(async (btnInteraction) => {
        await btnInteraction.deferReply({ ephemeral: true });

        const permissoes = member.permissions.toArray();
        const permissoesFormatadas = permissoes.length
          ? permissoes.map(p => `**\`${permissoesPTBR[p] || p}\`**`).join("\n")
          : "❌ Nenhuma permissão detectada.";

        const permEmbed = new EmbedBuilder()
          .setTitle(`🔐 Permissões de ${member.displayName}`)
          .setDescription(permissoesFormatadas)
          .setColor("#5865F2")
          .setFooter({ text: "Essas permissões são do servidor atual." });

        await btnInteraction.followUp({ embeds: [permEmbed], ephemeral: true });
      }, {
        type: "button",
        checkAuthor: true,
        authorId: interaction.user.id,
        timeout: 30000,
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(permissoesBtnId)
          .setLabel("📋 Permissões")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setLabel("📥 Baixar Avatar")
          .setStyle(ButtonStyle.Link)
          .setURL(targetUser.displayAvatarURL({ dynamic: true, size: 1024 }))
      );

      await interaction.editReply({
        embeds: [userEmbed, memberEmbed],
        components: [row],
      });



    } catch (err) {
      console.error(err);

      const id = await client.reportarErro({
        erro: err,
        comando: interaction.commandName,
        servidor: interaction.guild
      });

      return interaction.editReply({
        content: `❌ Oh là là... Um contratempo inesperado surgiu durante a execução deste comando. Por gentileza, reporte este erro ao nosso servidor de suporte junto com o ID abaixo, para que a justiça divina possa ser feita!\n\n🆔 ID do erro: \`${id}\``,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                label: "Servidor de Suporte",
                style: 5,
                url: "https://discord.gg/KQg2B5JeBh"
              }
            ]
          }
        ],
        embeds: [],
        files: []
      });
    }

  },
};
