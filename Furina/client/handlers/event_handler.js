const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

module.exports = (client) => {
  

  const eventosPath = path.join(__dirname, "../Eventos");
  const arquivos = fs.readdirSync(eventosPath).filter(file => file.endsWith(".js"));

  for (const file of arquivos) {
    const eventoArquivo = require(`../Eventos/${file}`);

    if (!eventoArquivo.evento || typeof eventoArquivo.run !== "function") {
      console.warn(chalk.yellow(`[⚠️ Evento inválido] ${file} está faltando 'evento' ou 'run'.`));
      continue;
    }

    // Registra o evento no client.on()
    client.on(eventoArquivo.evento, (...args) => {
      try {
        eventoArquivo.run(client, ...args);
      } catch (e) {
        console.error(chalk.red(`[Erro no evento ${eventoArquivo.evento}]`), e);
      }
    });

    client.events.set(eventoArquivo.evento, eventoArquivo.run);
  }
};
