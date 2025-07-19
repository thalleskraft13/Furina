const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

const personagensBonus = require("./data/personagensAbismo");

class Abismo {
  constructor(client) {
    this.client = client;
  }

  aplicarConstelacoes(personagem, status, acao, contexto = {}) {
    const dados = personagensBonus.personagens[personagem.nome];
    if (!dados || !dados.constelacoes) return status;

    let novoStatus = { ...status };

    for (let i = 1; i <= personagem.c; i++) {
      const cKey = `c${i}`;
      const cBonus = dados.constelacoes[cKey];
      if (!cBonus) continue;

      if (cBonus.atributo && novoStatus[cBonus.atributo] !== undefined) {
        novoStatus[cBonus.atributo] += cBonus.valor || 0;
      }

      if (
        personagem.nome.toLowerCase() === "arlecchino" &&
        cKey === "c6" &&
        contexto.ultUsada
      ) {
        novoStatus.taxaCritica += 40;
        novoStatus.danoCritico += 40;
      }

      if (
        personagem.nome.toLowerCase() === "bennett" &&
        cKey === "c6" &&
        contexto.ultUsada
      ) {
        novoStatus.danoTotal +=
          personagem.atributos.atk * 0.15 * (contexto.dpsAtkTotal || 1);
      }
    }

    return novoStatus;
  }

  bonusNivelHabilidades(personagem, acao) {
    const bonusPorNivel = 0.05;
    switch (acao) {
      case "ataque_normal":
        return (
          personagem.talentos.ataqueNormal * bonusPorNivel * personagem.atributos.atk
        );
      case "ataque_carga":
        return (
          personagem.talentos.ataqueCarga * bonusPorNivel * personagem.atributos.atk
        );
      case "habilidade_elemental":
        return (
          personagem.talentos.habilidadeElemental * bonusPorNivel * personagem.atributos.atk
        );
      case "supremo":
        return (
          personagem.talentos.supremo * bonusPorNivel * personagem.atributos.atk
        );
      default:
        return 0;
    }
  }

  aplicarBonusPorPapel(personagem, status, equipe, contexto = {}) {
    let novoStatus = { ...status };
    const papel =
      typeof personagem.papel === "string" ? personagem.papel.toUpperCase() : "";

    switch (papel) {
      case "HEALER":
        novoStatus.curaBonus = (novoStatus.curaBonus || 0) + personagem.atributos.hp * 0.2;
        break;
      case "ESCUDEIRO":
        novoStatus.escudoBonus = (novoStatus.escudoBonus || 0) + personagem.atributos.hp * 0.25;
        break;
      case "SUPORTE":
        if (personagem.nome.toLowerCase() === "bennett") {
          const dpsAtkTotal = equipe
            .filter(
              (p) => typeof p.papel === "string" && p.papel.toUpperCase() === "DPS"
            )
            .reduce((sum, p) => sum + p.atributos.atk, 0);

          novoStatus.danoTotal += personagem.atributos.atk * 0.15 * dpsAtkTotal;
        } else if (personagem.nome.toLowerCase() === "furina") {
          novoStatus.danoTotal += personagem.atributos.hp * 0.1;
        } else if (personagem.nome.toLowerCase() === "faruzan") {
          novoStatus.profElementalBonus = (novoStatus.profElementalBonus || 0) + 0.1;
        }
        break;
      case "DPS":
        break;
    }
    return novoStatus;
  }

  calcularReacao(elementoAtacante, elementoInimigo, profBonus = 0) {
    const reacoes = {
      Pyro: { Hydro: 1.5, Cryo: 2.0, Electro: 1.5, Dendro: 1.5 },
      Hydro: { Pyro: 2.0, Electro: 1.5, Cryo: 1.5 },
      Cryo: { Pyro: 1.5, Electro: 1.5, Hydro: 1.5 },
      Electro: { Hydro: 2.0, Pyro: 1.5, Cryo: 1.5 },
      Dendro: { Hydro: 2.0, Pyro: 1.5 },
    };
    let base = reacoes[elementoAtacante]?.[elementoInimigo] || 1.0;
    return base + profBonus;
  }

