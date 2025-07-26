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

    this.camaras = Array.from({ length: 12 }, (_, c) => {
      const nivelCamara = Math.floor(((c + 1) / 12) * 100);
      return {
        nivel: nivelCamara,
        pisos: Array.from({ length: 3 }, (_, p) => {
          const vidaBase = 5000 + c * 2000 + p * 1000;
          const ataqueBase = 300 + c * 100 + p * 50;
          return {
            nome: `Inimigo Câmara ${c + 1} Piso ${p + 1}`,
            vida: vidaBase,
            ataque: ataqueBase,
            elemento: ["Pyro", "Hydro", "Cryo", "Electro", "Dendro"][(c + p) % 5],
            nivel: nivelCamara,
          };
        }),
      };
    });
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
    const atk = personagem.atributos.atk;
    const talentos = personagem.talentos;
    switch (acao) {
      case "ataque_normal":
        return talentos.ataqueNormal * bonusPorNivel * atk;
      case "ataque_carga":
        return talentos.ataqueCarga * bonusPorNivel * atk;
      case "habilidade_elemental":
        return talentos.habilidadeElemental * bonusPorNivel * atk;
      case "supremo":
        return talentos.supremo * bonusPorNivel * atk;
      default:
        return 0;
    }
  }

  aplicarBonusPorPapel(personagem, status, equipe, contexto = {}) {
    let novoStatus = { ...status };
    const papel = (personagem.papel || "").toUpperCase();

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
            .filter(p => (p.papel || "").toUpperCase() === "DPS")
            .reduce((sum, p) => sum + p.atributos.atk, 0);
          novoStatus.danoTotal += personagem.atributos.atk * 0.15 * dpsAtkTotal;
        } else if (personagem.nome.toLowerCase() === "furina") {
          novoStatus.danoTotal += personagem.atributos.hp * 0.1;
        } else if (personagem.nome.toLowerCase() === "faruzan") {
          novoStatus.profElementalBonus = (novoStatus.profElementalBonus || 0) + 0.1;
        }
        break;
    }

    return novoStatus;
  }

  calcularReacao(elementoA, elementoB, bonus = 0) {
    const reacoes = {
      Pyro: { Hydro: 1.5, Cryo: 2.0, Electro: 1.5, Dendro: 1.5 },
      Hydro: { Pyro: 2.0, Electro: 1.5, Cryo: 1.5 },
      Cryo: { Pyro: 1.5, Electro: 1.5, Hydro: 1.5 },
      Electro: { Hydro: 2.0, Pyro: 1.5, Cryo: 1.5 },
      Dendro: { Hydro: 2.0, Pyro: 1.5 },
    };
    return (reacoes[elementoA]?.[elementoB] || 1.0) + bonus;
  }

  calculaDano(personagem, acao, inimigoElemento, equipe, contexto = {}, inimigoNivel = 0) {
    let status = {
      atk: personagem.atributos.atk,
      taxaCritica: personagem.atributos.taxaCritica,
      danoCritico: personagem.atributos.danoCritico,
      recargaEnergia: personagem.atributos.recargaEnergia,
      danoTotal: 0,
      curaBonus: 0,
      escudoBonus: 0,
      profElementalBonus: 0,
    };

    status = this.aplicarConstelacoes(personagem, status, acao, contexto);
    status.danoTotal += this.bonusNivelHabilidades(personagem, acao);
    status = this.aplicarBonusPorPapel(personagem, status, equipe, contexto);

    const mult = {
      ataque_normal: 1.0,
      ataque_carga: 1.5,
      habilidade_elemental: 2.0,
      supremo: 3.5,
    }[acao] || 1.0;

    let dano = status.atk * mult * (1 + status.danoTotal / 100);
    if (inimigoNivel > personagem.nivel) {
      const diff = inimigoNivel - personagem.nivel;
      const reducao = Math.min(diff * 0.02, 0.5);
      dano *= 1 - reducao;
    }

    const chance = Math.random() * 100;
    const critico = chance <= Math.min(status.taxaCritica, 100);
    if (critico) dano *= 1 + status.danoCritico / 100;

    const multReacao = this.calcularReacao(personagem.elemento, inimigoElemento, status.profElementalBonus);
    dano *= multReacao;

    return {
      dano: Math.floor(dano),
      critico,
      multiplicadorReacao: multReacao,
      curaBonus: status.curaBonus,
      escudoBonus: status.escudoBonus,
      reducaoDanoPercent: inimigoNivel > personagem.nivel
        ? Math.round((1 - dano / (status.atk * mult * (1 + status.danoTotal / 100) * multReacao)) * 100)
        : 0,
    };
  }

  async comando(interaction) {
    const userId = interaction.user.id;
    const Usuarios = this.client.userdb;
    const userData = await Usuarios.findOne({ id: userId });

    if (!userData || !userData.equipe.length) {
      return interaction.editReply("Você precisa montar sua equipe primeiro.");
    }

    let camaraAtual = userData.abismo?.camara || 0;
    let pisoAtual = userData.abismo?.piso || 0;

    if (camaraAtual >= this.camaras.length) {
      return interaction.editReply("Parabéns! Você completou todas as câmaras do Abismo!");
    }

    const piso = this.camaras[camaraAtual].pisos[pisoAtual];
    if (!piso) {
      return interaction.editReply("Parabéns! Você completou todos os pisos desta câmara!");
    }

    let inimigo = {
      nome: piso.nome,
      vidaMax: piso.vida,
      vidaAtual: piso.vida,
      elemento: piso.elemento,
      ataque: piso.ataque,
      taxaCritica: 10 + camaraAtual * 2,
      danoCritico: 50 + camaraAtual * 2,
      nivel: piso.nivel,
    };

    const selectPersonagem = new StringSelectMenuBuilder()
      .setCustomId("select_personagem")
      .setPlaceholder("Escolha o personagem")
      .addOptions(userData.equipe.map(nome => ({ label: nome, value: nome })));

    const selectAcao = new StringSelectMenuBuilder()
      .setCustomId("select_acao")
      .setPlaceholder("Escolha a ação")
      .addOptions([
        { label: "Ataque Normal", value: "ataque_normal" },
        { label: "Ataque Carregado", value: "ataque_carga" },
        { label: "Habilidade Elemental", value: "habilidade_elemental" },
        { label: "Supremo", value: "supremo" },
      ]);

    const botao = new ButtonBuilder().setCustomId("botao_atacar").setLabel("Atacar").setStyle(ButtonStyle.Danger);

    const rowPersonagem = new ActionRowBuilder().addComponents(selectPersonagem);
    const rowAcao = new ActionRowBuilder().addComponents(selectAcao);
    const rowBotao = new ActionRowBuilder().addComponents(botao);

    let rotacao = [];
    let personagemEscolhido = userData.equipe[0];
    let acaoEscolhida = "ataque_normal";

    const acharPersonagem = nome =>
      userData.personagens.find(p => p.nome.toLowerCase() === nome.toLowerCase());

    const textoRotacao = () =>
      rotacao.length === 0 ? "Nenhuma rotação definida." :
        rotacao.map((r, i) => `${i + 1}. ${r.personagem} - ${r.acao}`).join("\n");

    const mensagem = await interaction.editReply({
      content: `Batalha iniciada!\nInimigo: ${inimigo.nome} (Nível ${inimigo.nivel})\nVida: ${inimigo.vidaAtual}/${inimigo.vidaMax}\nRotação:\n${textoRotacao()}`,
      components: [rowPersonagem, rowAcao, rowBotao],
    });

    const collector = mensagem.createMessageComponentCollector({
      time: 180_000,
      filter: i => i.user.id === userId,
    });

    collector.on("collect", async i => {
      if (i.customId === "select_personagem") {
        personagemEscolhido = i.values[0];
        if (!rotacao.find(r => r.personagem === personagemEscolhido)) {
          rotacao.push({ personagem: personagemEscolhido, acao: acaoEscolhida });
        }
      } else if (i.customId === "select_acao") {
        acaoEscolhida = i.values[0];
        const idx = rotacao.findIndex(r => r.personagem === personagemEscolhido);
        if (idx !== -1) rotacao[idx].acao = acaoEscolhida;
      } else if (i.customId === "botao_atacar") {
        if (rotacao.length === 0) {
          return i.reply({ content: "A rotação está vazia!", ephemeral: true });
        }

        let log = [];
        for (const { personagem, acao } of rotacao) {
          const p = acharPersonagem(personagem);
          if (!p || p.atributos.hp <= 0) continue;

          const resultado = this.calculaDano(p, acao, inimigo.elemento, userData.personagens, {
            ultUsada: acao === "supremo",
            dpsAtkTotal: userData.personagens.filter(x => (x.papel || "").toUpperCase() === "DPS").reduce((a, b) => a + b.atributos.atk, 0)
          }, inimigo.nivel);

          inimigo.vidaAtual -= resultado.dano;
          if (inimigo.vidaAtual < 0) inimigo.vidaAtual = 0;

          const critInimigo = Math.random() * 100 < inimigo.taxaCritica;
          let danoInimigo = inimigo.ataque * (critInimigo ? 1 + inimigo.danoCritico / 100 : 1);
          p.atributos.hp -= Math.floor(danoInimigo);

          log.push(`${p.nome} usou ${acao}, causando ${resultado.dano}${resultado.critico ? " 💥 CRÍTICO" : ""}`);
          log.push(`→ Sofreu ${Math.floor(danoInimigo)} de dano | HP: ${Math.max(0, p.atributos.hp)}`);

          if (inimigo.vidaAtual <= 0) break;
        }

        const embed = new EmbedBuilder()
          .setTitle("Batalha no Abismo")
          .setDescription(`Inimigo: ${inimigo.nome}\nVida restante: ${inimigo.vidaAtual}/${inimigo.vidaMax}\n\n${log.join("\n")}`)
          .setColor(inimigo.vidaAtual <= 0 ? "Green" : "Yellow");

        await i.update({
          content: `Rotação:\n${textoRotacao()}`,
          embeds: [embed],
          components: [rowPersonagem, rowAcao, rowBotao],
        });

        if (inimigo.vidaAtual <= 0) {
          pisoAtual++;
          if (pisoAtual >= 3) {
            pisoAtual = 0;
            if (camaraAtual < 11) camaraAtual++;
            else {
              await i.followUp({ content: `🎊 Você completou todas as câmaras!`, ephemeral: true });
              collector.stop("abismo-finalizado");
              return;
            }
          }

          for (const p of userData.personagens) p.atributos.hp = p.atributos.hpMax || 1000;

          userData.abismo = { camara: camaraAtual, piso: pisoAtual };
          await Usuarios.updateOne(
            { id: userId },
            {
              personagens: userData.personagens,
              "abismo.camara": camaraAtual,
              "abismo.piso": pisoAtual,
              $inc: { primogemas: 200 }
            }
          );

          await i.followUp({
            content: `🎉 Vitória! Você ganhou 200 primogemas.\nNova Câmara: ${camaraAtual + 1}, Piso: ${pisoAtual + 1}`,
            ephemeral: true,
          });

          collector.stop("inimigo-derrotado");
        }
      }

      if (i.isStringSelectMenu()) {
        await i.update({
          content: `Inimigo: ${inimigo.nome} (Nível ${inimigo.nivel})\nVida: ${inimigo.vidaAtual}/${inimigo.vidaMax}\nRotação:\n${textoRotacao()}`,
          components: [rowPersonagem, rowAcao, rowBotao],
        });
      }
    });

    collector.on("end", async (_collected, reason) => {
      if (reason !== "inimigo-derrotado" && reason !== "abismo-finalizado") {
        await interaction.editReply({
          content: `Batalha encerrada. Motivo: ${reason}`,
          components: [],
        });
      }
    });
  }
}

module.exports = Abismo;
