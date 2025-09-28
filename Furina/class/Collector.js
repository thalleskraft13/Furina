const { randomUUID } = require('crypto')

class CustomCollector {
  constructor(client) {
    if (CustomCollector.instance) return CustomCollector.instance;
    this.client = client;
    this.callbacks = new Map();
    this._setupListener();
    CustomCollector.instance = this;
  }

  _setupListener() {
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isButton() && !interaction.isSelectMenu() && !interaction.isModalSubmit()) return;

      // Modais de sorteio
      if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_sorteio_')) {
        return this.client.GerenciadorSorteio.tratarModal(interaction);
      }

      // Botões de sorteio
      if (interaction.isButton() && (interaction.customId.startsWith('sorteio_') || interaction.customId.startsWith("criar_"))) {
        return this.client.GerenciadorSorteio.tratarBotao(interaction);
      }

      // Callbacks registradas
      const id = interaction.customId;
      const data = this.callbacks.get(id);

      if (!data) {
        if (!interaction.replied && !interaction.deferred) {
          try {
            await interaction.reply({
              ephemeral: true,
              content: '💧 Esta interação expirou ou não existe mais.'
            });
          } catch {}
        }
        return;
      }

      // Checagem de autor
      if (data.authorId && interaction.user.id !== data.authorId) {
        try {
          await interaction.reply({
            ephemeral: true,
            content: `⚖️ Apenas <@${data.authorId}> pode interagir aqui.`
          });
        } catch {}
        return;
      }

      // Executa a callback
      try {
        await data.fn(interaction);
      } catch (err) {
        console.error("Erro no CustomCollector:", err);
        try {
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
              ephemeral: true,
              content: '❌ Algo deu errado ao processar esta interação.'
            });
          }
        } catch {}
      } finally {
        // Remove callback após execução (opcional)
        if (data.once) this.delete(id);
      }
    });
  }

  _registerCallback(id, fn, options = {}) {
    const timeout = options.timeout ?? 60000; // default 60s
    const timeoutId = setTimeout(() => this.callbacks.delete(id), timeout);

    this.callbacks.set(id, { fn, ...options, timeoutId });
    return id;
  }

  create(fn, options = {}) {
    const id = randomUUID();
    return this._registerCallback(id, fn, options);
  }

  createModal(fn, options = {}) {
    const id = `modal_${randomUUID()}`;
    return this._registerCallback(id, fn, options);
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
