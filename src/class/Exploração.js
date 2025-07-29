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
    const hora = new Date().getHours();
    let limiteBaus = 10; // padrão mínimo para 0h - 0:59
    if (hora >= 10) limiteBaus = 100;
    else if (hora >= 5) limiteBaus = 60;
    else if (hora >= 1) limiteBaus = 30;

    const fator = regioesExtras ? 1.25 : 1;

    let comuns = Math.floor(duracaoHoras * 1.8 * fator);
    let preciosos = Math.floor(duracaoHoras * 0.6 * fator);
    let luxuosos = Math.floor(duracaoHoras * 0.2 * fator);

    let total = comuns + preciosos + luxuosos;

    // Garante que o total seja no mínimo 50% do limite do horário
    if (total < limiteBaus / 2) {
      const deficit = Math.ceil(limiteBaus / 2) - total;
      comuns += deficit; // adiciona deficit nos baús comuns
      total = comuns + preciosos + luxuosos;
    }

    // Garante que o total não ultrapasse o limite máximo
    if (total > limiteBaus) {
      const excedente = total - limiteBaus;
      if (comuns >= excedente) comuns -= excedente;
      else if (preciosos >= excedente) preciosos -= excedente;
      else luxuosos = Math.max(0, luxuosos - excedente);
    }

    // Valores de gemas por tipo de baú
    // Comum: 5 gemas
    // Precioso: 10 gemas
    // Luxuoso: 80 gemas
    const primogemas = comuns * 5 + preciosos * 10 + luxuosos * 80;

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

    const limites = {
      mondstadt: 500,
      liyue: 1000,
      inazuma: 5000,
      sumeru: 7000,
    };

    const limiteMaximo = limites[regiao] || 500;

    if (totalBaus >= limiteMaximo) {
      return `Aventureiro, tua lenda em ${regiao[0].toUpperCase() + regiao.slice(1)} já brilha com **${limiteMaximo} baús** descobertos!\nDescansa por ora, e retorna quando os ventos mudarem.`;
    }

    const agora = Date.now();

    if (exploracao.time && exploracao.time > agora) {
      const restanteMs = exploracao.time - agora;
      const tempoFormatado = this.formatarTempo(restanteMs);
      return `A brisa da jornada ainda sopra...\nFaltam ${tempoFormatado} para concluir a exploração de ${regiao}.`;
    }

    if (exploracao.resgatar) {
      return `Você já possui recompensas para coletar em ${regiao}. Use \`/explorar ${regiao} coletar\`.`;
    }

    const duracaoMs = timeHours * 3600000;
    exploracao.time = agora + duracaoMs;
    exploracao.inicio = agora;  // Salva o início da exploração
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

    return `🌿 Iniciaste tua jornada de ${timeHours}h por ${regiao[0].toUpperCase() + regiao.slice(1)}.\nSábios ecos te chamarão quando a busca chegar ao fim.`;
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

    // Corrigido: calcula duração pela diferença entre fim e início da exploração
    const duracaoHoras = Math.max(
      1,
      Math.round((exploracao.time - exploracao.inicio) / 3600000)
    );

    const { comuns, preciosos, luxuosos, primogemas } = this.calcularRecompensas(
      duracaoHoras,
      ["liyue", "sumeru"].includes(regiao)
    );

    exploracao.bausComuns += comuns;
    exploracao.bausPreciosos += preciosos;
    exploracao.bausLuxuosos += luxuosos;
    exploracao.time = 0;
    exploracao.inicio = 0;  // reseta início após coleta
    exploracao.resgatar = false;
    userdb.primogemas += primogemas;

    await userdb.save();

    // Missão de guilda
    if (userdb.guilda) {
      const guilda = await this.furina.guilda.findOne({ tag: userdb.guilda });
      if (guilda) {
        const missao = guilda.missoes.find(
          (m) => m.tipo === "exploracoes" && !m.concluida
        );
        if (missao) {
          missao.progresso += 1;

          if (missao.progresso >= missao.objetivo) {
            missao.progresso = missao.objetivo;
            missao.concluida = true;
            guilda.mora += missao.recompensa.mora || 0;
            guilda.primogemas += missao.recompensa.primogemas || 0;
            guilda.xp += missao.recompensa.xp || 0;
          }

          await guilda.save();
        }
      }
    }

    return `🌟 Tua expedição por ${regiao[0].toUpperCase() + regiao.slice(1)} rendeu frutos!\n` +
      `> **Baús Comuns:** ${comuns}\n` +
      `> **Preciosos:** ${preciosos}\n` +
      `> **Luxuosos:** ${luxuosos}\n` +
      `💎 Primogemas adquiridas: **${primogemas}**\n` +
      `Volta sempre — o mundo ainda guarda segredos para ti!`;
  }

  // Regiões existentes
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

  // 🆕 Sumeru
  startSumeru(...args) {
    return this.startRegiao(...args, "sumeru");
  }

  collectSumeru(userId) {
    return this.collectRegiao(userId, "sumeru");
  }
}

module.exports = Exploracao;
