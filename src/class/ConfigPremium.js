const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

class ConfigMareDourada {
  constructor(client) {
    this.client = client;
    this.selectMenuId = null; // id do select menu
    this.optionIds = {};      // map de option value para callback id
  }

  async abrirPainel(interaction) {
    const serverId = interaction.guild.id;
    const userId = interaction.user.id;

    const serverDB = await this.client.serverdb.findOne({ serverId }) || new this.client.serverdb({ serverId });
    const userDB = await this.client.userdb.findOne({ id: userId });

    const agora = Date.now();
    const userPremiumAtivo = userDB?.premium && userDB.premium > agora;
    const serverPremiumAtivo = serverDB.premium && serverDB.premium > agora;

    if (!userPremiumAtivo && !serverPremiumAtivo) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ Maré dourada indisponível")
            .setDescription("Você ou este servidor não possuem Maré dourada (premium) ativo.")
            .setColor("#FF5555")
            .setFooter({ text: "Adquira o premium para liberar essa função." }),
        ],
        components: [],
      });
    }

    if (!serverPremiumAtivo && userPremiumAtivo) {
      serverDB.premium = userDB.premium;
      await serverDB.save();
    }

    if (!serverDB.mareDouradaConfig) {
      serverDB.mareDouradaConfig = {
        bonusDaily: false,
        bonusPrimogemas: false,
        diminuiPity: false,
      };
      await serverDB.save();
    }

    const conf = serverDB.mareDouradaConfig;

    // Cria o selectMenuId fixo uma vez
    if (!this.selectMenuId) {
      this.selectMenuId = this.client.CustomCollector.create(async (selectInteraction) => {
        await selectInteraction.deferUpdate();

        const srvDB = await this.client.serverdb.findOne({ serverId }) || new this.client.serverdb({ serverId });
        if (!srvDB.mareDouradaConfig) {
          srvDB.mareDouradaConfig = {
            bonusDaily: false,
            bonusPrimogemas: false,
            diminuiPity: false,
          };
        }

        const escolha = selectInteraction.values[0];
        srvDB.mareDouradaConfig[escolha] = !srvDB.mareDouradaConfig[escolha];
        await srvDB.save();

        await selectInteraction.followUp({
          ephemeral: true,
          content: `💧 ${escolha === "bonusDaily" ? "Bônus de daily" : escolha === "bonusPrimogemas" ? "Primogemas por mensagem" : "Diminuição de pity"} foi **${srvDB.mareDouradaConfig[escolha] ? "ativado" : "desativado"}**.`,
        });

        const confAtualizado = srvDB.mareDouradaConfig;
        const embedAtualizado = new EmbedBuilder()
          .setTitle("💎 Configurações da Maré dourada")
          .setDescription(
            `**Maré dourada ativa até:** <t:${Math.floor(srvDB.premium / 1000)}:R>\n\n` +
            `**Status dos bônus:**\n` +
            `- Bônus de daily: **${confAtualizado.bonusDaily ? "Ativado" : "Desativado"}**\n` +
            `- Primogemas por mensagem: **${confAtualizado.bonusPrimogemas ? "Ativado" : "Desativado"}**\n` +
            `- Diminuição de pity: **${confAtualizado.diminuiPity ? "Ativado" : "Desativado"}**\n\n` +
            "Use o menu abaixo para ativar ou desativar um bônus."
          )
          .setColor("#FFD700")
          .setFooter({ text: "Furina, a Juíza das Marés" });

        await selectInteraction.editReply({ embeds: [embedAtualizado] });
      }, { authorId: interaction.user.id, timeout: 5 * 60 * 1000 });
    }

    // Mapeia cada opção para um callback id fixo (botões separados, por exemplo)
    const options = [
      { label: "Ativar bônus de daily", value: "bonusDaily", description: "Ative para receber bônus diários." },
      { label: "Ativar primogemas por mensagem", value: "bonusPrimogemas", description: "Ganhe primogemas ao enviar mensagens." },
      { label: "Ativar diminuição de pity", value: "diminuiPity", description: "Reduza a contagem de pity em invocações." },
    ];

    // Cria ids para cada opção (se ainda não criado)
    for (const opt of options) {
      if (!this.optionIds[opt.value]) {
        this.optionIds[opt.value] = this.client.CustomCollector.create(async (buttonInteraction) => {
          await buttonInteraction.deferUpdate();

          const srvDB = await this.client.serverdb.findOne({ serverId }) || new this.client.serverdb({ serverId });
          if (!srvDB.mareDouradaConfig) {
            srvDB.mareDouradaConfig = {
              bonusDaily: false,
              bonusPrimogemas: false,
              diminuiPity: false,
            };
          }

          srvDB.mareDouradaConfig[opt.value] = !srvDB.mareDouradaConfig[opt.value];
          await srvDB.save();

          await buttonInteraction.followUp({
            ephemeral: true,
            content: `💧 ${opt.label} foi **${srvDB.mareDouradaConfig[opt.value] ? "ativado" : "desativado"}**.`,
          });

          const confAtualizado = srvDB.mareDouradaConfig;
          const embedAtualizado = new EmbedBuilder()
            .setTitle("💎 Configurações da Maré dourada")
            .setDescription(
              `**Maré dourada ativa até:** <t:${Math.floor(srvDB.premium / 1000)}:R>\n\n` +
              `**Status dos bônus:**\n` +
              `- Bônus de daily: **${confAtualizado.bonusDaily ? "Ativado" : "Desativado"}**\n` +
              `- Primogemas por mensagem: **${confAtualizado.bonusPrimogemas ? "Ativado" : "Desativado"}**\n` +
              `- Diminuição de pity: **${confAtualizado.diminuiPity ? "Ativado" : "Desativado"}**\n\n` +
              "Use o menu abaixo para ativar ou desativar um bônus."
            )
            .setColor("#FFD700")
            .setFooter({ text: "Furina, a Juíza das Marés" });

          await buttonInteraction.editReply({ embeds: [embedAtualizado] });
        }, { authorId: interaction.user.id, timeout: 5 * 60 * 1000 });
      }
    }

    // Monta o select menu SEM status na descrição, com ID fixo this.selectMenuId
    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(this.selectMenuId)
        .setPlaceholder("Selecione um bônus para ativar/desativar")
        .addOptions(
          options.map(opt => ({
            label: opt.label,
            value: opt.value,
            description: opt.description,
          }))
        )
    );

    const embed = new EmbedBuilder()
      .setTitle("💎 Configurações da Maré dourada")
      .setDescription(
        `**Maré dourada ativa até:** <t:${Math.floor(serverDB.premium / 1000)}:R>\n\n` +
        `**Status dos bônus:**\n` +
        `- Bônus de daily: **${conf.bonusDaily ? "Ativado" : "Desativado"}**\n` +
        `- Primogemas por mensagem: **${conf.bonusPrimogemas ? "Ativado" : "Desativado"}**\n` +
        `- Diminuição de pity: **${conf.diminuiPity ? "Ativado" : "Desativado"}**\n\n` +
        "Use o menu abaixo para ativar ou desativar um bônus."
      )
      .setColor("#FFD700")
      .setFooter({ text: "Furina, a Juíza das Marés" });

    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
  }
}

module.exports = ConfigMareDourada;
