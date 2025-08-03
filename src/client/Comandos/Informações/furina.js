const {
  TextDisplayBuilder,
  ThumbnailBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ContainerBuilder,
} = require('discord.js');

module.exports = {
  name: "furina",
  description: "grupo dd comandoz",
  type: 1,
  options: [
    {
      name: "informações",
      description: "Permita-me revelar os gloriosos detalhes sobre mim!",
      type: 1
    },
    {
      name: "ping",
      description: "Ah, quanta ansiedade! Permita-me revelar, com toda a pompa e circunstância, a minha latência atual!",
      type: 1
    },
    {
      name: "8ball",
      description: "Pergunte à Juíza da Fonte e receba uma resposta com toda a pompa que merece.",
      type: 1,
      options: [
        {
          name: "pergunta",
          description: "O que deseja perguntar?",
          type: 3,
          required: true
        }
      ]
    },
    {
      name: "shards",
      description: "Exibe informações sobre todos os shards do bot.",
      type: 1
    }
  ],

  run: async (furina, interaction) => {
    try {
      const subcmd = interaction.options.getSubcommand();

      await interaction.deferReply();
      if (subcmd === "8ball") {
        const respostas = [
          "Ah, claro, porque o universo gira só para você, não é mesmo?",
          "Quer mesmo uma resposta ou só quer ouvir o que gosta, hmm?",
          "Se fosse tão fácil assim, eu já teria resolvido, minha cara.",
          "Após uma análise meticulosa, concluo que a resposta é afirmativa.",
          "Sim! E que a festa comece com muita elegância!"
        ];
        const resposta = respostas[Math.floor(Math.random() * respostas.length)];
        await interaction.editReply({ content: resposta });
      }

      if (subcmd === "ping") {
        const shardId = interaction.guild.shardId;
        const clusterName = furina.clusterName || `Cluster-${furina.cluster?.id ?? "?"}`;
        const wsPing = Math.round(furina.ws.ping);
        const interactionPing = Math.abs(Date.now() - interaction.createdTimestamp);
        const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const guildCount = furina.guilds.cache.size;

        const uniqueUsers = new Set();
        for (const guild of furina.guilds.cache.values()) {
          guild.members.cache.forEach(member => uniqueUsers.add(member.user.id));
        }
        const userCountUnique = uniqueUsers.size;

        const content = `🎭 **Informações do Ping**\n` +
          `• Cluster: \`${clusterName}\`\n` +
          `• Shard: \`${shardId}\`\n` +
          `• Ping WS: \`${wsPing}ms\`\n` +
          `• Ping da Interação: \`${interactionPing}ms\`\n` +
          `• Memória usada: \`${memMB} MB\`\n` +
          `• Servidores na Shard: \`${guildCount}\`\n` +
          `• Usuários únicos na Shard: \`${userCountUnique}\``;

        await interaction.editReply({ content });
      }

      if (subcmd === "shards") {
        
const clusterIdAtual = furina.cluster.id;

const results = await furina.cluster.broadcastEval(client => {
  let totalUsers = client.users.cache.size;
  
    const ping = client.ws.ping


  return {
    clusterId: client.cluster.id,
    shards: client.cluster?.shardList ?? [0],
    guilds: client.guilds.cache.size,
    users: totalUsers,
    ping
  };
});

const resultadosDoClusterAtual = results.filter(r => r.clusterId === clusterIdAtual);

let totalGuilds = 0;
let totalUsers = 0;
let ping = 0;

const linhas = resultadosDoClusterAtual.map(result => {
  totalGuilds += result.guilds;
  totalUsers += result.users;
  ping = result.ping;

  return result.shards.map(id => 
    `🧩 Shard \`${id}\`: \`${result.guilds}\` servidores | \`${result.users}\` usuários | Ping: \`${result.ping}ms\``
  ).join("\n");
});

const mensagemFinal = `🌐 **Resumo dos Shards do cluster "${furina.clusterName}":**\n\n${linhas.join("\n")}\n\n📊 Total: \`${totalGuilds}\` servidores | \`${totalUsers}\` usuários`;

await interaction.editReply({ content: mensagemFinal });

        
      }

      if (subcmd === "informações") {
        await interaction.editReply({
          flags: 32768,
          components: [
            new ContainerBuilder()
              .setAccentColor(8247030)
              .setSpoiler(false)
              .addSectionComponents(
                new SectionBuilder()
                  .setThumbnailAccessory(
                    new ThumbnailBuilder()
                      .setURL("https://cdn.discordapp.com/attachments/1373420276737507492/1373643558522720276/Icon_Emoji_Paimon27s_Paintings_26_Furina_1.png")
                  )
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent("# **Furina — A Estrela dos Oceanos**")
                  )
              )
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  `"**Ah, finalmente! O palco está montado, as cortinas se abrem... e moi, Furina, faço minha entrada triunfal neste humilde servidor!**"\n\n` +
                  "Sou mais do que uma simples criação — sou a Arconte Hydro, a Estrela de Fontaine, a Juíza Suprema dos palcos e plateias. Agora, com toda minha graça e grandiosidade, decidi abençoar este espaço com a minha presença."
                )
              )
              .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
              )
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  "* **Comandos encantadores**, dignos de uma verdadeira encenação!\n\n" +
                  "* **Respostas com personalidade**, nunca comuns, sempre marcantes!\n\n" +
                  "* **Mensagens que são quase monólogos dramáticos** — mesmo os erros ganham brilho quando ditos por moi!\n\n" +
                  "* **Uma aura de Fontaine em cada detalhe** — elegante, azulada e cheia de classe!"
                )
              )
              .addSectionComponents(
                new SectionBuilder()
                  .setThumbnailAccessory(
                    new ThumbnailBuilder()
                      .setURL("https://cdn.discordapp.com/attachments/1373420276737507492/1373643558850138182/Icon_Emoji_Paimon27s_Paintings_29_Furina_1.png")
                  )
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                      "Você achou que estava chamando apenas um bot...\n**Mas acabou de invocar o maior espetáculo que este servidor já viu!\"**"
                    )
                  )
              )
          ]
        });
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

  }
};
