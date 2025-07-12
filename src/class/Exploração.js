class Exploracao {
  constructor(Furina) {
    this.furina = Furina;
  }

  formatarTempo(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    const horas = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutos = Math.floor(totalSeconds / 60);
    const segundos = totalSeconds % 60;

    const partes = [];
    if (horas > 0) partes.push(`${horas}h`);
    if (minutos > 0) partes.push(`${minutos} minutos`);
    if (segundos > 0) partes.push(`${segundos}s`);
    return partes.join(", ");
  }

  calcularRecompensas(duracaoHoras, regioesExtras = false) {
    const fator = regioesExtras ? 1.25 : 1;
    const comuns = Math.floor(duracaoHoras * 1.8 * fator);
    const preciosos = Math.floor(duracaoHoras * 0.6 * fator);
    const luxuosos = Math.floor(duracaoHoras * 0.2 * fator);
    const primogemas = comuns * 2 + preciosos * 5 + luxuosos * 10;

    return { comuns, preciosos, luxuosos, primogemas };
  }

  async startRegiao(userId, timeHours, canalId, guildId, regiao) {
    let userdb = await this.furina.userdb.findOne({ id: userId });
    if (!userdb) {
      userdb = new this.furina.userdb({ id: userId });
      await userdb.save();
    }

    const exploracao = userdb.regioes[regiao].exploracao;

    const totalBaus =
      exploracao.bausComuns +
      exploracao.bausPreciosos +
      exploracao.bausLuxuosos;

    // Limites personalizados por região
    const limites = {
      mondstadt: 500,
      liyue: 1000,
      inazuma: 5000
    };

    const limiteMaximo = limites[regiao] || 500;

    if (totalBaus >= limiteMaximo) {
      return `Aventureiro, tua lenda em ${regiao[0].toUpperCase() + regiao.slice(1)} já brilha com **${limiteMaximo} baús** descobertos!  
Descansa por ora, e retorna quando os ventos mudarem.`;
    }

    const agora = Date.now();

    if (exploracao.time && exploracao.time > agora) {
      const restanteMs = exploracao.time - agora;
      const tempoFormatado = this.formatarTempo(restanteMs);
      return `A brisa da jornada ainda sopra...  
Faltam ${tempoFormatado} para concluir a exploração de ${regiao}.`;
    }

    if (exploracao.resgatar) {
      return `Você já possui recompensas para coletar em ${regiao}. Use \`/explorar ${regiao} coletar\`.`;
    }

    const duracaoMs = timeHours * 3600000;
    exploracao.time = agora + duracaoMs;
    exploracao.resgatar = true;

    await userdb.save();

    await this.furina.GerenciadorTarefas.criarTarefa(
      "lembrete",
      {
        canalId,
        userId,
        guildId,
        mensagem: `A exploração de ${regiao} foi concluída! Recolha tuas recompensas gloriosas.`,
      },
      new Date(agora + duracaoMs)
    );

    return `🌿 Iniciaste tua jornada de ${timeHours}h por ${regiao[0].toUpperCase() + regiao.slice(1)}.  
Sábios ecos te chamarão quando a busca chegar ao fim.`;
  }

  async collectRegiao(userId, regiao) {
    const userdb = await this.furina.userdb.findOne({ id: userId });
    if (!userdb) return `Não encontramos teus passos por ${regiao}, aventureiro.`;

    const exploracao = userdb.regioes[regiao].exploracao;
    const agora = Date.now();

    if (!exploracao.time || exploracao.time > agora)
      return `A exploração por ${regiao} ainda não foi concluída. Aguarde com paciência...`;

    if (!exploracao.resgatar)
      return `Inicie uma nova exploração por ${regiao} usando \`/explorar ${regiao} iniciar\`.`;

    const duracaoHoras = Math.max(
      1,
      Math.round((exploracao.time - (agora - 12 * 60 * 60 * 1000)) / 3600000)
    );

    const { comuns, preciosos, luxuosos, primogemas } = this.calcularRecompensas(duracaoHoras, regiao === "liyue");

    exploracao.bausComuns += comuns;
    exploracao.bausPreciosos += preciosos;
    exploracao.bausLuxuosos += luxuosos;
    exploracao.time = 0;
    exploracao.resgatar = false;
    userdb.primogemas += primogemas;

    await userdb.save();

    return `🌟 Tua expedição por ${regiao[0].toUpperCase() + regiao.slice(1)} rendeu frutos!  
> **Baús Comuns:** ${comuns}  
> **Preciosos:** ${preciosos}  
> **Luxuosos:** ${luxuosos}  
💎 Primogemas adquiridas: **${primogemas}**  
Volta sempre — o mundo ainda guarda segredos para ti!`;
  }

  // Funções públicas para comandos individuais
  startMondstadt(...args) {
    return this.startRegiao(...args, "mondstadt");
  }

  collectMondstadt(userId) {
    return this.collectRegiao(userId, "mondstadt");
  }

  startLiyue(...args) {
    return this.startRegiao(...args, "liyue");
  }

  collectLiyue(userId) {
    return this.collectRegiao(userId, "liyue");
  }

  startInazuma(...args) {
    return this.startRegiao(...args, "inazuma");
  }

  collectInazuma(userId) {
    return this.collectRegiao(userId, "inazuma");
  }
}

module.exports = Exploracao;
