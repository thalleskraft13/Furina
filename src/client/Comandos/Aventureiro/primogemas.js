const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require("discord.js");

module.exports = {
  name: "primogemas",
  description: "Explore seu brilho em primogemas e conquiste o rank dos aventureiros.",
  type: 1,
  options: [
    {
      name: "ver",
      description: "Veja quantas primogemas você ou outro aventureiro possui.",
      type: 1,
      options: [
        {
          name: "usuario",
          description: "Mencione o aventureiro que deseja consultar.",
          type: 6,
          required: false,
        },
      ],
    },
    {
      name: "daily",
      description: "Receba sua recompensa diária de primogemas pelo site.",
      type: 1,
    },
    {
      name: "rank",
      description: "Veja o ranking de primogemas dos aventureiros.",
      type: 1,
      options: [
        {
          name: "pagina",
          description: "Número da página do ranking que deseja ver.",
          type: 4,
          required: false,
        },
      ],
    },
    {
      name: "pagar",
      description: "Transfira primogemas para outro aventureiro.",
      type: 1,
      options: [
        {
          name: "usuario",
          description: "O aventureiro que receberá as primogemas.",
          type: 6,
          required: true,
        },
        {
          name: "quantidade",
          description: "Quantidade de primogemas a transferir.",
          type: 4,
          required: true,
        },
      ],
    },{
  name: "apostar",
  description: "Aposte primogemas no cara ou coroa.",
  type: 1, // Subcomando
  options: [
    {
      name: "quantidade",
      description: "Quantidade de primogemas a apostar (mínimo 100).",
      type: 4, // INTEGER (Number)
      required: true,
    },
    {
      name: "contra",
      description: "Usuário contra quem deseja apostar",
      type: 6, // USER
      required:true,
    }
  ]
}

  ],

  run: async (client, interaction) => {
    try {
      const subcmd = interaction.options.getSubcommand();
      const user = interaction.user;
      await interaction.deferReply()
      if (subcmd === "ver") {
        
        const alvo = interaction.options.getUser("usuario") || user;
        let userdb = await client.userdb.findOne({ id: alvo.id });
        if (!userdb) {
          userdb = new client.userdb({ id: alvo.id, primogemas: 0 });
          await userdb.save();
        }

        const embed = new EmbedBuilder()
          .setTitle("✨ Brilho das Primogemas")
          .setDescription(`Aventureiro ${alvo}, você possui **${userdb.primogemas}** primogemas cintilantes.\nContinue acumulando glórias e tesouros!`)
          .setColor("#3DD1D9")
          .setThumbnail(alvo.displayAvatarURL({ dynamic: true }));

        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

if (subcmd === "daily") {
  let userdb = await client.userdb.findOne({ id: user.id });
  if (!userdb) {
    userdb = new client.userdb({ id: user.id, primogemas: 0, daily: 0, level: { ar: 1 } });
    await userdb.save();
  }

  if (!userdb.level || userdb.level.ar < 17) {
    return interaction.editReply({
      content: "🎭 Ah, bravo aventureiro... apenas aqueles que atingiram o **AR 17** podem tocar as cortinas deste espetáculo diário~",
      ephemeral: true,
    });
  }

  const agora = Date.now();
  const tempoRestante = userdb.daily > agora ? userdb.daily : 0;

  if (tempoRestante > agora) {
    const ts = Math.floor(userdb.daily / 1000);
    return interaction.editReply({
      content: `🎭 Mon cher...! O palco do destino ainda não está pronto para seu próximo ato!\nTente novamente <t:${ts}:R>.`,
      ephemeral: true,
    });
  }

  const confirmarId = client.CustomCollector.create(async (btnInt) => {
    if (btnInt.user.id !== user.id) {
      return btnInt.reply({
        content: "🎭 Apenas o brilhante protagonista desta cena pode tocar esse botão, mon cher~",
        ephemeral: true,
      });
    }

    const min = 500;
    const max = 1200;
    let recompensa = Math.floor(Math.random() * (max - min + 1)) + min;

    if (userdb.premium > Date.now()) {
      recompensa *= 2;
    }

    userdb.primogemas += recompensa;
    userdb.daily = agora + 24 * 60 * 60 * 1000; // 24h
    await userdb.save();

    const ts = Math.floor(userdb.daily / 1000);

    const embed = new EmbedBuilder()
      .setColor("#3DD1D9")
      .setTitle("✨ Recompensa Diária Recebida!")
      .setDescription(
        `🎭 Bravo, bravo! Com um gesto digno de aplausos, você recebeu **${recompensa} primogemas** neste ato diário!\n\n` +
        `O próximo espetáculo poderá ser assistido <t:${ts}:R>.\n\n` +
        `${userdb.premium > Date.now() ? "💎 *O brilho do status Premium duplicou sua recompensa!*" : ""}`
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "— Furina, a Estrela deste palco encantado." });

    await btnInt.update({
      content: "",
      embeds: [embed],
      components: [],
    });

    client.CustomCollector.delete(confirmarId);
  }, { authorId: user.id, timeout: 120000 });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(confirmarId)
      .setLabel("✨ Receber Recompensa")
      .setStyle(ButtonStyle.Primary)
  );

  const embedConfirma = new EmbedBuilder()
    .setColor("#3DD1D9")
    .setTitle("🎭 Seu grande ato aguarda!")
    .setDescription(
      `Ah, mon cher~ Pronto para subir ao palco e receber sua recompensa diária?\n\n` +
      `Clique no botão abaixo e que as cortinas se abram para mais **primogemas** neste grandioso espetáculo!\n\n` +
      `💠 *Você pode ganhar de **500 a 1200 primogemas**...*${userdb.premium > Date.now() ? "\n💎 *E com Premium, o valor será duplicado!*" : ""}`
    )
    .setFooter({ text: "— Furina, orquestrando seu destino com esplendor." });

  await interaction.editReply({
    embeds: [embedConfirma],
    components: [row],
    ephemeral: true,
  });
}

      if (subcmd === "rank") {
  let pagina = interaction.options.getInteger("pagina") || 1;
  if (pagina < 1) pagina = 1;

  const todosUsuarios = await client.userdb.find({}).sort({ primogemas: -1 });
  const totalUsuarios = todosUsuarios.length;
  const itensPorPagina = 5;
  const totalPaginas = Math.ceil(totalUsuarios / itensPorPagina);

  if (pagina > totalPaginas && totalPaginas > 0) pagina = totalPaginas;

  const getDescricaoPagina = async (pg) => {
    const sliceUsuarios = todosUsuarios.slice(
      (pg - 1) * itensPorPagina,
      pg * itensPorPagina
    );

    let descricao = "";
    for (let idx = 0; idx < sliceUsuarios.length; idx++) {
      const u = sliceUsuarios[idx];
      const user = client.users.cache.get(u.id) || await client.users.fetch(u.id).catch(() => null);
      const username = user ? user.username : "Desconhecido";
      descricao += `**${(pg - 1) * itensPorPagina + idx + 1}** - [${username}](https://discord.com/users/${u.id}) com **${u.primogemas}** primogemas\n`;
    }
    if (descricao.length === 0) descricao = "✨ Ainda não há aventureiros registrados no ranking.";
    return descricao;
  };

  const descricao = await getDescricaoPagina(pagina);

  const embedRank = new EmbedBuilder()
    .setTitle(`✨ Ranking das Primogemas — Página ${pagina}/${totalPaginas || 1}`)
    .setDescription(descricao)
    .setColor("#3DD1D9")
    .setFooter({ text: `Mostrando ${Math.min(itensPorPagina, totalUsuarios)} de ${totalUsuarios} aventureiros.` });

  const row = new ActionRowBuilder();

  if (pagina > 1) {
    const prevId = client.CustomCollector.create(async (btnInt) => {
      if (btnInt.user.id !== interaction.user.id) {
        return btnInt.reply({
          content: "✨ Apenas o aventureiro que executou o comando pode usar estes botões.",
          ephemeral: true,
        });
      }
      // Atualiza a página para anterior
      await btnInt.deferUpdate();

      // Reexecutar a lógica para a página anterior
      interaction.options._subcommand = "rank"; // só para manter coerência se usar função geral
      interaction.options._hoistedOptions = [
        { name: "pagina", type: 4, value: pagina - 1 }
      ];
      client.emit("interactionCreate", interaction);
    }, { timeout: 60000 });

    row.addComponents(
      new ButtonBuilder()
        .setCustomId(prevId)
        .setLabel("◀️ Anterior")
        .setStyle(ButtonStyle.Primary)
    );
  }

  if (pagina < totalPaginas) {
    const nextId = client.CustomCollector.create(async (btnInt) => {
      if (btnInt.user.id !== interaction.user.id) {
        return btnInt.reply({
          content: "✨ Apenas o aventureiro que executou o comando pode usar estes botões.",
          ephemeral: true,
        });
      }
      await btnInt.deferUpdate();

      // Reexecutar a lógica para a próxima página
      interaction.options._subcommand = "rank";
      interaction.options._hoistedOptions = [
        { name: "pagina", type: 4, value: pagina + 1 }
      ];
      client.emit("interactionCreate", interaction);
    }, { timeout: 60000 });

    row.addComponents(
      new ButtonBuilder()
        .setCustomId(nextId)
        .setLabel("Próximo ▶️")
        .setStyle(ButtonStyle.Primary)
    );
  }

  await interaction.editReply({ embeds: [embedRank], components: row.components.length ? [row] : [] });
}

if (subcmd === "pagar") {
  const pagador = interaction.user;
  const receptor = interaction.options.getUser("usuario");
  const quantidade = interaction.options.getInteger("quantidade");

  // Verificações iniciais (com respostas ephemeral)
  if (receptor.id === pagador.id) {
    return interaction.editReply({
      content: "✨ Ah, aventureiro, não se pode pagar a si mesmo! Escolha outro para compartilhar suas primogemas.",
      ephemeral: true,
    });
  }


if (receptor.bot && receptor.id !== client.user.id) {
    return interaction.editReply({
      content: "✨ Oh là là! Bots não aceitam primogemas! A não ser que esteja tentando me mimar, claro~",
      ephemeral: true,
    });
  }

  
  if (quantidade <= 0) {
    return interaction.editReply({
      content: "✨ A quantidade deve ser maior que zero, bravo aventureiro!",
      ephemeral: true,
    });
  }

    


  let pagadorDB = await client.userdb.findOne({ id: pagador.id });
  if (!pagadorDB) {
    pagadorDB = new client.userdb({ id: pagador.id, primogemas: 0 });
    await pagadorDB.save();
  }
  let receptorDB = await client.userdb.findOne({ id: receptor.id });
  if (!receptorDB) {
    receptorDB = new client.userdb({ id: receptor.id, primogemas: 0 });
    await receptorDB.save();
  }
  if (pagadorDB.primogemas < quantidade) {
    return interaction.editReply({
      content: `✨ Oh não, aventureiro! Você só possui **${pagadorDB.primogemas}** primogemas e não pode pagar essa quantia.`,
      ephemeral: true,
    });
  }

    if (receptor.id === client.user.id) {
    pagadorDB.primogemas -= quantidade;
    await pagadorDB.save();

    return interaction.editReply({
      content: `💎✨ *Oh mon cher...!* Que gesto generoso! Aceitei **${quantidade}** primogemas com todo o esplendor que mereço.\n\n— *Furina, a Deusa do Palco, agradece humildemente sua oferta!* 🎭`,
      ephemeral: true,
    });
  }


  // Estado da confirmação
  let pagadorConfirmou = false;
  let receptorConfirmou = false;

  // Embed inicial da confirmação
  const embedConfirma = new EmbedBuilder()
    .setTitle("✨ Confirmação de Transferência")
    .setDescription(
      `Você está prestes a enviar **${quantidade}** primogemas para ${receptor}.\n` +
      `**${pagador}** e **${receptor}**, ambos precisam confirmar a transferência abaixo.`
    )
    .setColor("#3DD1D9")
    .setFooter({ text: "Confirme para brilhar com generosidade!" });

  // Botão único para confirmação, o mesmo para os dois
  const customIdConfirm = client.CustomCollector.create(async (btnInt) => {
    if (![pagador.id, receptor.id].includes(btnInt.user.id)) {
      return btnInt.reply({
        content: "✨ Apenas os envolvidos podem usar este botão.",
        ephemeral: true,
      });
    }

    // Marca confirmação do usuário que clicou
    if (btnInt.user.id === pagador.id) {
      if (pagadorConfirmou) {
        return btnInt.reply({
          content: "✨ Você já confirmou a transferência, bravo aventureiro!",
          ephemeral: true,
        });
      }
      pagadorConfirmou = true;
    }
    if (btnInt.user.id === receptor.id) {
      if (receptorConfirmou) {
        return btnInt.reply({
          content: "✨ Você já confirmou a transferência, bravo aventureiro!",
          ephemeral: true,
        });
      }
      receptorConfirmou = true;
    }

    // Atualiza o embed com status
    const statusText = `✨ Status:\n` +
      `- Pagador: ${pagadorConfirmou ? "✅ Confirmado" : "⏳ Aguardando..."}\n` +
      `- Receptor: ${receptorConfirmou ? "✅ Confirmado" : "⏳ Aguardando..."}`;

    if (pagadorConfirmou && receptorConfirmou) {
      // Confirmação completa: refaz a busca no DB para garantir saldo atualizado
      pagadorDB = await client.userdb.findOne({ id: pagador.id });
      receptorDB = await client.userdb.findOne({ id: receptor.id });

      if (pagadorDB.primogemas < quantidade) {
        await btnInt.update({
          content: `✨ Oh não! ${pagador} não tem primogemas suficientes para essa transferência.`,
          embeds: [],
          components: [],
        });
        return;
      }

      // Realiza a transferência
      pagadorDB.primogemas -= quantidade;
      receptorDB.primogemas += quantidade;
      await pagadorDB.save();
      await receptorDB.save();

      await btnInt.update({
        content: `✨ Transferência concluída! ${pagador} enviou **${quantidade}** primogemas para ${receptor}.\nQue a justiça brilhe em sua jornada!`,
        embeds: [],
        components: [],
      });

      // Remove o callback do collector para liberar memória
      client.CustomCollector.delete(customIdConfirm);
    } else {
      // Só atualiza o embed e mantém o botão ativo
      const embedAtualizado = new EmbedBuilder()
        .setTitle("✨ Confirmação de Transferência")
        .setDescription(
          `Você está prestes a enviar **${quantidade}** primogemas para ${receptor}.\n\n` + statusText
        )
        .setColor("#3DD1D9")
        .setFooter({ text: "Confirme para brilhar com generosidade!" });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(customIdConfirm)
          .setLabel("Confirmar Transferência")
          .setStyle(ButtonStyle.Success)
      );

      await btnInt.update({ embeds: [embedAtualizado], components: [row] });
    }
  }, { timeout: 120000 });

  // Botão cancelar, com callback separado
  const customIdCancelar = client.CustomCollector.create(async (btnInt) => {
    if (![pagador.id, receptor.id].includes(btnInt.user.id)) {
      return btnInt.reply({
        content: "✨ Apenas os envolvidos podem usar este botão.",
        ephemeral: true,
      });
    }

    await btnInt.update({
      content: "✨ Transferência cancelada. Que a sorte te acompanhe na próxima!",
      embeds: [],
      components: [],
    });

    // Remove callbacks para liberar memória
    client.CustomCollector.delete(customIdConfirm);
    client.CustomCollector.delete(customIdCancelar);
  }, { timeout: 120000 });

  // Envia mensagem inicial com botões
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(customIdConfirm)
      .setLabel("Confirmar Transferência")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(customIdCancelar)
      .setLabel("Cancelar")
      .setStyle(ButtonStyle.Danger)
  );

  await interaction.editReply({ embeds: [embedConfirma], components: [row] });
}

      if (subcmd === "apostar") {
  const apostador = interaction.user;
  const oponente = interaction.options.getUser("contra");
  const valor = interaction.options.getInteger("quantidade");
       // console.log(oponente)

  if (apostador.id === oponente.id)
    return interaction.editReply({
      content: "✨ Oh, mon cher... Apostar contra si mesmo? Que coisa entediante! Escolha alguém digno do palco!",
      ephemeral: true,
    });

  if (oponente.bot && oponente.id !== client.user.id)
    return interaction.editReply({
      content: "✨ Tsc... Apostar contra um ser sem alma? Não mesmo! Somente um artista real pode brilhar neste palco!",
      ephemeral: true,
    });

  if (valor < 100)
    return interaction.editReply({
      content: "✨ Uma aposta de **menos de 100 primogemas**? Quanta mesquinharia, mon cher! Valorize o espetáculo!",
      ephemeral: true,
    });

  let apostadorDB = await client.userdb.findOne({ id: apostador.id });
  let oponenteDB = await client.userdb.findOne({ id: oponente.id });

  if (!apostadorDB || apostadorDB.primogemas < valor)
    return interaction.editReply({
      content: `✨ Ah, quanta ousadia! Você possui apenas **${apostadorDB?.primogemas || 0}** primogemas. Isso não sustenta uma aposta dessas!`,
      ephemeral: true,
    });

  if (!oponenteDB) {
    oponenteDB = new client.userdb({ id: oponente.id });
    await oponenteDB.save();
  }

  // Taxa
  const taxa = Math.floor(valor * 0.10);
  const valorLiquido = valor - taxa;

  // Contra a Furina
  if (oponente.id === client.user.id) {
    const venceu = Math.random() < 0.2;

    apostadorDB.primogemas -= valor;
    const furinaDB = await client.userdb.findOneAndUpdate(
      { id: client.user.id },
      { $inc: { primogemas: taxa } },
      { upsert: true, new: true }
    );

    if (venceu) {
      apostadorDB.primogemas += valorLiquido * 2;
      await apostadorDB.save();

      return interaction.editReply({
        content: `🎭 **Que reviravolta espetacular!**\n\n✨ Contra todas as probabilidades, **${apostador}** venceu a própria Furina e conquistou **${valorLiquido * 2}** primogemas!`,
        ephemeral: false,
      });
    } else {
      await apostadorDB.save();

      return interaction.editReply({
        content: `🎭 **Silêncio no palco...**\n\n✨ A deusa do julgamento sorri... **Furina** vence esta rodada, e **${apostador}** perde suas **${valor}** primogemas.`,
        ephemeral: false,
      });
    }
  }

  // Apostando contra outro usuário
  if (oponente.bot)
    return interaction.editReply({
      content: "✨ Mon cher, este oponente não é digno nem de um suspiro dramático. Apenas humanos neste palco!",
      ephemeral: true,
    });

  if (oponenteDB.primogemas < valor)
    return interaction.editReply({
      content: `✨ O pobre ${oponente} não possui primogemas suficientes! Precisa de ao menos **${valor}** para aceitar o duelo.`,
      ephemeral: true,
    });

  // Embed de confirmação
  const embed = new EmbedBuilder()
    .setColor("#3DD1D9")
    .setTitle("✨ Uma aposta está prestes a começar!")
    .setDescription(
      `🎭 **${apostador.username}** desafiou **${oponente.username}** para uma aposta de **${valor} primogemas**!\n\n` +
      `💸 Uma taxa de **10% (${taxa} primogemas)** será coletada pela gloriosa Furina.\n\n` +
      `**${oponente}**, aceite ou decline esta emocionante disputa!`
    )
    .setFooter({ text: "— Furina, a Juíza Suprema do Teatro da Fortuna" });

  const confirmarId = client.CustomCollector.create(async (btnInt) => {
    if (btnInt.user.id !== oponente.id)
      return btnInt.reply({ content: "✨ Esta resposta não te pertence!", ephemeral: true });

    // Recalcular o banco e validar novamente
    apostadorDB = await client.userdb.findOne({ id: apostador.id });
    oponenteDB = await client.userdb.findOne({ id: oponente.id });

    if (apostadorDB.primogemas < valor || oponenteDB.primogemas < valor)
      return btnInt.update({
        content: "✨ Alguém não possui mais primogemas suficientes para sustentar o espetáculo!",
        embeds: [],
        components: [],
      });

    const jogadores = [
  { user: apostador, db: apostadorDB },
  { user: oponente, db: oponenteDB }
];

const vencedorIndex = Math.floor(Math.random() * 2);
const perdedorIndex = vencedorIndex === 0 ? 1 : 0;

const vencedor = jogadores[vencedorIndex].user;
const vencedorDB = jogadores[vencedorIndex].db;

const perdedor = jogadores[perdedorIndex].user;
const perdedorDB = jogadores[perdedorIndex].db;


    vencedorDB.primogemas += valorLiquido;
    perdedorDB.primogemas -= valor;

    // Envia taxa à Furina
    await client.userdb.findOneAndUpdate(
      { id: client.user.id },
      { $inc: { primogemas: taxa } },
      { upsert: true }
    );

    await vencedorDB.save();
    await perdedorDB.save();

    await btnInt.deferReply()

    return btnInt.editReply({
      content:
        `🎭 **O destino foi lançado!**\n\n✨ **${vencedor}** venceu a aposta e recebe **${valorLiquido} primogemas**!\n` +
        `💸 A deusa Furina recebe seus justos **${taxa} primogemas** pela mediação divina.`,
      embeds: [],
      components: [],
    });
  }, { timeout: 60000 });

  const recusarId = client.CustomCollector.create(async (btnInt) => {
    if (btnInt.user.id !== oponente.id)
      return btnInt.reply({ content: "✨ Apenas o desafiado pode recusar, mon cher.", ephemeral: true });

    await btnInt.update({
      content: "✨ A aposta foi recusada. O espetáculo pode esperar!",
      embeds: [],
      components: [],
    });

    client.CustomCollector.delete(confirmarId);
    client.CustomCollector.delete(recusarId);
  }, { timeout: 60000 });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(confirmarId)
      .setLabel("Aceitar Aposta")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(recusarId)
      .setLabel("Recusar")
      .setStyle(ButtonStyle.Danger)
  );

  return interaction.editReply({ embeds: [embed], components: [row] });
}

    } catch (e) {
      console.log(e);
      return interaction.editReply(`❌ Oh là là! Algo deu errado ao executar o comando. Por favor, reporte ao servidor de suporte para que possamos trazer justiça a essa falha.\n\n\`\`\`\n${e}\n\`\`\``);
    }
  }
};