const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  evento: "messageCreate",
  run: async (client, message) => {
    if (message.author.bot || !message.guild) return;

    const usuarioId = message.author.id;
    const servidorId = message.guild.id;

    await client.RankAventureiro.addXp(usuarioId, 5, message.guild);

    try {
      let userdb = await client.userdb.findOne({ id: usuarioId });

      if (!userdb) {
        userdb = new client.userdb({
          id: usuarioId,
          itens: []
        });
      }

      if (!Array.isArray(userdb.itens)) userdb.itens = [];

      const quantidadeAleatoria = Math.floor(Math.random() * 31) + 20;
      const itemIndex = userdb.itens.findIndex(i => i.nome === "Material de Elevação");

      if (itemIndex === -1) {
        userdb.itens.push({
          nome: "Material de Elevação",
          quantidade: quantidadeAleatoria
        });
      } else {
        userdb.itens[itemIndex].quantidade = (userdb.itens[itemIndex].quantidade || 0) + quantidadeAleatoria;
        userdb.markModified('itens');
      }

      if (servidorId === "1372911248936796231") {
        userdb.primogemas += 100;
      }

      if (servidorId === "1373420276737507489") {
        const cargosDoUsuario = message.member.roles.cache;

        const cargosComGemas = {
          "1398997424885989491": 100,
          "1398997375791665302": 300,
          "1398997336004493333": 500,
          "1398997459694391377": 70,
        };

        for (const [cargoId, gemas] of Object.entries(cargosComGemas)) {
          if (cargosDoUsuario.has(cargoId)) {
            userdb.primogemas += gemas;
          }
        }
      }

      const agora = Date.now();

      if (userdb.premium && userdb.premium > agora) {
        userdb.primogemas += 5;
      }

      const serverdb = await client.serverdb.findOne({ serverId: servidorId });
      const isServerPremium = serverdb?.premium && serverdb.premium > agora;
      const bonusPrimogemasAtivado = serverdb?.mareDouradaConfig?.bonusPrimogemas;

      if (isServerPremium && bonusPrimogemasAtivado) {
        userdb.primogemas += 10;
      }

      try {
        await userdb.save();
      } catch (err) {
        //console.error("Erro ao salvar usuário:", err);
      }

      if (!userdb.guilda) return;

      const guilda = await client.guilda.findOne({ tag: userdb.guilda });
      if (!guilda) return;

      const missaoMsg = guilda.missoes.find(
        (m) => m.tipo === "mensagens" && !m.concluida
      );
      if (!missaoMsg) return;

      missaoMsg.progresso += 1;

      if (missaoMsg.progresso >= missaoMsg.objetivo) {
        missaoMsg.concluida = true;
        missaoMsg.progresso = missaoMsg.objetivo;

        guilda.mora += missaoMsg.recompensa.mora || 0;
        guilda.primogemas += missaoMsg.recompensa.primogemas || 0;
        guilda.xp += missaoMsg.recompensa.xp || 0;
      }

      await guilda.save();

    } catch (err) {
      console.error("Erro ao atualizar missão de mensagens:", err);
    }

    await client.GerenciadorSorteio.tratarMensagem(message);

  }
};