  calculaDano(personagem, acao, inimigoElemento, equipe, contexto = {}) {
    let statusBase = {
      atk: personagem.atributos.atk,
      taxaCritica: personagem.atributos.taxaCritica,
      danoCritico: personagem.atributos.danoCritico,
      recargaEnergia: personagem.atributos.recargaEnergia,
      danoTotal: 0,
      curaBonus: 0,
      escudoBonus: 0,
      profElementalBonus: 0,
    };

    let status = this.aplicarConstelacoes(personagem, statusBase, acao, contexto);

    status.danoTotal += this.bonusNivelHabilidades(personagem, acao);

    status = this.aplicarBonusPorPapel(personagem, status, equipe, contexto);

    let multiplicador;
    switch (acao) {
      case "ataque_normal":
        multiplicador = 1.0;
        break;
      case "ataque_carga":
        multiplicador = 1.5;
        break;
      case "habilidade_elemental":
        multiplicador = 2.0;
        break;
      case "supremo":
        multiplicador = 3.5;
        break;
      default:
        multiplicador = 1.0;
    }

    let danoBase = status.atk * multiplicador;
    danoBase *= 1 + status.danoTotal / 100;

    const chanceCrit = Math.min(status.taxaCritica, 100);
    const danoCriticoPercent = status.danoCritico;

    const chance = Math.random() * 100;
    let critico = false;
    if (chance <= chanceCrit) {
      danoBase *= 1 + danoCriticoPercent / 100;
      critico = true;
    }

    let multiplicadorReacao = this.calcularReacao(
      personagem.elemento,
      inimigoElemento,
      status.profElementalBonus
    );
    danoBase *= multiplicadorReacao;

    return {
      dano: Math.floor(danoBase),
      critico,
      multiplicadorReacao,
      curaBonus: status.curaBonus,
      escudoBonus: status.escudoBonus,
      papel: personagem.papel,
    };
  }

