const db = require("../../Furina/client/mongodb/user");

module.exports = {
  config: {
    name: "addpersonagem",
    description: "Adiciona um personagem ao usuário",
    usage: "f-addpersonagem <nome> <elemento>",
  },

  async run(bot, message, args) {

    if (!message.member.roles.cache.has("1374103804882194546")) {
      return message.reply("❌ Você não tem permissão para usar esse comando.");
    }
    
    const nome = args[0];
    const elemento = args[1] || "Anemo"; // valor padrão se não passar

    if (!nome) {
      return message.reply("❌ Você precisa informar o nome do personagem!");
    }

    // busca ou cria userdb
    let userdb = await db.findOne({ id: message.author.id });
    if (!userdb) {
      userdb = new db({
        id: message.author.id,
        gacha: { pity: { five: 0, four: 0, garantia5: false } },
        personagens: [],
        armas: [],
        primogemas: 0,
        premium: 0,
        notificar: true,
      });
    }

    // verifica se já tem
    const index = userdb.personagens.findIndex(p => p.nome === nome);
    if (index !== -1) {
      userdb.personagens[index].c++;
    } else {
      userdb.personagens.push({
        nome,
        c: 0,
        level: 0,
        ascensao: 0,
        xp: 0,
        elemento,
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
        talentos: {
          ataqueNormal: 1,
          ataqueCarga: 1,
          habilidadeElemental: 1,
          supremo: 1,
        },
      });
    }

    await userdb.save();

    return message.reply(`✅ Personagem **${nome}** adicionado com sucesso ao seu inventário!`);
  },
};
