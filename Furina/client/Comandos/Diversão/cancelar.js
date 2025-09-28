module.exports = {
  name: "cancelar",
  description: "A justiça clama por espetáculo! Julgarei e cancelarei com todo o drama que Fontaine merece!",
  type: 1,
  options: [{
    name: "usuário",
    description: "Mencione ou insira o ID",
    type: 6,
    required: true
  }],

  run: async (Furina, interaction) => {
    try {
      await interaction.deferReply();
      const motivosCancelamento = [
        "Por ousar ignorar uma cutscene emocionante.",
        "Por dizer que preferia a Arlecchino como Arconte.",
        "Por reclamar de diálogo demais em Fontaine! Como se fosse um problema!",
        "Por tentar pescar... com explosivos!",
        "Por chamar a Senhora Neuvillette de 'cara da água'.",
        "Por usar artefato errado e ainda dizer que 'tanto faz'.",
        "Por colocar ketchup na baguete.",
        "Por pular minha performance mais dramática do ano!",
        "Por dizer que não gosta de ópera. Heresia!",
        "Por ignorar as bolhas poéticas de Meropide.",
        "Por perder 50/50 para a Qiqi e culpar o destino!",
        "Por usar resina em flor errada. Eu vi!",
        "Por pensar que Fontaine era só uma 'cidadezinha aquática qualquer'.",
        "Por invadir o tribunal sem se curvar primeiro.",
        "Por chamar minha voz de 'aguda demais'.",
        "Por não saber nadar mesmo com os poderes Hydro.",
        "Por confundir Hydro com Cryo. Francamente.",
        "Por se esquecer de coletar recompensas semanais!",
        "Por alimentar o Paimon com cogumelo amargo.",
        "Por usar a Furina como suporte e não DPS.",
        "Por dizer que preferia Liyue. Silêncio!",
        "Por tomar chá sem levantar o mindinho.",
        "Por fugir de um julgamento... só porque perdeu.",
        "Por dormir no meio do meu discurso! Imperdoável.",
        "Por tentar surfar em Fontaine como se fosse Mondstadt.",
        "Por cantar mais alto que eu. Que audácia!",
        "Por esquecer de upar os talentos. Todos.",
        "Por usar Relíquias 3★ no AR 55.",
        "Por chamar Fontaine de 'molhada demais'.",
        "Por não usar minha skin mais brilhante.",
        "Por duvidar do meu poder como Arconte!",
        "Por achar que a justiça é opcional.",
        "Por usar o Neuvillette de healer. Jura?",
        "Por tentar subornar o juiz com Mora falsa.",
        "Por invocar chuva... dentro do teatro.",
        "Por tentar fazer stealth com Yanfei.",
        "Por esquecer de me aplaudir.",
        "Por preferir mecânica a estética. Que horror!",
        "Por usar o navio de Fontaine como submarino.",
        "Por dizer que Fontaine não tem 'emoção'.",
        "Por tentar montar na baleia sem permissão.",
        "Por perder no teatro e sair rageando.",
        "Por colecionar Hydroculus e não oferecer a ninguém.",
        "Por dar skip no meu julgamento final.",
        "Por confundir Fontaine com Inazuma. Você me paga.",
        "Por preferir os Fatui a mim. Que insulto.",
        "Por esquecer o nome da ópera mais famosa de Fontaine!",
        "Por chamar o julgamento de 'tédio com floreios'.",
        "Por errar meu nome. Furina, não 'Furiosa'!",
        "Por não dar comida ao mascote do teatro.",
        "Por questionar a lógica do enredo. Ousadia.",
        "Por usar a palavra 'cringe' em pleno Fontaine.",
        "Por fazer piada com minha altura. Você é baixo moralmente!",
        "Por ignorar a beleza da justiça!",
        "Por dizer que Fontaine tem água demais. Vá pro deserto, então!",
        "Por entrar no palco sem reverência!",
        "Por usar Anemo em pleno julgamento Hydro.",
        "Por usar emoji demais no chat do tribunal.",
        "Por preferir o silêncio à minha voz.",
        "Por ser... simplesmente culpado. O espetáculo precisa de drama, afinal!"
      ];

      let user = interaction.options.getUser("usuário");
      let motivo = motivosCancelamento[Math.floor(Math.random() * motivosCancelamento.length)];

      await interaction.editReply({
        content: `<:1000210946:1373427405737168947> | ${user} foi cancelado ${motivo}`
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
};