  async comando(interaction) {
    const userId = interaction.user.id;
    const Usuarios = this.client.userdb;
    const userData = await Usuarios.findOne({ id: userId });

    if (!userData || !userData.equipe.length) {
      return interaction.editReply("Você precisa montar sua equipe primeiro.");
    }

    let inimigo = {
      nome: "Inimigo do Abismo",
      vidaMax: 5000,
      vidaAtual: 5000,
      elemento: "Cryo",
      ataque: 300,
      taxaCritica: 10,
      danoCritico: 50,
    };

    const acaoOptions = [
      { label: "Ataque Normal", value: "ataque_normal" },
      { label: "Ataque Carga", value: "ataque_carga" },
      { label: "Habilidade Elemental", value: "habilidade_elemental" },
      { label: "Supremo", value: "supremo" },
    ];

    const selectPersonagem = new StringSelectMenuBuilder()
      .setCustomId("select_personagem")
      .setPlaceholder("Escolha o personagem")
      .addOptions(
        userData.equipe.map((nome) => ({
          label: nome,
          value: nome,
        }))
      );

    const selectAcao = new StringSelectMenuBuilder()
      .setCustomId("select_acao")
      .setPlaceholder("Escolha a ação")
      .addOptions(acaoOptions);

    const botaoAtacar = new ButtonBuilder()
      .setCustomId("botao_atacar")
      .setLabel("Atacar")
      .setStyle(ButtonStyle.Danger);

    const rowPersonagem = new ActionRowBuilder().addComponents(selectPersonagem);
    const rowAcao = new ActionRowBuilder().addComponents(selectAcao);
    const rowBotao = new ActionRowBuilder().addComponents(botaoAtacar);

    // Estado interno para armazenar rotação: Map<personagemNome, acao>
    const rotacao = new Map();

    // Inicializa personagem e ação escolhidos para selects
    let personagemEscolhido = userData.equipe[0];
    let acaoEscolhida = "ataque_normal";

    // Função para achar personagem no array de personagens do usuário
    const acharPersonagem = (nome) => {
      return userData.personagens.find(
        (p) => p.nome.toLowerCase() === nome.toLowerCase()
      );
    };

    const textoRotacao = () => {
      if (rotacao.size === 0) return "Nenhuma rotação definida.";
      let texto = "";
      let i = 1;
      for (const [nome, acao] of rotacao) {
        texto += `${i}. ${nome} - ${acao}\n`;
        i++;
      }
      return texto;
    };

    const mensagem = await interaction.editReply({
      content: `Batalha Iniciada! Vida do inimigo: ${inimigo.vidaAtual}/${inimigo.vidaMax}\nRotação:\n${textoRotacao()}`,
      components: [rowPersonagem, rowAcao, rowBotao],
    });

    const collector = mensagem.createMessageComponentCollector({
      time: 120_000,
      filter: (i) => i.user.id === userId,
    });

    collector.on("collect", async (i) => {
      if (i.user.id !== userId) {
        return i.reply({
          content: "Esses controles não são para você!",
          ephemeral: true,
        });
      }

      if (i.isStringSelectMenu()) {
        if (i.customId === "select_personagem") {
          personagemEscolhido = i.values[0];
          if (!rotacao.has(personagemEscolhido)) {
            rotacao.set(personagemEscolhido, acaoEscolhida);
          }
          await i.deferReply();
          await i.followUp({
            content: `Personagem escolhido: ${personagemEscolhido}\nRotação atualizada.`,
            ephemeral: true,
          });
        } else if (i.customId === "select_acao") {
          acaoEscolhida = i.values[0];
          rotacao.set(personagemEscolhido, acaoEscolhida);
          await i.followUp({
            content: `Ação escolhida: ${acaoEscolhida}\nRotação atualizada.`,
            ephemeral: true,
          });
        }

        await i.editReply({
          content: `Batalha Iniciada! Vida do inimigo: ${inimigo.vidaAtual}/${inimigo.vidaMax}\nRotação:\n${textoRotacao()}`,
          components: [rowPersonagem, rowAcao, rowBotao],
        });
      }

      if (i.isButton() && i.customId === "botao_atacar") {
        if (rotacao.size === 0) {
          return i.reply({
            content: "A rotação está vazia! Selecione personagens e ações.",
            ephemeral: true,
          });
        }

        // Executa a rotação completa
        let logCombate = [];

        for (const [personagemNome, acaoAtual] of rotacao) {
          const personagemAtual = acharPersonagem(personagemNome);

          if (!personagemAtual) {
            logCombate.push(`${personagemNome}: personagem não encontrado.`);
            continue;
          }

          if (personagemAtual.atributos.hp <= 0) {
            logCombate.push(`${personagemNome}: está morto e não pode agir.`);
            continue;
          }

          const ultUsada = acaoAtual === "supremo";

          const dpsAtkTotal = userData.personagens
            .filter(
              (p) =>
                typeof p.papel === "string" && p.papel.toUpperCase() === "DPS"
            )
            .reduce((sum, p) => sum + p.atributos.atk, 0);

          const resultado = this.calculaDano(
            personagemAtual,
            acaoAtual,
            inimigo.elemento,
            userData.personagens,
            { ultUsada, dpsAtkTotal }
          );

          inimigo.vidaAtual -= resultado.dano;
          if (inimigo.vidaAtual < 0) inimigo.vidaAtual = 0;

          // Dano inimigo contra personagem
          const critInimigo = Math.random() * 100 <= inimigo.taxaCritica;
          let danoInimigo = inimigo.ataque;
          if (critInimigo) danoInimigo *= 1 + inimigo.danoCritico / 100;

          personagemAtual.atributos.hp -= danoInimigo;

          logCombate.push(
            `${personagemAtual.nome} usou ${acaoAtual} causando ${resultado.dano} dano${
              resultado.critico ? " 💥 CRÍTICO" : ""
            }${
              resultado.multiplicadorReacao > 1
                ? ` (Reação x${resultado.multiplicadorReacao.toFixed(2)})`
                : ""
            }`
          );
          logCombate.push(
            `→ Recebeu dano inimigo: ${Math.floor(danoInimigo)}${
              critInimigo ? " 💥 CRÍTICO" : ""
            } | HP restante: ${Math.max(0, personagemAtual.atributos.hp)}`
          );

          if (inimigo.vidaAtual <= 0) break;
        }

        const embed = new EmbedBuilder()
          .setTitle("Batalha no Abismo")
          .setDescription(
            `**Inimigo:** ${inimigo.nome}\nVida: ${inimigo.vidaAtual}/${inimigo.vidaMax}\n\n${logCombate.join(
              "\n"
            )}`
          )
          .setColor(inimigo.vidaAtual <= 0 ? "Green" : "Yellow");

        await i.editReply({
          content: `Batalha em andamento!\nVida do inimigo: ${inimigo.vidaAtual}/${inimigo.vidaMax}\nRotação:\n${textoRotacao()}`,
          embeds: [embed],
          components: [rowPersonagem, rowAcao, rowBotao],
        });

        if (inimigo.vidaAtual <= 0) {
          collector.stop("inimigo-derrotado");
        }
      }
    });

    collector.on("end", async (_collected, reason) => {
      let mensagemFinal = "";

      if (reason === "inimigo-derrotado") {
        mensagemFinal = "Parabéns! Você derrotou o inimigo!";
      } else if (reason === "time") {
        mensagemFinal = "Tempo da batalha acabou.";
      } else {
        mensagemFinal = `Batalha finalizada. Motivo: ${reason}`;
      }

      await interaction.editReply({
        content: `${mensagemFinal}\nVida do inimigo: ${inimigo.vidaAtual}/${inimigo.vidaMax}\nRotação:\n${textoRotacao()}`,
        components: [],
        embeds: [],
      });
    });
  }
}

module.exports = Abismo;
