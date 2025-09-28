class Exploracao {
  constructor(Furina) {
    this.furina = Furina;

    // Limites oficiais de cada Oculus
    this.limitesOculus = {
      mondstadt: 66,
      liyue: 131,
      inazuma: 181,
      sumeru: 271,
    };
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

    const comuns = Math.floor(duracaoHoras * 3 * fator);
    const preciosos = Math.floor(duracaoHoras * 1.5 * fator);
    const luxuosos = Math.floor(duracaoHoras * 0.3 * fator);

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
    exploracao.inicio = agora;
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

    // 🛡️ Cálculo de duração REAL da exploração
    const inicio = exploracao.inicio || (exploracao.time - 3600000); // fallback 1h
    const duracaoMs = exploracao.time - inicio;

    if (duracaoMs < 0 || duracaoMs > 1000 * 60 * 60 * 24) {
      return "❌ A duração da exploração parece inválida. Por favor, reinicie a exploração nessa região.";
    }

    const duracaoHoras = Math.max(1, Math.round(duracaoMs / 3600000));

    const { comuns, preciosos, luxuosos, primogemas } = this.calcularRecompensas(
      duracaoHoras,
      ["liyue", "sumeru"].includes(regiao)
    );

    // 📦 Quantidade aleatória de oculus (0 ~ duracaoHoras, respeitando limite real do Genshin)
    const quantidadeOculus = Math.floor(Math.random() * (duracaoHoras + 1));

    // Atualiza os baús e primos
    exploracao.bausComuns += comuns;
    exploracao.bausPreciosos += preciosos;
    exploracao.bausLuxuosos += luxuosos;
    exploracao.time = 0;
    exploracao.inicio = 0;
    exploracao.resgatar = false;
    userdb.primogemas += primogemas;

    // Atualiza oculus da região certa (respeitando o limite oficial)
    const limite = this.limitesOculus[regiao] || 0;
    let campo = null;

    switch (regiao) {
      case "mondstadt":
        campo = "anemoculus";
        break;
      case "liyue":
        campo = "geoculus";
        break;
      case "inazuma":
        campo = "electroculus";
        break;
      case "sumeru":
        campo = "dendroculus";
        if (userdb.regioes.sumeru.estatuaDosSetes.dendroculus === undefined) {
          userdb.regioes.sumeru.estatuaDosSetes.dendroculus = 0;
        }
        break;
    }

    if (campo) {
      const atual = userdb.regioes[regiao].estatuaDosSetes[campo] || 0;
      userdb.regioes[regiao].estatuaDosSetes[campo] = Math.min(
        atual + quantidadeOculus,
        limite
      );
    }

    await userdb.save();

    // Missão de guilda
    if (userdb.guilda) {
      const guilda = await this.furina.guilda.findOne({ tag: userdb.guilda });
      if (guilda) {
        const missao = guilda.missoes.find(m => m.tipo === "exploracoes" && !m.concluida);
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
           (quantidadeOculus > 0 ? `🪨 Encontraste **${quantidadeOculus} ${this.getOculusNome(regiao)}**\n` : "Nenhum oculus encontrado desta vez...\n") +
           `Volta sempre — o mundo ainda guarda segredos para ti!`;
  }

  // 🔑 Helper para mostrar o nome certo no retorno
  getOculusNome(regiao) {
    switch (regiao) {
      case "mondstadt": return "Anemoculus";
      case "liyue": return "Geoculus";
      case "inazuma": return "Electroculus";
      case "sumeru": return "Dendroculus";
      default: return "Oculus";
    }
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

  startSumeru(...args) {
    return this.startRegiao(...args, "sumeru");
  }
  collectSumeru(userId) {
    return this.collectRegiao(userId, "sumeru");
  }
}

module.exports = Exploracao;
