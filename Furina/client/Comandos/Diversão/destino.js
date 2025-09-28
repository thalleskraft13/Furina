module.exports = {
  name: "destino",
  description: "Descubra o destino que as estrelas — ou o caos — traçaram para você!",
  type: 1,

  run: async (client, interaction) => {
    try {
      await interaction.deferReply();
      const destinos = [
        `O destino sussurra… ${interaction.user}, você será o futuro Arconte de uma vila esquecida por todos — até mesmo por Teyvat.`,
        `As estrelas decidiram! ${interaction.user}, você será um slime com consciência e grandes sonhos.`,
        `Você renascerá como o tapete vermelho da Ópera Epiclese. Aplausos eternos, pisões constantes.`,
        `Ah, que tragédia divina! ${interaction.user}, destinado a ser o NPC que apenas fala do clima.`,
        `O oráculo é claro: ${interaction.user} será idolatrado por todos… como a mais carismática flor de Mondstadt.`,
        `O destino ri alto! ${interaction.user}, viverá entre bolinhos de arroz por toda a eternidade.`,
        `Você será o novo mascote da guilda dos aventureiros, ${interaction.user}. Com direito a roupa fofa e tudo!`,
        `Ah, uma grande missão… ${interaction.user}, treinar esquilos para tocar harpa.`,
        `A profecia é clara: ${interaction.user}, condenado(a) a sempre tirar 3 estrelas nos artefatos.`,
        `Você será um gato de Teyvat. 9 vidas, 0 paciência.`,
        `Ah, o drama do destino: ${interaction.user}, agora é um cacto em Sumeru. Parado, mas muito sábio.`,
        `O caminho do destino é claro: ${interaction.user}, o animador de festas oficiais da Paimon.`,
        `Você será a pedra fundamental do novo teatro… literalmente.`,
        `O mundo te teme, ${interaction.user}… pois você sabe todos os spoilers de Fontaine.`,
        `A partir de hoje, ${interaction.user}, é o novo jurado das brigas entre slimes. Boa sorte com a baba.`,
        `Você renascerá como um peixe que canta óperas submersas.`,
        `Seu destino é eterno: fila de artefatos e nenhuma peça decente.`,
        `Os Arcontes decidiram: ${interaction.user} será o som do ventilador do Venti.`,
        `A próxima encarnação de ${interaction.user} será um baú trancado no topo de uma montanha.`,
        `Você será uma lenda… nos bastidores.`,
        `Sua glória será como a de um cogumelo dançante de Inazuma.`,
        `Em breve, ${interaction.user} será o novo enredo de uma peça dramática que ninguém entende.`,
        `Você será confundido eternamente com um Hilichurl carismático.`,
        `Sua jornada começa e termina... em um bug.`,
        `O destino te levou a virar uma arma. De 1 estrela. De brinquedo.`,
        `A profecia diz: ${interaction.user} será mestre em... abrir menus por engano.`,
        `Você será lembrado como aquele que nunca explorou o mapa 100%.`,
        `Ah, uma vida de glória! Sendo carregado em Domínios por estranhos.`,
        `Sua alma habitará eternamente o botão de “Reiniciar Missão”.`,
        `Você será o eco misterioso nas cavernas de Sumeru.`,
        `Toda Fontaine conhecerá seu nome… por perder todos os julgamentos.`,
        `Você será idolatrado por slimes por salvar um deles sem querer.`,
        `Ah, o destino cruel: seu banner nunca virá no 50/50.`,
        `Um futuro repleto de... Madeiras! Você virou lenhador.`,
        `As areias de Sumeru escreverão poemas sobre sua queda de penhasco.`,
        `Você será o personagem favorito de um jogador que nunca loga.`,
        `Você será confundido com uma mobília animada.`,
        `Você terá uma missão mundial… que ninguém consegue completar.`,
        `Seu papel é vital: manter o chão limpo em Mondstadt, com o rosto.`,
        `Você será a nova inspiração para os trocadilhos da Paimon.`,
        `O oráculo prevê: você vai ser bugado em uma cadeira.`,
        `Você renascerá como uma missão que trava o progresso principal.`,
        `A glória te aguarda... como a sombra em cutscenes.`,
        `Você será o próximo chefe mundial. Mas ninguém vai te levar a sério.`,
        `Ah, que maravilha! Você será o tutorial eterno para novatos.`,
        `Você viverá na mente de jogadores por ser impossível de esquecer… ou desinstalar.`,
        `Você será o som de erro ao tentar cozinhar sem ingredientes.`,
        `Você será lembrado como o melhor pescador de Fontaine (mesmo sem pescar).`,
        `Sua jornada terminará em um teatro... como parte do cenário.`,
        `Você será a última gota de sanidade no abismo.`,
        `E por fim… você será eu. Dramático, elegante, e absolutamente essencial.`,
      ];

      let destino = destinos[Math.floor(Math.random() * destinos.length)];

      return await interaction.editReply({
        content: `${destino}`
      });
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
}
