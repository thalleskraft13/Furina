const { randomUUID } = require('crypto');

class CustomCollector {
  constructor(client) {
    this.client = client;
    this.callbacks = new Map();

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton() && !interaction.isSelectMenu() && !interaction.isModalSubmit()) return;

      if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_sorteio_')) {
        return this.client.GerenciadorSorteio.tratarModal(interaction);
      } else if (interaction.isButton() && (interaction.customId.startsWith('sorteio_') || interaction.customId.startsWith("criar_"))) {
        return this.client.GerenciadorSorteio.tratarBotao(interaction);
      } else {

      const id = interaction.customId;
      const data = this.callbacks.get(id);

      if (!data) {
        if (!interaction.replied && !interaction.deferred) {
          try {
            await interaction.reply({
              ephemeral: true,
              content: '💧 A dança terminou, e esta interação já escorreu pelas marés do tempo...'
            });
          } catch {}
        }
        return;
      }

      if (data.authorId && interaction.user.id !== data.authorId) {
        try {
          await interaction.reply({
            content: `⚖️ Oh~ Apenas <@${data.authorId}> pode continuar a interagir!`,
            ephemeral: true
          });
        } catch {}
        return;
      }

      try {
        await data.fn(interaction);
      } catch (err) {
        console.error("Erro no CustomCollector:", err);
        try {
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
              content: '❌ Uma falha inesperada ecoou pelas ondas... Tente novamente mais tarde.',
              ephemeral: true
            });
          }
        } catch {}
      }
      }
    });
  }

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

  createModal(fn, options = {}) {
    const id = `modal_${randomUUID()}`;

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

  delete(id) {
    const data = this.callbacks.get(id);
    if (data) {
      if (data.timeoutId) clearTimeout(data.timeoutId);
      this.callbacks.delete(id);
    }
  }

  coletarMensagem({ userId, channel, time = 30000 }) {
    return new Promise((resolve, reject) => {
      const collector = channel.createMessageCollector({
        filter: m => m.author.id === userId,
        time,
        max: 1
      });

      collector.on('collect', resolve);
      collector.on('end', collected => {
        if (collected.size === 0) reject(new Error("Tempo esgotado para resposta"));
      });
    });
  }
}

module.exports = CustomCollector;
