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
    },
  ],

  run: async (client, interaction) => {
    try {
      const subcmd = interaction.options.getSubcommand();

      if (subcmd === "ver") {
        const user = interaction.options.getUser("usuario") || interaction.user;

        let userdb = await client.userdb.findOne({ id: user.id });
        if (!userdb) {
          userdb = new client.userdb({ id: user.id, primogemas: 0 });
          await userdb.save();
        }

        const embedVer = new EmbedBuilder()
          .setTitle("✨ Brilho das Primogemas")
          .setDescription(
            `Aventureiro ${user}, você possui **${userdb.primogemas}** primogemas cintilantes.\n` +
              `Continue acumulando glórias e tesouros!`
          )
          .setColor("#3DD1D9")
          .setThumbnail(user.displayAvatarURL({ dynamic: true }));

        return interaction.editReply({ embeds: [embedVer] });
      }

      if (subcmd === "daily") {
        let userdb = await client.userdb.findOne({ id: interaction.user.id });
        if (!userdb) {
          userdb = new client.userdb({
            id: interaction.user.id,
            primogemas: 0,
            level: { ar: 1 },
          });
          await userdb.save();
        }

        if (!userdb.level || userdb.level.ar < 17) {
          return interaction.editReply(
            `✨ Oh bravo aventureiro, só quem alcançou o nível de AR 17 pode resgatar as bênçãos diárias! Continue crescendo!`
          );
        }

        return interaction.editReply(
          `✨ Para receber suas recompensas diárias de primogemas, visite o site mágico: ${client.website}/recompensas`
        );
      }

      if (subcmd === "rank") {
        let pagina = interaction.options.getInteger("pagina") || 1;
        if (pagina < 1) pagina = 1;

        const todosUsuarios = await client.userdb.find({}).sort({ primogemas: -1 });
        const totalUsuarios = todosUsuarios.length;
        const itensPorPagina = 5;
        const totalPaginas = Math.ceil(totalUsuarios / itensPorPagina);

        if (pagina > totalPaginas && totalPaginas > 0) pagina = totalPaginas;

        const sliceUsuarios = todosUsuarios.slice(
          (pagina - 1) * itensPorPagina,
          pagina * itensPorPagina
        );

        let descricao = "";
for (let idx = 0; idx < sliceUsuarios.length; idx++) {
  const u = sliceUsuarios[idx];
  const user = client.users.cache.get(u.id) || await client.users.fetch(u.id).catch(() => null);
  const username = user ? user.username : "Desconhecido";
  descricao += `**${(pagina - 1) * itensPorPagina + idx + 1}** - [${username}](https://discord.com/users/${u.id}) com **${u.primogemas}** primogemas\n`;
}


        if (descricao.length === 0) descricao = "✨ Ainda não há aventureiros registrados no ranking.";

        const embedRank = new EmbedBuilder()
          .setTitle(`✨ Ranking das Primogemas — Página ${pagina}/${totalPaginas || 1}`)
          .setDescription(descricao)
          .setColor("#3DD1D9")
          .setFooter({ text: `Mostrando ${sliceUsuarios.length} de ${totalUsuarios} aventureiros.` });

        // Botões para navegação simples
        const row = new ActionRowBuilder();

        if (pagina > 1) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`rank_primogemas_${interaction.user.id}_${pagina - 1}`)
              .setLabel("◀️ Anterior")
              .setStyle(ButtonStyle.Primary)
          );
        }
        if (pagina < totalPaginas) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`rank_primogemas_${interaction.user.id}_${pagina + 1}`)
              .setLabel("Próximo ▶️")
              .setStyle(ButtonStyle.Primary)
          );
        }

        await interaction.editReply({ embeds: [embedRank], components: row.components.length ? [row] : [] });

        const collector = interaction.channel.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 60000,
        });

        collector.on("collect", async (btnInt) => {
          if (btnInt.user.id !== interaction.user.id) {
            return btnInt.reply({
              content: "✨ Apenas o aventureiro que executou o comando pode usar estes botões.",
              ephemeral: true,
            });
          }

          const [_, __, ___, paginaStr] = btnInt.customId.split("_");
          const novaPagina = parseInt(paginaStr);

          if (isNaN(novaPagina)) return btnInt.deferUpdate();

          const novaSliceUsuarios = todosUsuarios.slice(
            (novaPagina - 1) * itensPorPagina,
            novaPagina * itensPorPagina
          );

          let novaDescricao = "";
for (let idx = 0; idx < novaSliceUsuarios.length; idx++) {
  const u = novaSliceUsuarios[idx];
  const user = client.users.cache.get(u.id) || await client.users.fetch(u.id).catch(() => null);
  const username = user ? user.username : "Não encontrado";
  novaDescricao += `**${(novaPagina - 1) * itensPorPagina + idx + 1}** - [${username}](https://discord.com/users/${u.id}) com **${u.primogemas}** primogemas\n`;
}

          if (novaDescricao.length === 0) novaDescricao = "✨ Ainda não há aventureiros registrados no ranking.";

          const novoEmbed = new EmbedBuilder()
            .setTitle(`✨ Ranking das Primogemas — Página ${novaPagina}/${totalPaginas || 1}`)
            .setDescription(novaDescricao)
            .setColor("#3DD1D9")
            .setFooter({ text: `Mostrando ${novaSliceUsuarios.length} de ${totalUsuarios} aventureiros.` });

          const novoRow = new ActionRowBuilder();

          if (novaPagina > 1) {
            novoRow.addComponents(
              new ButtonBuilder()
                .setCustomId(`rank_primogemas_${interaction.user.id}_${novaPagina - 1}`)
                .setLabel("◀️ Anterior")
                .setStyle(ButtonStyle.Primary)
            );
          }
          if (novaPagina < totalPaginas) {
            novoRow.addComponents(
              new ButtonBuilder()
                .setCustomId(`rank_primogemas_${interaction.user.id}_${novaPagina + 1}`)
                .setLabel("Próximo ▶️")
                .setStyle(ButtonStyle.Primary)
            );
          }

          await btnInt.update({ embeds: [novoEmbed], components: novoRow.components.length ? [novoRow] : [] });
        });

        return;
      }

      if (subcmd === "pagar") {
        const pagador = interaction.user;
        const receptor = interaction.options.getUser("usuario");
        const quantidade = interaction.options.getInteger("quantidade");

        if (receptor.id === pagador.id) {
          return interaction.editReply(
            "✨ Ah, aventureiro, não se pode pagar a si mesmo! Escolha outro para compartilhar suas primogemas."
          );
        }
        if (quantidade <= 0) {
          return interaction.editReply(
            "✨ A quantidade deve ser maior que zero, bravo aventureiro!"
          );
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
          return interaction.editReply(
            `✨ Oh não, aventureiro! Você só possui **${pagadorDB.primogemas}** primogemas e não pode pagar essa quantia.`
          );
        }

        // Mensagem de confirmação para os dois
        const embedConfirma = new EmbedBuilder()
          .setTitle("✨ Confirmação de Transferência")
          .setDescription(
            `Você está prestes a enviar **${quantidade}** primogemas para ${receptor}.\n` +
            `**${pagador}** e **${receptor}**, ambos precisam confirmar a transferência abaixo.`
          )
          .setColor("#3DD1D9")
          .setFooter({ text: "Confirme para brilhar com generosidade!" });

        const btnConfirmarPagador = new ButtonBuilder()
          .setCustomId(`confirmar_pagar_pagador_${pagador.id}_${receptor.id}_${quantidade}`)
          .setLabel("Confirmar (Pagador)")
          .setStyle(ButtonStyle.Success);

        const btnConfirmarReceptor = new ButtonBuilder()
          .setCustomId(`confirmar_pagar_receptor_${pagador.id}_${receptor.id}_${quantidade}`)
          .setLabel("Confirmar (Receptor)")
          .setStyle(ButtonStyle.Success);

        const btnCancelar = new ButtonBuilder()
          .setCustomId(`cancelar_pagar_${pagador.id}_${receptor.id}_${quantidade}`)
          .setLabel("Cancelar")
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(
          btnConfirmarPagador,
          btnConfirmarReceptor,
          btnCancelar
        );

        await interaction.editReply({ embeds: [embedConfirma], components: [row] });

        // Controle dos dois confirmações
        let pagadorConfirmou = false;
        let receptorConfirmou = false;
        let cancelado = false;

        const collector = interaction.channel.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 120000,
        });

        collector.on("collect", async (btnInt) => {
          if (![pagador.id, receptor.id].includes(btnInt.user.id)) {
            return btnInt.reply({
              content: "✨ Apenas os envolvidos podem usar estes botões.",
              ephemeral: true,
            });
          }

          if (btnInt.customId === `cancelar_pagar_${pagador.id}_${receptor.id}_${quantidade}`) {
            cancelado = true;
            await btnInt.update({
              content: "✨ Transferência cancelada. Que a sorte te acompanhe na próxima!",
              embeds: [],
              components: [],
            });
            collector.stop();
            return;
          }

          if (
            btnInt.customId ===
            `confirmar_pagar_pagador_${pagador.id}_${receptor.id}_${quantidade}`
          ) {
            if (btnInt.user.id !== pagador.id)
              return btnInt.reply({
                content: "✨ Apenas o pagador pode clicar neste botão.",
                ephemeral: true,
              });
            if (pagadorConfirmou)
              return btnInt.reply({
                content: "✨ Você já confirmou a transferência, bravo aventureiro!",
                ephemeral: true,
              });

            pagadorConfirmou = true;
            await btnInt.update({
              content: `✨ Pagador confirmou a transferência. ${receptorConfirmou ? "Todos confirmaram!" : "Esperando confirmação do receptor..."}`,
              embeds: [],
              components: [],
            });

            if (pagadorConfirmou && receptorConfirmou) {
              // Refresca DB antes
              pagadorDB = await client.userdb.findOne({ id: pagador.id });
              receptorDB = await client.userdb.findOne({ id: receptor.id });

              if (pagadorDB.primogemas < quantidade) {
                await interaction.editReply(
                  `✨ Oh não! ${pagador} não tem primogemas suficientes para essa transferência.`
                );
                collector.stop();
                return;
              }

              pagadorDB.primogemas -= quantidade;
              receptorDB.primogemas += quantidade;

              await pagadorDB.save();
              await receptorDB.save();

              await interaction.editReply(
                `✨ Transferência concluída! ${pagador} enviou **${quantidade}** primogemas para ${receptor}.\n` +
                  "Que a justiça brilhe em sua jornada!"
              );

              collector.stop();
            }

            return;
          }

          if (
            btnInt.customId ===
            `confirmar_pagar_receptor_${pagador.id}_${receptor.id}_${quantidade}`
          ) {
            if (btnInt.user.id !== receptor.id)
              return btnInt.reply({
                content: "✨ Apenas o receptor pode clicar neste botão.",
                ephemeral: true,
              });
            if (receptorConfirmou)
              return btnInt.reply({
                content: "✨ Você já confirmou a transferência, bravo aventureiro!",
                ephemeral: true,
              });

            receptorConfirmou = true;
            await btnInt.update({
              content: `✨ Receptor confirmou a transferência. ${pagadorConfirmou ? "Todos confirmaram!" : "Esperando confirmação do pagador..."}`,
              embeds: [],
              components: [],
            });

            if (pagadorConfirmou && receptorConfirmou) {
              pagadorDB = await client.userdb.findOne({ id: pagador.id });
              receptorDB = await client.userdb.findOne({ id: receptor.id });

              if (pagadorDB.primogemas < quantidade) {
                await interaction.editReply(
                  `✨ Oh não! ${pagador} não tem primogemas suficientes para essa transferência.`
                );
                collector.stop();
                return;
              }

              pagadorDB.primogemas -= quantidade;
              receptorDB.primogemas += quantidade;

              await pagadorDB.save();
              await receptorDB.save();

              await interaction.editReply(
                `✨ Transferência concluída! ${pagador} enviou **${quantidade}** primogemas para ${receptor}.\n` +
                  "Que a justiça brilhe em sua jornada!"
              );

              collector.stop();
            }

            return;
          }
        });

        collector.on("end", (_, reason) => {
          if (!pagadorConfirmou || !receptorConfirmou) {
            if (!cancelado) {
              interaction.editReply({
                content: "✨ Tempo esgotado ou transferência não confirmada. Cancelando operação.",
                embeds: [],
                components: [],
              });
            }
          }
        });
      }
    } catch (error) {
      console.error("Erro em /primogemas:", error);
      return interaction.editReply(
        "✨ Oh là là, algo deu errado! Tente novamente mais tarde, aventureiro."
      );
    }
  },
};
