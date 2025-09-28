const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require('discord.js');

class ConfigAutorole {
  constructor(client) {
    this.client = client;
    this.addBtnIdMap = new Map();
  }

  async abrirPainel(interaction) {
    const serverId = interaction.guild.id;
    const userId = interaction.user.id;

    const server = await this.client.serverdb.findOneAndUpdate(
      { serverId },
      { $setOnInsert: { autorole: { cargos: [] } } },
      { upsert: true, new: true }
    );

    const cargos = server.autorole?.cargos || [];

    const embed = new EmbedBuilder()
      .setTitle("⚙️ Configuração de Autorole")
      .setDescription(
        cargos.length === 0
          ? "Nenhum cargo adicionado ainda. Use o botão para adicionar cargos."
          : `Cargos atuais no autorole:\n${cargos.map(id => `<@&${id}>`).join('\n')}`
      )
      .setColor("#4A90E2")
      .setFooter({ text: "Furina, presenteando cada alma recém-chegada com um título~!" });

    const components = [];

    if (cargos.length > 0) {
      const selectId = this.client.CustomCollector.create(async (i) => {
        const roleId = i.values[0];
        const index = server.autorole.cargos.indexOf(roleId);
        if (index > -1) server.autorole.cargos.splice(index, 1);
        await server.save();
        await i.deferUpdate();
        await this.abrirPainel(i);
      }, { authorId: userId });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(selectId)
        .setPlaceholder("Selecione um cargo para remover")
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
          cargos.map(id => {
            const role = interaction.guild.roles.cache.get(id);
            return {
              label: (role?.name || "Cargo desconhecido").slice(0, 50),
              value: id
            };
          })
        );

      components.push(new ActionRowBuilder().addComponents(selectMenu));
    }

    let addBtnId = this.addBtnIdMap.get(userId);
    if (!addBtnId) {
      addBtnId = this.client.CustomCollector.create(async (i) => {
        await i.deferUpdate();
        await i.followUp({
          content: "Mencione o cargo que deseja adicionar ao autorole (ex: @Cargo).",
          ephemeral: true
        });

        try {
          const msg = await this.client.CustomCollector.coletarMensagem({
            userId: i.user.id,
            channel: i.channel,
            time: 15000
          });

          const role = msg.mentions.roles.first();
          if (!role) {
            return i.followUp({ content: "❌ Nenhum cargo mencionado. Tente novamente.", ephemeral: true });
          }

          const botMember = i.guild.members.me;

          if (!botMember.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return i.followUp({ content: "❌ Preciso da permissão `Gerenciar Cargos`.", ephemeral: true });
          }

          if (role.position >= botMember.roles.highest.position) {
            return i.followUp({ content: "❌ Cargo acima do meu na hierarquia.", ephemeral: true });
          }

          const serverAtualizado = await this.client.serverdb.findOne({ serverId });
          if (serverAtualizado.autorole.cargos.includes(role.id)) {
            return i.followUp({ content: "❌ Cargo já configurado no autorole.", ephemeral: true });
          }

          if (serverAtualizado.autorole.cargos.length >= 5) {
            return i.followUp({ content: "❌ Limite de 5 cargos atingido.", ephemeral: true });
          }

          serverAtualizado.autorole.cargos.push(role.id);
          await serverAtualizado.save();

          await i.followUp({ content: `✅ Cargo <@&${role.id}> adicionado!`, ephemeral: true });
          await this.abrirPainel(i);
        } catch {
          await i.followUp({ content: "⏰ Tempo esgotado. Nenhum cargo adicionado.", ephemeral: true });
        }
      }, { authorId: userId });
      this.addBtnIdMap.set(userId, addBtnId);
    }

    components.push(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(addBtnId)
          .setLabel("Adicionar Cargo")
          .setStyle(ButtonStyle.Primary)
      )
    );

    await interaction.editReply({
      content: "",
      embeds: [embed],
      components
    });
  }
}

module.exports = ConfigAutorole;
