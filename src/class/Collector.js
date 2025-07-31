const { randomUUID } = require('crypto');

class CustomCollector {
  constructor(client) {
    this.client = client;
    this.callbacks = new Map();

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton() && !interaction.isSelectMenu() && !interaction.isModalSubmit()) return;

      const id = interaction.customId;

      
      if (interaction.isModalSubmit() && id.startsWith('modal_sorteio_')) {
        return this.client.GerenciadorSorteio.tratarModal(interaction);
      } else if (interaction.isButton() && (id.startsWith('sorteio_') || id.startsWith("criar_"))) {
        return this.client.GerenciadorSorteio.tratarBotao(interaction);
      } else if (!this.callbacks.has(id)) {
        if (!interaction.replied && !interaction.deferred) {
          try {
            await interaction.deferUpdate();
          } catch {}
        }
        return;
      }

      const data = this.callbacks.get(id);

      // Verifica se a interação é do autor correto
      if (data.authorId && interaction.user.id !== data.authorId) {
        try {
          await interaction.reply({
            content: '❌ Só quem usou o comando pode usar esta interação.',
            ephemeral: true,
          });
        } catch {}
        return;
      }

      // Executa callback
      try {
        await data.fn(interaction);
      } catch (error) {
        console.error('Erro no callback do CustomCollector:', error);
        try {
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
              content: '❌ Ocorreu um erro ao processar esta interação.',
              ephemeral: true,
            });
          }
        } catch {}
      }
    });
  }

  // Registrar callback com ID aleatório
  create(fn, options = {}) {
    const id = randomUUID();

    if (options.timeout) {
      const timeoutId = setTimeout(() => {
        this.callbacks.delete(id);
      }, options.timeout);
      this.callbacks.set(id, { fn, ...options, timeoutId });
    } else {
      this.callbacks.set(id, { fn, ...options });
    }

    return id;
  }

  // Deletar callback
  delete(id) {
    const data = this.callbacks.get(id);
    if (data) {
      if (data.timeoutId) clearTimeout(data.timeoutId);
      this.callbacks.delete(id);
    }
  }

  /**
   * Coleta uma única mensagem de um usuário em um canal
   * @param {Object} options
   * @param {string} options.userId - ID do autor da mensagem
   * @param {TextChannel} options.channel - Canal onde será coletada a mensagem
   * @param {number} options.time - Tempo em ms
   * @returns {Promise<Message>} - Retorna a mensagem coletada
   */
  coletarMensagem({ userId, channel, time = 30000 }) {
    return new Promise((resolve, reject) => {
      const collector = channel.createMessageCollector({
        filter: m => m.author.id === userId,
        time,
        max: 1
      });

      collector.on('collect', msg => resolve(msg));
      collector.on('end', collected => {
        if (collected.size === 0) reject();
      });
    });
  }
}

module.exports = CustomCollector;
