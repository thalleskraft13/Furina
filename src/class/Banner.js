class Banner {
  constructor(client) {
    this.client = client;
    this.version = "1.0";

    this.t5 = "Arlecchino";
    this.t4 = ["Chevreuse", "LanYan", "Rosaria"];
    this.t5_mochileiro = ["Mona", "Diluc", "Qiqi", "Jean", "Keqing"];
    this.t4_mochileiro = ["Noelle", "Barbara", "Charlotte", "Chongyun", "Mika", "ShikanoinHeizou", "Layla", "Thoma"];

    this.personagensElementos = {
      Furina: "Hydro",
      YaeMiko: "Electro",
      ShikanoinHeizou: "Anemo",
      Layla: "Cryo",
      Thoma: "Pyro",
      Arlecchino: "Pyro",
      Chevreuse: "Pryo",
      LanYan: "Anemo",
      Rosaria: "Cryo",
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

    let userdb = await this.client.userdb.findOne({ id: userId });
    if (!userdb) {
      userdb = new this.client.userdb({
        id: userId,
        gacha: { pity: {} },
        personagens: [],
        primogemas: 0,
        premium: 0,
        notificar: true,
        conquistas: [],
      });
    }

    const agora = Date.now();
    const isPremium = userdb.premium && userdb.premium > agora;

    const custo = value * 160;
    userdb.primogemas -= custo;

    const maxPity = isPremium ? 60 : 90;

    const resultado = [];
    let totalGiros = 0;
    let total5StarsObtidos = 0;
    let total4StarsObtidos = 0;
    let pity5Count = 0;
    let sequenciaRaros = 0;
    let maxSequenciaRaros = 0;
    let primeiroGiroDia5Star = false;
    let primeiroGiroDia = null;
    let count4Stars = 0;

    for (let i = 0; i < value; i++) {
      pity.five++;
      pity.four++;
      totalGiros++;

      const dataAtual = new Date();
      const dataAtualString = dataAtual.toISOString().slice(0, 10); // YYYY-MM-DD

      if (!primeiroGiroDia) primeiroGiroDia = dataAtualString;

      const sorteio = Math.random() * 100;
      let got = null;
      let raridade = 3;

      let chance5 = 0.6;
      if (pity.five >= maxPity - 15) chance5 += (pity.five - (maxPity - 15) + 1) * 6;

      if (pity.five >= maxPity || sorteio < chance5) {
        pity.five = 0;
        pity5Count++;
        sequenciaRaros++;
        if (sequenciaRaros > maxSequenciaRaros) maxSequenciaRaros = sequenciaRaros;

        if (pity.garantia5 || Math.random() < 0.5) {
          got = this.t5;
          pity.garantia5 = false;
        } else {
          got = this.t5_mochileiro[Math.floor(Math.random() * this.t5_mochileiro.length)];
          pity.garantia5 = true;
        }

        raridade = 5;
        resultado.push({ raridade, personagem: got });
        total5StarsObtidos++;

        // Check primeiro 5* do dia
        if (!primeiroGiroDia5Star && dataAtualString === primeiroGiroDia) {
          primeiroGiroDia5Star = true;
        }

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
          total5StarsObtidos++;
          sequenciaRaros++;
          if (sequenciaRaros > maxSequenciaRaros) maxSequenciaRaros = sequenciaRaros;
          i++;
          totalGiros++;
          
        }

        continue;
      }

      if (pity.four >= 10 || sorteio < 5.1) {
        pity.four = 0;

        sequenciaRaros = 0;

        const isPromocional = Math.random() < 0.5;
        if (isPromocional) {
          got = this.t4[Math.floor(Math.random() * this.t4.length)];
        } else {
          got = this.t4_mochileiro[Math.floor(Math.random() * this.t4_mochileiro.length)];
        }

        raridade = 4;
        resultado.push({ raridade, personagem: got });
        total4StarsObtidos++;
        count4Stars++;

        continue;
      }

      got = "Arma 3★";
      raridade = 3;
      resultado.push({ raridade, personagem: got });

      sequenciaRaros = 0;
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
            supremo: 1,
          },
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

    const tentarAdicionarConquista = async (conquistaId, categoria) => {
      const jaTem = await this.client.conquistas.temConquista(userId, conquistaId);
      if (!jaTem) {
        await this.client.conquistas.addConquista(userId, conquistaId, categoria);

        if (userdb.notificar) {
          try {
            const user = await this.client.users.fetch(userId);

            const info = this.client.conquistasJson.find(x => String(x.id) === String(conquistaId)) || {};
            const nome = info.nome || "Conquista";
            const descricao = info.descricao || "Você desbloqueou uma nova conquista!";

            const embed = new this.client.discord.EmbedBuilder()
              .setTitle("🌊✨ Conquista Desbloqueada!")
              .setDescription(`Você conquistou: **${nome}**\n\n_${descricao}_`)
              .setColor("#00d4ff")
              .setFooter({ text: "Tribunal de Fontaine • Furina do Discord", iconURL: this.client.user.displayAvatarURL() })
              .setTimestamp()
              

            await user.send({ embeds: [embed] }).catch(() => null);
          } catch {
            // Falha ao enviar DM
          }
        }
      }
    };

    if (totalGiros >= 10) {
      await tentarAdicionarConquista(1, "Gacha");
    }
    if (total5StarsObtidos >= 5) {
      await tentarAdicionarConquista(2, "Gacha");
    }
    if (pity5Count >= 3) {
      await tentarAdicionarConquista(3, "Gacha");
    }
    if (totalGiros >= 50) {
      await tentarAdicionarConquista(4, "Gacha");
    }
    if (maxSequenciaRaros >= 2) {
      await tentarAdicionarConquista(5, "Gacha");
    }
    if (primeiroGiroDia5Star) {
      await tentarAdicionarConquista(6, "Gacha");
    }
    if (total4StarsObtidos >= 1) {
      await tentarAdicionarConquista(7, "Gacha");
    }
    if (count4Stars >= 10) {
      await tentarAdicionarConquista(8, "Gacha");
    }

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
