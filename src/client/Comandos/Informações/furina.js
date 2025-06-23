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
    }
  ],

  run: async (furina, interaction) => {
    try {
      const subcmd = interaction.options.getSubcommand();

      if (subcmd === "8ball") {
        const respostas = [
          "Ah, claro, porque o universo gira só para você, não é mesmo?",
          "Quer mesmo uma resposta ou só quer ouvir o que gosta, hmm?",
          "Se eu tivesse uma moeda, jogaria pra decidir, mas você não é tão importante assim.",
          "Isso é tão óbvio que até eu fico surpresa que você perguntou.",
          "Uau, pergunta profunda... e a resposta é não.",
          "Sério? Esperava algo mais interessante vindo de você.",
          "Você devia perguntar isso para um espelho, talvez ele responda melhor.",
          "Como se isso importasse, francamente, não me faça rir.",
          "Se fosse tão fácil assim, eu já teria resolvido, minha cara.",
          "Hmm, vou fingir que não ouvi essa besteira.",
          "Após uma análise meticulosa, concluo que a resposta é afirmativa.",
          "Lamento informar, mas a resposta que buscas é negativa.",
          "Os dados indicam um resultado favorável, para seu espanto.",
          "Infelizmente, não é recomendável confiar nisso no momento.",
          "A balança da justiça pende a seu favor hoje, aproveite.",
          "Considerando todas as variáveis, o sim é mais provável, duvide se quiser.",
          "Não posso recomendar essa ação agora, mas quem sou eu para decidir?",
          "Com base nas evidências, a resposta é positiva e incontestável.",
          "A probabilidade aponta para um desfecho negativo, prepare-se.",
          "Após cuidadosa revisão, o veredito é: sim.",
          "O destino grita um sonoro SIM, ouça-o bem!",
          "Ah, que tragédia seria se não fosse assim, meu caro.",
          "O cosmos conspira contra seu desejo... por enquanto.",
          "Com pompa e circunstância, eu declaro: sim!",
          "O espetáculo está só começando, e você sairá vencedor!",
          "Não, e que pena! O drama só vai aumentar com isso.",
          "Se isto fosse um ato teatral, essa seria a reviravolta triunfal!",
          "Oh, a cruel ironia do destino te diz não, tão cruel quanto eu.",
          "Minha resposta é tão intensa quanto meu próprio coração ardente.",
          "Prepare-se, pois o resultado será surpreendente, acredite.",
          "Se fosse um peixe, eu diria que está na rede, meu caro.",
          "Olhe para a fonte… ela sussurra um sonoro sim para você.",
          "Só se você me der uma guloseima depois, hein?",
          "Sim, e então dançaremos juntos para celebrar!",
          "Não, mas não fique triste, haverá outras chances, não é?",
          "Pergunte novamente quando eu estiver menos dramática, combinado?",
          "Eu chutaria um sim, mas posso estar brincando com você.",
          "A resposta está mais clara que a água cristalina de Fontaine.",
          "Não agora, estou ocupada contando minhas joias preciosas.",
          "Sim! E que a festa comece com muita elegância!",
          "Os ventos de Fontaine falam em enigmas, tente outra vez depois.",
          "Nem eu mesma sei, o futuro permanece um véu encoberto.",
          "Tudo está envolto em mistério, aguarde os sinais com paciência.",
          "O oráculo permanece em silêncio... por enquanto, meu caro.",
          "As estrelas não estão alinhadas para uma resposta clara agora.",
          "O tempo revelará a verdade oculta, confie nele.",
          "As sombras dançam, e a resposta é incerta como sempre.",
          "Os segredos do mar ainda não foram desvendados para você.",
          "Há muito mais do que seus olhos podem ver, seja paciente.",
          "A resposta está em outro lugar, volte mais tarde para saber.",
          "Ah, minha paciência é tão limitada quanto minha benevolência, cuidado.",
          "Seu destino está escrito nas ondas, e elas dizem sim, sim!",
          "Não confunda minha elegância com complacência, entenda bem.",
          "A resposta é um mistério que até eu adoraria desvendar, quem sabe?",
          "Se o destino fosse um jogo, saiba que você está ganhando agora.",
          "Não, e que seja uma lição que você jamais esquecerá.",
          "Você pede, eu concedo... às vezes, se estiver de bom humor.",
          "O oceano responde com um suave ‘talvez’, não crie expectativas.",
          "Que a justiça seja feita, e digo que sim, sem dúvidas.",
          "Não subestime o poder de uma negativa elegante, é minha marca.",
          "O espetáculo da vida diz que sim, e que seja grandioso.",
          "Essa pergunta merecia um drama maior, mas tudo bem, não.",
          "Meu conselho? Não conte com isso, mas tente sua sorte.",
          "Quando a lua estiver cheia, volte e pergunte de novo, viu?",
          "Sim, e que isso te inspire a algo magnífico e grandioso.",
          "Não, mas pelo menos tentou, isso já é alguma coisa.",
          "Confie na correnteza, ela leva ao sim — se você for esperto.",
          "Se o mundo fosse justo, seria sim, mas nem sempre é.",
          "Prefiro uma resposta enigmática a um ‘sim’ fácil, meu estilo.",
          "Dúvidas são a essência do suspense, continue perguntando, querido."
        ];

        const resposta = respostas[Math.floor(Math.random() * respostas.length)];

        await interaction.editReply({ content: resposta });
      }

      if (subcmd === "ping") {
       const shardId = interaction.client.shard?.ids?.[0] ?? 0;

        const clusterName = furina.clusterName || `Cluster-${furina.cluster?.id ?? "?"}`;

        // Ping do WebSocket
        const wsPing = Math.round(furina.ws.ping);

        // Ping da interação (latência)
        const interactionPing = Math.abs(Date.now() - interaction.createdTimestamp);

        // Memória usada em MB
        const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

        // Total de servidores na shard
        const guildCount = furina.guilds.cache.size;

        // Usuários únicos na shard via cache de membros
        const uniqueUsers = new Set();
        for (const guild of furina.guilds.cache.values()) {
          guild.members.cache.forEach(member => uniqueUsers.add(member.user.id));
        }
        const userCountUnique = uniqueUsers.size;

        // Mensagem formatada
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
    } catch (e) {
      console.log(e);
      return interaction.editReply(
        `❌ Oh là là! Algo deu errado ao executar o comando. Por favor, reporte ao servidor de suporte para que possamos trazer justiça a essa falha.\n\n\`\`\`\n${e}\n\`\`\``
      );
    }
  }
};
