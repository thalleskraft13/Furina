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

  async startMondstadt(userId, timeHours) {
    let userdb = await this.furina.userdb.findOne({ id: userId });

    if (!userdb) {
      userdb = new this.furina.userdb({ id: userId });
      await userdb.save();
    }

    const exploracao = userdb.regioes.mondstadt.exploracao;
    const totalBaus = exploracao.bausPreciosos + exploracao.bausComuns + exploracao.bausLuxuosos;

    if (totalBaus >= 500) {
      return `Bravo aventureiro, tua jornada por Mondstadt já atingiu o ápice, com 500 baús descobertos!  
Por ora, os ventos pedem uma pausa — explore novos horizontes depois.`;
    }

    const agora = Date.now();

    if (exploracao.time && exploracao.time > agora) {
      const restanteMs = exploracao.time - agora;
      const tempoFormatado = this.formatarTempo(restanteMs);
      return `Os ventos ainda guiam sua jornada, aventureiro...  
Ainda restam ${tempoFormatado} para terminar sua exploração atual. Use \`/explorar mondstadt coletar\` quando estiver pronto.`;
    }

    if (exploracao.resgatar) {
      return "Você já tem recompensas prontas para coletar! Use `/explorar mondstadt coletar` para receber seus tesouros.";
    }

    const duracaoMs = timeHours * 3600000;
    userdb.regioes.mondstadt.exploracao.time = agora + duracaoMs;
    userdb.regioes.mondstadt.exploracao.resgatar = true;

    await userdb.save();

    return `Que os ventos te guiem! Sua exploração de ${timeHours}h por Mondstadt começou agora.  
Volte mais tarde para resgatar seus tesouros com \`/explorar mondstadt coletar\`.`;
  }

  async collectMondstadt(userId) {
    let userdb = await this.furina.userdb.findOne({ id: userId });

    if (!userdb) {
      return "Você ainda não começou a explorar Mondstadt, aventureiro!";
    }

    const agora = Date.now();
    const exploracao = userdb.regioes.mondstadt.exploracao;

    if (!exploracao.time || exploracao.time <= agora) {
      if (!exploracao.resgatar) {
        return "Você não está explorando no momento. Use `/explorar mondstadt iniciar` para começar sua jornada!";
      }

      // Coletar recompensas
      let comuns = 0, preciosos = 0, luxuosos = 0;

      const tempoDuracao = (exploracao.time - (agora - 10 * 60 * 60 * 1000)) / (60 * 60 * 1000);

      if (tempoDuracao >= 10) {
        comuns = 12; preciosos = 5; luxuosos = 2;
      } else if (tempoDuracao >= 5) {
        comuns = 6; preciosos = 3; luxuosos = 1;
      } else {
        comuns = 3; preciosos = 1; luxuosos = 0;
      }

      const primogemas = comuns * 2 + preciosos * 5 + luxuosos * 10;

      userdb.regioes.mondstadt.exploracao.bausComuns += comuns;
      userdb.regioes.mondstadt.exploracao.bausPreciosos += preciosos;
      userdb.regioes.mondstadt.exploracao.bausLuxuosos += luxuosos;
      userdb.regioes.mondstadt.exploracao.time = 0;
      userdb.regioes.mondstadt.exploracao.resgatar = false;
      userdb.primogemas += primogemas;

      await userdb.save();

      return `Ah, retornaste sob aplausos invisíveis!  
Tesouros encontrados:  
> Baús Comuns: ${comuns}  
> Preciosos: ${preciosos}  
> Luxuosos: ${luxuosos}  

Primogemas arrecadadas: **${primogemas}**  
Que tua sorte continue a dançar contigo!`;
    } else {
      const restanteMs = exploracao.time - agora;
      const tempoFormatado = this.formatarTempo(restanteMs);
      return `A exploração ainda está em andamento, bravo aventureiro...  
Faltam ${tempoFormatado} para concluir a jornada. Tenha paciência e aguarde os ventos.`;
    }
  }
}

module.exports = Exploracao;
