const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuOptionBuilder,
  StringSelectMenuBuilder,
  AttachmentBuilder,
} = require("discord.js");

module.exports = {
  name: "explorar",
  description: "Grupo de comandos para exploração, guiados pela sabedoria das nações.",
  type: 1,
  options: [
    {
      name: "mondstadt",
      description: "Deixe os ventos de liberdade guiarem sua jornada por Mondstadt.",
      type: 2,
      options: [
        { name: "iniciar", description: "Inicie sua exploração em Mondstadt.", type: 1 },
        { name: "coletar", description: "Resgate suas recompensas da exploração em Mondstadt.", type: 1 },
      ],
    },
    {
      name: "liyue",
      description: "Explore os segredos dourados e as montanhas de Liyue.",
      type: 2,
      options: [
        { name: "iniciar", description: "Inicie sua exploração em Liyue.", type: 1 },
        { name: "coletar", description: "Resgate suas recompensas da exploração em Liyue.", type: 1 },
      ],
    },
    {
      name: "inazuma",
      description: "Desbrave as ilhas tempestuosas e místicas de Inazuma.",
      type: 2,
      options: [
        { name: "iniciar", description: "Inicie sua exploração em Inazuma.", type: 1 },
        { name: "coletar", description: "Resgate suas recompensas da exploração em Inazuma.", type: 1 },
      ],
    },
    {
      name: "sumeru",
      description: "Explore as misteriosas florestas e desertos de Sumeru.",
      type: 2,
      options: [
        { name: "iniciar", description: "Inicie sua exploração em Sumeru.", type: 1 },
        { name: "coletar", description: "Resgate suas recompensas da exploração em Sumeru.", type: 1 },
      ],
    },
    {
      name: "status",
      description: "Veja o progresso e o tempo restante das suas explorações nas nações.",
      type: 1,
    },
  ],

  run: async (client, interaction) => {
    try {
      const subcmdgroup = interaction.options.getSubcommandGroup(false);
      const subcmd = interaction.options.getSubcommand();

      await interaction.deferReply();
      
      // Função para formatar tempo restante em "1h 15m 30s"
      const formatarTempoRestante = (ms) => {
        if (ms <= 0) return null;
        let totalSeconds = Math.floor(ms / 1000);
        const horas = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutos = Math.floor(totalSeconds / 60);
        const segundos = totalSeconds % 60;

        let partes = [];
        if (horas > 0) partes.push(`${horas}h`);
        if (minutos > 0) partes.push(`${minutos}m`);
        if (segundos > 0) partes.push(`${segundos}s`);

        return partes.join(" ");
      };

      // Função para montar a barra de progresso com emojis
      const emojisProgresso = (percent) => {
        const blocos = 5;
        const preenchidos = Math.round((percent / 100) * blocos);
        const emojiVerde = "✅";
        const emojiPreto = "⚫";
        return emojiVerde.repeat(preenchidos) + emojiPreto.repeat(blocos - preenchidos);
      };

      // Se for o subcomando raiz 'status'
      if (!subcmdgroup && subcmd === "status") {
        
        let userdb = await client.userdb.findOne({ id: interaction.user.id });
        if (!userdb) {
          userdb = new client.userdb({ id: interaction.user.id });
          await userdb.save();
        }

        const limites = {
          mondstadt: 500,
          liyue: 1000,
          inazuma: 5000,
          sumeru: 7000,
        };

        const regioes = ["mondstadt", "liyue", "inazuma", "sumeru"];

        const agora = Date.now();

        let descricao = "";

        for (const regiao of regioes) {
          const exploracao = userdb.regioes[regiao].exploracao;
          const limite = limites[regiao];

          const totalBaus =
            exploracao.bausComuns +
            exploracao.bausPreciosos +
            exploracao.bausLuxuosos;

          const porcentagem = Math.min(100, (totalBaus / limite) * 100);
          const barra = emojisProgresso(porcentagem);

          let statusTempo = "";
          if (exploracao.time && exploracao.time > agora) {
            const restanteMs = exploracao.time - agora;
            const tempoFormatado = formatarTempoRestante(restanteMs);
            statusTempo = `⏳ Em exploração — tempo restante: **${tempoFormatado}**`;
          } else if (exploracao.resgatar) {
            statusTempo = `🎁 Tua jornada rendeu frutos! Use \`/explorar ${regiao} coletar\` para resgatar.`;
          } else {
            statusTempo = "🌿 Pronto para uma nova aventura.";
          }

          descricao +=
            `\n**${regiao[0].toUpperCase() + regiao.slice(1)}**\n` +
            `Progresso: ${porcentagem.toFixed(1)}% ${barra}\n` +
            `${statusTempo}\n`;
        }

        const embed = new EmbedBuilder()
          .setTitle("✨ Progresso das Explorações")
          .setDescription(descricao)
          .setColor("#3C92FF")
          .setFooter({
            text: "Aventure-se, pois o mundo aguarda teus passos.",
            iconURL: client.user.displayAvatarURL(),
          });

        return interaction.editReply({ embeds: [embed], ephemeral: true });
      }

      // Busca ou cria userdb
      let userdb = await client.userdb.findOne({ id: interaction.user.id });
      if (!userdb) {
        userdb = new client.userdb({ id: interaction.user.id });
        await userdb.save();
      }

      // --- MONDSTADT ---
      if (subcmdgroup === "mondstadt") {
        if (subcmd === "iniciar") {
        
          let img = new AttachmentBuilder("./src/img/nação/mondstadt.jpeg");

          const msg = await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle("🌬️ Ato I – Brisas de Mondstadt")
                .setDescription(
                  "Os ventos cantam melodias antigas...\nEscolha quanto tempo desejarás explorar as terras da liberdade e do vinho."
                )
                .setColor("#3C92FF")
                .setFooter({
                  text: "Que as brisas te levem a descobertas memoráveis.",
                  iconURL: client.user.displayAvatarURL(),
                })
                .setImage("attachment://mondstadt.jpeg"),
            ],
            files: [img],
            components: [
              new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId(`mondstadt_iniciar_${interaction.user.id}_${interaction.id}`)
                  .setPlaceholder("Selecione a duração da exploração")
                  .addOptions(
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Cena Breve – Voo da Liberdade (1h)")
                      .setDescription("Exploração suave pela campina.")
                      .setValue("1h"),
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Ato Completo – Jornada dos Ventos (5h)")
                      .setDescription("Missão digna do Cavaleiro de Mondstadt.")
                      .setValue("5h"),
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Grande Espetáculo – Balada dos Céus Livres (10h)")
                      .setDescription("Uma expedição épica e inesquecível.")
                      .setValue("10h")
                  )
              ),
            ],
          });

          const collector = msg.createMessageComponentCollector({
            componentType: 3,
            time: 60000,
          });

          collector.on("collect", async (i) => {
            if (
              i.customId === `mondstadt_iniciar_${interaction.user.id}_${interaction.id}` &&
              i.user.id === interaction.user.id
            ) {
              await i.deferUpdate();

              const tempo = i.values[0];
              const tempoNum = parseInt(tempo);

              const resposta = await client.exploracao.startMondstadt(
                interaction.user.id,
                tempoNum,
                interaction.channelId,
                interaction.guildId
              );

              return interaction.followUp({ content: resposta, ephemeral: true });
            }
          });
        } else if (subcmd === "coletar") {
          const resposta = await client.exploracao.collectMondstadt(interaction.user.id);
          return interaction.editReply({ content: resposta, ephemeral: true });
        }
      }

      // --- LIYUE ---
      if (subcmdgroup === "liyue") {
        if (subcmd === "iniciar") {
          let img = new AttachmentBuilder("./src/img/nação/liyue.jpeg");

          const msg = await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle("⛰️ Ato II – Ouro entre Rochas")
                .setDescription(
                  "As montanhas de Liyue sussurram segredos dourados...\nDecida quanto tempo dedicarás para explorar suas terras sagradas."
                )
                .setColor("#FFB830")
                .setFooter({
                  text: "Que a fortuna e os adeptos iluminem teu caminho.",
                  iconURL: client.user.displayAvatarURL(),
                })
                .setImage("attachment://liyue.jpeg"),
            ],
            files: [img],
            components: [
              new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId(`liyue_iniciar_${interaction.user.id}_${interaction.id}`)
                  .setPlaceholder("Selecione a duração da exploração")
                  .addOptions(
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Contemplação Rápida – Eco dos Rochosos (1h)")
                      .setDescription("Caminhada tranquila entre colinas.")
                      .setValue("1h"),
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Travessia Comercial – Rota dos Mercadores (5h)")
                      .setDescription("Percorrendo rios e montanhas.")
                      .setValue("5h"),
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Ritual dos Adepti – Benção das Montanhas (10h)")
                      .setDescription("Uma jornada espiritual e respeitosa.")
                      .setValue("10h")
                  )
              ),
            ],
          });

          const collector = msg.createMessageComponentCollector({
            componentType: 3,
            time: 60000,
          });

          collector.on("collect", async (i) => {
            if (
              i.customId === `liyue_iniciar_${interaction.user.id}_${interaction.id}` &&
              i.user.id === interaction.user.id
            ) {
              await i.deferUpdate();

              const tempo = i.values[0];
              const tempoNum = parseInt(tempo);

              const resposta = await client.exploracao.startLiyue(
                interaction.user.id,
                tempoNum,
                interaction.channelId,
                interaction.guildId
              );

              return interaction.followUp({ content: resposta, ephemeral: true });
            }
          });
        } else if (subcmd === "coletar") {
          const resposta = await client.exploracao.collectLiyue(interaction.user.id);
          return interaction.editReply({ content: resposta, ephemeral: true });
        }
      }

      // --- INAZUMA ---
      if (subcmdgroup === "inazuma") {
        if (subcmd === "iniciar") {
          let img = new AttachmentBuilder("./src/img/nação/inazuma.jpeg");

          const msg = await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle("⚡ Ato III – Trovões de Inazuma")
                .setDescription(
                  "As tempestades anunciam segredos antigos...\nEscolha quanto tempo gastarás para explorar as ilhas eletrizantes."
                )
                .setColor("#7D3C98")
                .setFooter({
                  text: "Que os relâmpagos guiem teus passos.",
                  iconURL: client.user.displayAvatarURL(),
                })
                .setImage("attachment://inazuma.jpeg"),
            ],
            files: [img],
            components: [
              new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId(`inazuma_iniciar_${interaction.user.id}_${interaction.id}`)
                  .setPlaceholder("Selecione a duração da exploração")
                  .addOptions(
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Relâmpago Breve – Sussurros de Narukami (1h)")
                      .setDescription("Exploração rápida sob céus tempestuosos.")
                      .setValue("1h"),
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Tempestade Constante – Ecos de Seirai (5h)")
                      .setDescription("Jornada firme entre as ilhas.")
                      .setValue("5h"),
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Eternidade Silenciosa – Caminho da Shogun (10h)")
                      .setDescription("Uma jornada poderosa e completa.")
                      .setValue("10h")
                  )
              ),
            ],
          });

          const collector = msg.createMessageComponentCollector({
            componentType: 3,
            time: 60000,
          });

          collector.on("collect", async (i) => {
            if (
              i.customId === `inazuma_iniciar_${interaction.user.id}_${interaction.id}` &&
              i.user.id === interaction.user.id
            ) {
              await i.deferUpdate();

              const tempo = i.values[0];
              const tempoNum = parseInt(tempo);

              const resposta = await client.exploracao.startInazuma(
                interaction.user.id,
                tempoNum,
                interaction.channelId,
                interaction.guildId
              );

              return interaction.followUp({ content: resposta, ephemeral: true });
            }
          });
        } else if (subcmd === "coletar") {
          const resposta = await client.exploracao.collectInazuma(interaction.user.id);
          return interaction.editReply({ content: resposta, ephemeral: true });
        }
      }

      // --- SUMERU ---
      if (subcmdgroup === "sumeru") {
        if (subcmd === "iniciar") {
          let img = new AttachmentBuilder("./src/img/nação/sumeru.jpeg");

          const msg = await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setTitle("🌳 Ato IV – Segredos de Sumeru")
                .setDescription(
                  "Entre as florestas densas e desertos enigmáticos...\nEscolha quanto tempo dedicarás para desvendar os mistérios de Sumeru."
                )
                .setColor("#2E8B57")
                .setFooter({
                  text: "Que a sabedoria ancestral ilumine teu caminho.",
                  iconURL: client.user.displayAvatarURL(),
                })
                .setImage("attachment://sumeru.jpeg"),
            ],
            files: [img],
            components: [
              new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId(`sumeru_iniciar_${interaction.user.id}_${interaction.id}`)
                  .setPlaceholder("Selecione a duração da exploração")
                  .addOptions(
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Passeio Breve – Sussurros da Selva (1h)")
                      .setDescription("Exploração leve pelas copas das árvores.")
                      .setValue("1h"),
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Expedição Profunda – Segredos do Deserto (5h)")
                      .setDescription("Aventura intensa entre as dunas e florestas.")
                      .setValue("5h"),
                    new StringSelectMenuOptionBuilder()
                      .setLabel("Odisseia Ancestral – Conhecimento Perdido (10h)")
                      .setDescription("Uma jornada lendária e reveladora.")
                      .setValue("10h")
                  )
              ),
            ],
          });

          const collector = msg.createMessageComponentCollector({
            componentType: 3,
            time: 60000,
          });

          collector.on("collect", async (i) => {
            if (
              i.customId === `sumeru_iniciar_${interaction.user.id}_${interaction.id}` &&
              i.user.id === interaction.user.id
            ) {
              await i.deferUpdate();

              const tempo = i.values[0];
              const tempoNum = parseInt(tempo);

              const resposta = await client.exploracao.startSumeru(
                interaction.user.id,
                tempoNum,
                interaction.channelId,
                interaction.guildId
              );

              return interaction.followUp({ content: resposta, ephemeral: true });
            }
          });
        } else if (subcmd === "coletar") {
          const resposta = await client.exploracao.collectSumeru(interaction.user.id);
          return interaction.editReply({ content: resposta, ephemeral: true });
        }
      }

      
    } catch (err) {
  console.error(err);

  const id = await client.reportarErro({
    erro: err,
    comando: interaction.commandName,
    servidor: interaction.guild
  });

  return interaction.editReply({
    content: `❌ Oh là là... Um contratempo inesperado surgiu durante a execução deste comando. Por gentileza, reporte este erro ao nosso servidor de suporte junto com o ID abaixo, para que a justiça divina possa ser feita!\n\n🆔 ID do erro: \`${id}\``,
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            label: "Servidor de Suporte",
            style: 5,
            url: "https://discord.gg/KQg2B5JeBh"
          }
        ]
      }
    ],
    embeds: [],
    files: []
  });
}
  },
};
