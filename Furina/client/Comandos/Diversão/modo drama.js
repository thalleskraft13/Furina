module.exports = {
name: "modo-drama",
description: "Transforme qualquer momento banal em um espetáculo digno da Ópera de Fontaine!",
type: 1,
run: async (client, interaction) => {
try {
  await interaction.deferReply();
const dramaMode = [
`Oh, céus estrelados! ${interaction.user} ousou respirar… que audácia sem igual!`,
`As cortinas se abrem! ${interaction.user} digitou. E assim, um novo ato da tragédia divina começa.`,
`Um clique... UMA ESCOLHA! ${interaction.user} pode ter mudado o rumo do mundo.`,
`Drama! Escândalo! ${interaction.user} apenas chegou online, mas o universo já reage.`,
`Com um comando, ${interaction.user} iniciou uma ópera interativa!`,
`A arte do exagero se materializa com ${interaction.user}.`,
`Silêncio na corte! ${interaction.user} mandou um emoji enigmático.`,
`Nada mais será o mesmo… ${interaction.user} leu e não respondeu.`,
`Drama-mode ativo! ${interaction.user} apenas existindo já é arte.`,
`Plateia emocionada… ${interaction.user} digitou 'rs'. E isso foi tudo.`,
`O palco pertence a ${interaction.user}. Que comece o espetáculo!`,
`${interaction.user} foi visto indo até a cozinha. Fontes confirmam: tensão nos bastidores.`,
`As estrelas pararam só para ver ${interaction.user} trocando de status.`,
`Um drama em três atos, estrelando: ${interaction.user} e um meme duvidoso.`,
`O mundo observa… ${interaction.user} usou maiúsculas. Intriga?`,
`Plot twist! ${interaction.user} está digitando... mas não enviou.`,
`O julgamento começou! E ${interaction.user} é o acusado, o júri e o narrador.`,
`Tudo desmoronou quando ${interaction.user} mudou a foto de perfil.`,
`Reviravolta: ${interaction.user} achou que era só um comando normal.`,
`A plateia suspira… e ${interaction.user} troca o nick. Mudança de persona?`,
`Cortinas caem, aplausos sobem… por um simples 'ok' de ${interaction.user}.`,
`Uma lágrima escorre... e foi digitada por ${interaction.user}.`,
`Mistério, paixão e pão com manteiga. O drama de ${interaction.user} é completo.`,
`${interaction.user} abriu o chat. Uma entrada triunfal.`,
`Fontaine treme… ${interaction.user} reagiu com uma carinha triste.`,
`Declaro oficialmente: drama instaurado. Culpado? ${interaction.user}.`,
`A emoção é tanta que até o Venti ficou sóbrio. Obrigado, ${interaction.user}.`,
`A peça recomeça. ${interaction.user} mandou outra figurinha.`,
`Dissonância emocional detectada. Causa: ${interaction.user}.`,
`A atmosfera muda. Um suspiro de ${interaction.user} ecoa.`,
`O silêncio é quebrado… por um gif dramático de ${interaction.user}.`,
`${interaction.user} enviou 3 mensagens seguidas. Isso é guerra.`,
`Um novo capítulo começa com um "oi" de ${interaction.user}.`,
`Dramaturgia? Não, é só o jeito natural de ${interaction.user}.`,
`Censura? Nunca! ${interaction.user} falou "aff" e mereceu um Oscar.`,
`Entre tapas e reacts, ${interaction.user} reina.`,
`Uma reação inesperada. Uma plateia chocada. ${interaction.user} fez isso.`,
`Chuva? Não. São as lágrimas da reação de ${interaction.user}.`,
`${interaction.user} vive como se cada mensagem fosse uma cena final.`,
`O roteiro era simples… até ${interaction.user} entrar em cena.`,
`Drama constante. Glória eterna. ${interaction.user} é o caos.`,
`Entre lamentos e risadas, ${interaction.user} brilha como estrela.`,
`Nem a Nahida previu tamanha emoção causada por ${interaction.user}.`,
`Eis que ${interaction.user} exclui a mensagem. Mistério sem fim.`,
`O tom mudou. ${interaction.user} usou ponto final.`,
`Inquietante! ${interaction.user} curtiu uma mensagem de 3 dias atrás.`,
`Drama cósmico: ${interaction.user} saiu e voltou no grupo.`,
`Poético demais para ser real. Mas é só ${interaction.user} mesmo.`,
`Cada frase de ${interaction.user} parece um monólogo profundo.`,
`A existência de ${interaction.user} é uma novela em loop eterno.`,
];

let drama = dramaMode[Math.floor(Math.random() * dramaMode.length)];

return await interaction.editReply({
content: `${drama}`
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
