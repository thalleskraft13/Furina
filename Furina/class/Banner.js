const personagens = require("./data/personagens");

class Banner {
  constructor(client) {
    this.client = client;

    // Personagens
    this.t5 = personagens.t5; // limitados
    this.t5_arma = personagens.t5_arma;
    this.t4 = personagens.t4;
    this.t5_mochileiro = personagens.t5_mochileiro;
    this.t4_mochileiro = personagens.t4_mochileiro;
    this.regional = personagens.regional.personagens; // todos 5★

    // Elementos
    this.personagensElementos = {};
    for (const [elemento, lista] of Object.entries(personagens.elementos)) {
      for (const nome of lista) this.personagensElementos[nome] = elemento;
    }

    // Armas
    this.armas = {
      t3: ["Espada do Viajante", "Lâmina Fria", "Arco de Caçador"],
      t4: ["Espada do Sacrifício", "Arco do Sacrifício", "Catalisador do Sacrifício", "Claymore do Sacrifício"],
      t5: this.t5_arma
    };

    // IDs armas
    this.armasMap = {};
    let armaIdCounter = 1;
    for (const raridade in this.armas) {
      for (const armaNome of this.armas[raridade]) {
        this.armasMap[armaNome] = armaIdCounter.toString().padStart(2, "0");
        armaIdCounter++;
      }
    }

    // IDs personagens
    this.personagensMap = {};
    let persoIdCounter = 1;
    const personagensUnicos = new Set([
      ...this.t5,
      ...this.t4.flat(),
      ...this.t5_mochileiro,
      ...this.t4_mochileiro,
      ...this.regional
    ]);
    for (const nome of personagensUnicos) {
      this.personagensMap[nome] = persoIdCounter.toString().padStart(2, "0");
      persoIdCounter++;
    }
  }

  async push(pity, userId, value, bannerId = "1") {
    if (!pity || typeof pity !== "object") pity = {};
    pity.five = Number(pity.five) || 0;
    pity.four = Number(pity.four) || 0;
    pity.garantia5 = Boolean(pity.garantia5);

    const userdb = await this.client.userdb.findOne({ id: userId }) ||
      new this.client.userdb({
        id: userId,
        gacha: {
          pity: { five: 0, four: 0, garantia5: false },
          pityMochileiro: { five: 0, four: 0 },
          regional: { five: 0, four: 0 },
          arma: { five: 0, four: 0 }
        },
        personagens: [],
        armas: [],
        primogemas: 0,
        premium: 0,
        notificar: true
      });

    const agora = Date.now();
    const isPremium = userdb.premium && userdb.premium > agora;
    const maxPity = isPremium ? 60 : 90;

    const resultado = [];

    for (let i = 0; i < value; i++) {
      pity.five++;
      pity.four++;

      const sorteio = Math.random() * 100;
      let got = null;
      let raridade = 3;

      // --- 5★ ---
      let chance5 = 0.6;
      if (pity.five >= maxPity - 15) chance5 += (pity.five - (maxPity - 15) + 1) * 6;

      if (pity.five >= maxPity || sorteio < chance5) {
        pity.five = 0;
        raridade = 5;

        if (bannerId === "mochileiro") {
          got = Math.random() < 0.5
            ? this.t5_mochileiro[Math.floor(Math.random() * this.t5_mochileiro.length)]
            : this.armas.t5[Math.floor(Math.random() * this.armas.t5.length)];
        } else if (bannerId === "regional") {
          got = this.regional[Math.floor(Math.random() * this.regional.length)];
        } else if (bannerId === "armas") {
          got = this.armas.t5[Math.floor(Math.random() * this.armas.t5.length)];
        } else {
          got = pity.garantia5 || Math.random() < 0.5
            ? this.t5[0]
            : this.t5_mochileiro[Math.floor(Math.random() * this.t5_mochileiro.length)];
        }

        pity.garantia5 = !pity.garantia5;
        const type = this.personagensElementos[got] ? "Personagem" : "Arma";
        const id = type === "Personagem" ? this.personagensMap[got] : this.armasMap[got];
        resultado.push({ type, raridade, nome: got, id });
        continue;
      }

      // --- 4★ ---
      if (pity.four >= 10 || sorteio < 5.1) {
        pity.four = 0;
        raridade = 4;

        if (bannerId === "mochileiro") {
          got = Math.random() < 0.5
            ? this.t4_mochileiro[Math.floor(Math.random() * this.t4_mochileiro.length)]
            : this.armas.t4[Math.floor(Math.random() * this.armas.t4.length)];
        } else if (bannerId === "armas") {
          got = this.armas.t4[Math.floor(Math.random() * this.armas.t4.length)];
        } else if (bannerId === "regional") {
          got = this.t4_mochileiro[Math.floor(Math.random() * this.t4_mochileiro.length)];
        } else {
          got = Math.random() < 0.5
            ? this.t4[0][Math.floor(Math.random() * this.t4[0].length)]
            : this.armas.t4[Math.floor(Math.random() * this.armas.t4.length)];
        }

        const type = this.personagensElementos[got] ? "Personagem" : "Arma";
        const id = type === "Personagem" ? this.personagensMap[got] : this.armasMap[got];
        resultado.push({ type, raridade, nome: got, id });
        continue;
      }

      // --- 3★ ---
      got = this.armas.t3[Math.floor(Math.random() * this.armas.t3.length)];
      raridade = 3;
      resultado.push({ type: "Arma", raridade, nome: got, id: this.armasMap[got] });
    }

    // Atualiza no banco
    for (const { type, nome, raridade } of resultado) {
      if (type === "Personagem") {
        const index = userdb.personagens.findIndex(p => p.nome === nome);
        const elemento = this.personagensElementos[nome] || "Anemo";
        if (index === -1) {
          userdb.personagens.push({
            nome,
            c: 0,
            level: 0,
            ascensao: 0,
            xp: 0,
            elemento,
            atributos: { hp:1000, atk:100, def:50, recargaEnergia:100, taxaCritica:5, danoCritico:50, bonusPyro:0, bonusHydro:0, bonusElectro:0, bonusCryo:0, bonusAnemo:0, bonusGeo:0, bonusDendro:0, bonusFisico:0 },
            talentos: { ataqueNormal:1, ataqueCarga:1, habilidadeElemental:1, supremo:1 }
          });
        } else userdb.personagens[index].c++;
      } else if (type === "Arma") {
        const index = userdb.armas.findIndex(a => a.nome === nome);
        if (index === -1) {
          userdb.armas.push({ nome, raridade, level: 1, exp: 0, equipado: false });
        }
      }
    }

    // Atualiza pity
    if (bannerId === "mochileiro") userdb.gacha.pityMochileiro = pity;
    else if (bannerId === "regional") userdb.gacha.regional = pity;
    else if (bannerId === "armas") userdb.gacha.arma = pity;
    else userdb.gacha.pity = pity;

    await userdb.save();
    return resultado;
  }
}

module.exports = Banner;
