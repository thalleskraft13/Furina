const { EmbedBuilder } = require("discord.js");
const personagens = require("./data/personagens");

class Banner {
  constructor(client) {
    this.client = client;
    this.version = "1.0";

    this.t5 = personagens.t5;
    this.t4 = personagens.t4;
    this.t5_mochileiro = personagens.t5_mochileiro;
    this.t4_mochileiro = personagens.t4_mochileiro;

    this.personagensElementos = {};
    for (const [elemento, lista] of Object.entries(personagens.elementos)) {
      for (const nome of lista) {
        this.personagensElementos[nome] = elemento;
      }
    }

    this.armas = {
      t3: ["Espada do Viajante", "Lâmina Fria", "Arco de Caçador"],
      t4: ["Espada do Sacrifício"],
      t5: ["Espada Celestial"]
    };

    this.armasMap = {};
    let armaIdCounter = 1;
    for (const raridade in this.armas) {
      for (const armaNome of this.armas[raridade]) {
        this.armasMap[armaNome] = armaIdCounter.toString().padStart(2, "0");
        armaIdCounter++;
      }
    }

    this.personagensMap = {};
    let persoIdCounter = 1;
    const personagensUnicos = new Set([
      ...this.t5,
      ...this.t4.flat(),
      ...this.t5_mochileiro,
      ...this.t4_mochileiro
    ]);
    for (const nome of personagensUnicos) {
      this.personagensMap[nome] = persoIdCounter.toString().padStart(2, "0");
      persoIdCounter++;
    }
  }

