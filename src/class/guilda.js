const { Collection } = require("discord.js");

class GuildaManager {
  /**
   * @param {import("discord.js").Client} client
   */
  constructor(client) {
    this.client = client;
  }

  /**
   * Adiciona usuário diretamente na guilda do dono da interação, sem confirmação.
   * @param {import("discord.js").CommandInteraction} interaction
   * @param {string} usuarioId - ID do usuário a adicionar
   */
  async adicionarUsuarioDireto(interaction, usuarioId) {
    const donoId = interaction.user.id;

    // Busca guilda do dono
    const guilda = await this.client.guilda.findOne({ dono: donoId });
    if (!guilda)
      return interaction.editReply({
        content: "Você não possui nenhuma guilda.",
        ephemeral: true,
      });

    // Verifica se guilda está cheia (máximo 4 membros: dono + 3)
    const total = 1 + (guilda.membros?.length || 0);
    if (total >= 4)
      return interaction.editReply({
        content: "Sua guilda já está cheia (máximo 4 membros).",
        ephemeral: true,
      });

    // Verifica se usuário já está na guilda
    if (
      usuarioId === donoId ||
      (guilda.membros && guilda.membros.find((m) => m.id === usuarioId))
    )
      return interaction.editReply({
        content: "Este usuário já faz parte da sua guilda.",
        ephemeral: true,
      });

    // Adiciona usuário direto na guilda
    guilda.membros.push({
      id: usuarioId,
      entrouEm: new Date(),
      cargo: "Membro",
    });

    await guilda.save();

    // Atualiza guilda do usuário no banco userdb
    const usuario = await this.client.userdb.findOne({ id: usuarioId });
    if (usuario) {
      usuario.guilda = guilda.tag;
      await usuario.save();
    }

    return interaction.editReply({
      content: `Usuário <@${usuarioId}> entrou diretamente na guilda **${guilda.nome}**!`,
      ephemeral: true,
    });
  }

  /**
   * Remove um usuário da guilda do dono da interação
   * @param {import("discord.js").CommandInteraction} interaction
   * @param {string} usuarioId - ID do usuário a remover da guilda
   */
  async removerUsuarioDaGuilda(interaction, usuarioId) {
    const donoId = interaction.user.id;

    // Busca guilda do dono
    const guilda = await this.client.guilda.findOne({ dono: donoId });
    if (!guilda)
      return interaction.editReply({
        content: "Você não possui nenhuma guilda.",
        ephemeral: true,
      });

    // Não pode remover o dono
    if (usuarioId === donoId)
      return interaction.editReply({
        content: "Você não pode remover o dono da guilda.",
        ephemeral: true,
      });

    // Verifica se usuário está na guilda
    const membroIndex = guilda.membros.findIndex((m) => m.id === usuarioId);
    if (membroIndex === -1)
      return interaction.editReply({
        content: "Este usuário não faz parte da sua guilda.",
        ephemeral: true,
      });

    // Remove membro
    guilda.membros.splice(membroIndex, 1);
    await guilda.save();

    // Atualiza guilda do usuário no banco userdb
    const usuario = await this.client.userdb.findOne({ id: usuarioId });
    if (usuario) {
      usuario.guilda = "0";
      await usuario.save();
    }

    return interaction.editReply({
      content: `Usuário <@${usuarioId}> removido da guilda **${guilda.nome}**.`,
      ephemeral: true,
    });
  }
}

module.exports = GuildaManager;
