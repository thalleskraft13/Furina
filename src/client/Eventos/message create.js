const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  evento: "messageCreate",
  run: async (client, message) => {
    if (message.author.bot || !message.guild) return;

    const usuarioId = message.author.id;
    const servidorId = message.guild.id;

    await client.RankAventureiro.addXp(usuarioId, 5, message.guild);

    try {
      // Busca o usuário
      let userdb = await client.userdb.findOne({ id: usuarioId });

      // Se não existir, cria um novo documento
      if (!userdb) {
        userdb = new client.userdb({
          id: usuarioId,
          itens: []
        });
      }

      // Garantir que 'itens' é um array
      if (!Array.isArray(userdb.itens)) userdb.itens = [];

      // Quantidade aleatória entre 20 e 50
      const quantidadeAleatoria = Math.floor(Math.random() * 31) + 20;

      // Procura índice do item "Material de Elevação"
      const itemIndex = userdb.itens.findIndex(i => i.nome === "Material de Elevação");

      if (itemIndex === -1) {
        // Não tem o item, adiciona
        userdb.itens.push({
          nome: "Material de Elevação",
          quantidade: quantidadeAleatoria
        });
      } else {
        // Já tem, incrementa a quantidade
        userdb.itens[itemIndex].quantidade = (userdb.itens[itemIndex].quantidade || 0) + quantidadeAleatoria;

        // Marca o campo como modificado para Mongoose detectar
        userdb.markModified('itens');
      }

      // Se for servidor específico, adiciona 100 primogemas
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

      // Se premium ativo, adiciona 5 primogemas
      if (userdb.premium && userdb.premium > Date.now()) {
        userdb.primogemas += 5;
      }

      // Salva o usuário com tratamento de erro
      try {
        await userdb.save();
      } catch (err) {
        console.error("Erro ao salvar usuário:", err);
      }

      if (!userdb.guilda) return;

      // Continua sua lógica de guilda e missão
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

    if (
      message.content === `<@${client.user.id}>` ||
      message.content === `<@!${client.user.id}>`
    ) {
      await message.reply({
        content:
          "🎭 Oh~ Você ousou mencionar a grandiosa Furina? Excelente escolha! Explore todo o meu esplendor no meu site de comandos!",
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("Website")
              .setURL(client.website + "/comandos")
              .setStyle(ButtonStyle.Link)
          ),
        ],
      });
      return;
    }

    const messageWords = message.content.toLowerCase().match(/\b\w+\b/g);

    if (messageWords && messageWords.length > 0) {
      try {
        const msgAutoList = await client.MsgAuto.find({ serverId: message.guild.id });

        for (const word of messageWords) {
          const matched = msgAutoList.find(
            (item) => item.chaveDeMsg.toLowerCase() === word
          );
          if (matched) {
            await message.reply(matched.resposta);
            break;
          }
        }
      } catch (error) {
        console.error("Erro ao buscar mensagens automáticas:", error);
      }
    }
  },
};