  async push(pity, userId, value, bannerId = "1") {
    if (!pity || typeof pity !== "object") pity = {};
    if (typeof pity.five !== "number") pity.five = 0;
    if (typeof pity.four !== "number") pity.four = 0;
    if (typeof pity.garantia5 !== "boolean") pity.garantia5 = false;

    let userdb = await this.client.userdb.findOne({ id: userId });
    if (!userdb) {
      userdb = new this.client.userdb({
        id: userId,
        gacha: { pity: {} },
        personagens: [],
        primogemas: 0,
        premium: 0,
        notificar: true,
        conquistas: []
      });
    }

    const agora = Date.now();
    const isPremium = userdb.premium && userdb.premium > agora;

    const custo = value * 160;
    userdb.primogemas -= custo;

    const maxPity = isPremium ? 60 : 90;
    const resultado = [];
    let sequenciaRaros = 0;
    let maxSequenciaRaros = 0;
    let primeiroGiroDia5Star = false;
    let primeiroGiroDia = null;

    const bannerIndex = bannerId === "2" ? 1 : 0;

    for (let i = 0; i < value; i++) {
      pity.five++;
      pity.four++;

      const dataAtual = new Date();
      const dataAtualString = dataAtual.toISOString().slice(0, 10);
      if (!primeiroGiroDia) primeiroGiroDia = dataAtualString;

      const sorteio = Math.random() * 100;
      let got = null;
      let raridade = 3;

      let chance5 = 0.6;
      if (pity.five >= maxPity - 15) chance5 += (pity.five - (maxPity - 15) + 1) * 6;

      if (pity.five >= maxPity || sorteio < chance5) {
        pity.five = 0;
        sequenciaRaros++;

        if (sequenciaRaros > maxSequenciaRaros) maxSequenciaRaros = sequenciaRaros;

        if (pity.garantia5) {
          got = this.t5[bannerIndex];
          pity.garantia5 = false;
        } else {
          if (Math.random() < 0.5) {
            got = this.t5[bannerIndex];
            pity.garantia5 = false;
          } else {
            got = this.t5_mochileiro[Math.floor(Math.random() * this.t5_mochileiro.length)];
            pity.garantia5 = true;
          }
        }

        raridade = 5;
        const type = this.personagensElementos[got] ? "Personagem" : "Arma";
        const id = type === "Personagem" ? this.personagensMap[got] : this.armasMap[got];
        resultado.push({ type, raridade, nome: got, id });

        if (!primeiroGiroDia5Star && dataAtualString === primeiroGiroDia) {
          primeiroGiroDia5Star = true;
        }

        if (isPremium && Math.random() < 0.5 && i + 1 < value) {
          let got2;
          if (pity.garantia5) {
            got2 = this.t5[bannerIndex];
            pity.garantia5 = false;
          } else {
            if (Math.random() < 0.5) {
              got2 = this.t5[bannerIndex];
              pity.garantia5 = false;
            } else {
              got2 = this.t5_mochileiro[Math.floor(Math.random() * this.t5_mochileiro.length)];
              pity.garantia5 = true;
            }
          }

          const type2 = this.personagensElementos[got2] ? "Personagem" : "Arma";
          const id2 = type2 === "Personagem" ? this.personagensMap[got2] : this.armasMap[got2];
          resultado.push({ type: type2, raridade: 5, nome: got2, id: id2 });

          sequenciaRaros++;
          if (sequenciaRaros > maxSequenciaRaros) maxSequenciaRaros = sequenciaRaros;

          i++;
        }

        continue;
      }

      if (pity.four >= 10 || sorteio < 5.1) {
        pity.four = 0;
        sequenciaRaros = 0;

        if (Math.random() < 0.5) {
          if (Math.random() < 0.5) {
            const t4list = this.t4[bannerIndex];
            got = t4list[Math.floor(Math.random() * t4list.length)];
          } else {
            got = this.t4_mochileiro[Math.floor(Math.random() * this.t4_mochileiro.length)];
          }
        } else {
          got = this.armas.t4[Math.floor(Math.random() * this.armas.t4.length)];
        }

        raridade = 4;
        const type = this.personagensElementos[got] ? "Personagem" : "Arma";
        const id = type === "Personagem" ? this.personagensMap[got] : this.armasMap[got];
        resultado.push({ type, raridade, nome: got, id });

        continue;
      }

      got = this.armas.t3[Math.floor(Math.random() * this.armas.t3.length)];
      raridade = 3;
      const type = "Arma";
      const id = this.armasMap[got];
      resultado.push({ type, raridade, nome: got, id });

      sequenciaRaros = 0;
    }

    if (!Array.isArray(userdb.personagens)) {
      userdb.personagens = [];
    }

    userdb.gacha.pity.five = pity.five;
    userdb.gacha.pity.four = pity.four;
    userdb.gacha.pity.garantia5 = pity.garantia5;

    resultado.forEach(({ type, nome }) => {
      if (type !== "Personagem") return;

      const pIndex = userdb.personagens.findIndex(p => p.nome === nome);
      const elemento = this.personagensElementos[nome] || "Anemo";

      if (pIndex === -1) {
        userdb.personagens.push({
          nome,
          c: 0,
          level: 0,
          ascensao: 0,
          xp: 0,
          atributos: {
            hp: 1000,
            atk: 100,
            def: 50,
            recargaEnergia: 100,
            taxaCritica: 5,
            danoCritico: 50,
            bonusPyro: 0,
            bonusHydro: 0,
            bonusElectro: 0,
            bonusCryo: 0,
            bonusAnemo: 0,
            bonusGeo: 0,
            bonusDendro: 0,
            bonusFisico: 0
          },
          elemento,
          talentos: {
            ataqueNormal: 1,
            ataqueCarga: 1,
            habilidadeElemental: 1,
            supremo: 1
          }
        });
      } else {
        userdb.personagens[pIndex].c++;
      }
    });

    if (typeof userdb.markModified === "function") {
      userdb.markModified("personagens");
      userdb.markModified("gacha.pity");
    }

    await userdb.save();

    const channelId = "1392956504222597121";
    const restMessenger = this.client.restMessenger;

    const total5 = resultado.filter(i => i.raridade === 5).length;
    const total4 = resultado.filter(i => i.raridade === 4).length;
    const total3 = resultado.filter(i => i.raridade === 3).length;

    let username = `Usuário ${userId}`;
    let avatarURL = null;

    try {
      const user = await restMessenger.buscarUsuario(userId);
      if (user) {
        username = user.username || username;
        if (user.avatar) {
          avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        }
      }
    } catch (err) {
      console.error("[REST] Falha ao buscar dados do usuário:", err);
    }

    const embed = {
      title: "🎯 Resultado de Invocação",
      description: `**${username}** realizou **${value} giros** no banner.`,
      color: 0x5865F2,
      fields: [
        {
          name: "⭐ Quantidade de Itens",
          value: `5★: ${total5}\n4★: ${total4}\n3★: ${total3}`,
          inline: true
        },
        {
          name: "🎁 Itens Obtidos",
          value: resultado.map(r => `**${r.raridade}★** ${r.type} - ${r.nome}`).join("\n").slice(0, 1024)
        }
      ],
      timestamp: new Date().toISOString()
    };

    if (avatarURL) {
      embed.author = {
        name: username,
        icon_url: avatarURL
      };
    }

    await restMessenger.enviar(channelId, { embeds: [embed] });

    // === Conquistas de Gacha ===
    const conquistas = this.client.conquistas;
    const conquistasUsuario = userdb.conquistas.map(c => c.id);
    const desbloquear = async (id) => {
      if (!conquistasUsuario.includes(id)) {
        await conquistas.addConquista(userId, id, "Gacha");
      }
    };

    if (value >= 10) await desbloquear(1); // Dança das Marés da Fortuna
    if (value >= 50) await desbloquear(4); // Correnteza da Sorte

    const personagens5 = resultado.filter(i => i.raridade === 5 && i.type === "Personagem");
    if (personagens5.length >= 5) await desbloquear(2); // Lâmina da Perseverança

    const pityEstourado = pity.five === 0 && value === 1;
    if (pityEstourado) await desbloquear(3); // Sussurro do Vento

    if (value === 1 && resultado.some(i => i.raridade === 5)) {
      await desbloquear(6); // Fulgor das Estrelas Cadentes
    }

    if (!conquistasUsuario.includes(7) && resultado.some(i => i.raridade === 4 && i.type === "Personagem")) {
      const jaTem = userdb.personagens.length > 1;
      if (!jaTem) await desbloquear(7); // Orvalho da Manhã
    }

    return resultado;
  }

  async getBanner() {
    return {
      t5: this.t5,
      t4: this.t4,
      version: this.version
    };
  }
}

module.exports = Banner;
