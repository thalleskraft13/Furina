class Banner {
  constructor(client) {
    this.client = client;
    this.version = "1.0";

    this.t5 = "Furina";
    this.t4 = ["Charlotte", "Chongyun", "Mika"];
    this.t5_mochileiro = ["Mona", "Diluc", "Qiqi", "Jean", "Keqing"];
    this.t4_mochileiro = ["Noelle", "Barbara"];
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
        primogemas: 0
      });
    }

    // Remover primogemas com base na quantidade de tiros
    const custo = value * 160;
    userdb.primogemas -= custo;

    for (let i = 0; i < value; i++) {
      pity.five++;
      pity.four++;

      const sorteio = Math.random() * 100;
      let got = null;

      let chance5 = 0.6;
      if (pity.five >= 75) chance5 += (pity.five - 74) * 6;

      if (pity.five >= 90 || sorteio < chance5) {
        pity.five = 0;

        if (pity.garantia5 || Math.random() < 0.5) {
          got = this.t5;
          pity.garantia5 = false;
        } else {
          got = this.t5_mochileiro[Math.floor(Math.random() * this.t5_mochileiro.length)];
          pity.garantia5 = true;
        }

        resultado.push({ raridade: 5, personagem: got });
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
      if (pIndex === -1) {
        userdb.personagens.push({ nome: personagem, c: 0 });
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
