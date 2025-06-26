// Banner.js
class Banner {
  constructor(client) {
    this.client = client;
    this.version = "1.0";

    this.t5 = "YaeMiko";
    this.t4 = ["ShikanoinHeizou", "Layla", "Thoma"];
    this.t5_mochileiro = ["Mona", "Diluc", "Qiqi", "Jean", "Keqing"];
    this.t4_mochileiro = ["Noelle", "Barbara", "Charlotte", "Chongyun", "Mika"];

    this.personagensElementos = {
      Furina: "Hydro",
      YaeMiko: "Electro",
      ShikanoinHeizou: "Anemo",
      Layla: "Cryo",
      Thoma: "Pyro",

      Mona: "Hydro",
      Diluc: "Pyro",
      Qiqi: "Cryo",
      Jean: "Anemo",
      Keqing: "Electro",

      Charlotte: "Cryo",
      Chongyun: "Cryo",
      Mika: "Electro",

      Noelle: "Geo",
      Barbara: "Hydro",
    };
  }

  async push(pity, userId, value) {
    if (!pity || typeof pity !== "object") pity = {};
    if (typeof pity.five !== "number") pity.five = 0;
    if (typeof pity.four !== "number") pity.four = 0;
    if (typeof pity.garantia5 !== "boolean") pity.garantia5 = false;

    const resultado = [];

    let userdb = await this.client.userdb.findOne({ id: userId });
    if (!userdb) {
      userdb = new this.client.userdb({
        id: userId,
        gacha: { pity: {} },
        personagens: [],
        primogemas: 0,
        premium: 0
      });
    }

    // Verificar se premium ainda está ativo
    const agora = Date.now();
    const isPremium = userdb.premium && userdb.premium > agora;

    // Custo
    const custo = value * 160;
    userdb.primogemas -= custo;

    // Define pity máximo (60 para premium, 90 para normal)
    const maxPity = isPremium ? 60 : 90;

    for (let i = 0; i < value; i++) {
      pity.five++;
      pity.four++;

      const sorteio = Math.random() * 100;
      let got = null;

      let chance5 = 0.6;
      if (pity.five >= maxPity - 15) chance5 += (pity.five - (maxPity - 15) + 1) * 6;

      if (pity.five >= maxPity || sorteio < chance5) {
        pity.five = 0;

        if (pity.garantia5 || Math.random() < 0.5) {
          got = this.t5;
          pity.garantia5 = false;
        } else {
          got = this.t5_mochileiro[Math.floor(Math.random() * this.t5_mochileiro.length)];
          pity.garantia5 = true;
        }

        resultado.push({ raridade: 5, personagem: got });

        // Se for premium, chance de 50% de vir 2 5★ no mesmo pull
        if (isPremium && Math.random() < 0.5 && i + 1 < value) {
          let got2 = null;
          if (pity.garantia5 || Math.random() < 0.5) {
            got2 = this.t5;
            pity.garantia5 = false;
          } else {
            got2 = this.t5_mochileiro[Math.floor(Math.random() * this.t5_mochileiro.length)];
            pity.garantia5 = true;
          }
          resultado.push({ raridade: 5, personagem: got2 });
          i++; // conta esse segundo tiro também
        }

        continue;
      }

      if (pity.four >= 10 || sorteio < 5.1) {
        pity.four = 0;

        const isPromocional = Math.random() < 0.5;
        if (isPromocional) {
          got = this.t4[Math.floor(Math.random() * this.t4.length)];
        } else {
          got = this.t4_mochileiro[Math.floor(Math.random() * this.t4_mochileiro.length)];
        }

        resultado.push({ raridade: 4, personagem: got });
        continue;
      }

      got = "Arma 3★";
      resultado.push({ raridade: 3, personagem: got });
    }

    if (!Array.isArray(userdb.personagens)) {
      userdb.personagens = [];
    }

    userdb.gacha.pity.five = pity.five;
    userdb.gacha.pity.four = pity.four;
    userdb.gacha.pity.garantia5 = pity.garantia5;

    resultado.forEach(({ personagem }) => {
      if (personagem === "Arma 3★") return;

      const pIndex = userdb.personagens.findIndex(p => p.nome === personagem);
      const elemento = this.personagensElementos[personagem] || "Anemo";

      if (pIndex === -1) {
        userdb.personagens.push({
          nome: personagem,
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
            bonusFisico: 0,
          },
          elemento: elemento,
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

    return resultado;
  }

  async getBanner() {
    return {
      t5: this.t5,
      t4: this.t4,
      version: this.version,
    };
  }
}

module.exports = Banner;
