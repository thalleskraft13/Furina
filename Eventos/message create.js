const Furina = require("../index.js");
const { EmbedBuilder, AttachmentBuilder, TextDisplayBuilder, ThumbnailBuilder, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, ButtonBuilder, ButtonStyle, MediaGalleryBuilder, MediaGalleryItemBuilder, ContainerBuilder } = require("discord.js");

let mods = ["890320875142930462"];
let prefix = "g!";

Furina.on("messageCreate", async(message) => {
  if (message.author.bot) return;

  await Furina.RankAventureiro.addXp(message.author.id, 5);

    if (message.content === `<@${Furina.user.id}>` || message.content === `<@!${Furina.user.id}>`){
        await message.reply({
            content: "Oh, uma menção? Furina está aqui, pronta para guiar tua aventura!\nUse `/ajuda` para descobrir meus poderes!"
        })
    } else {
        if(!message.content.startsWith(prefix)) return; 
  const args = message.content.slice(prefix.length).trim().split(/ +/g); 
	const cmd = args.shift().toLowerCase();
	if(cmd.length === 0) return;
  if (!mods.includes(message.author.id)) return;

  if (cmd === "uid"){
    let user = args[0];
    let uid = args[1];
    let status = args[2];

    if (!user || !uid || !status ) return message.reply("Formato inválido. \ng!uid <userId> <uid> <status>")


    let userdb = await Furina.userdb.findOne({
      id: user
    })

    message.reply("Verificação concluida.")

    if (status === "aprovado"){
      userdb.uid = uid;
      userdb.primogemas += 1600;
      await userdb.save();

      Furina.users.cache.get(user)
      .send({
        embeds: [new EmbedBuilder()
                .setTitle("Verificação Concluída")
                .setDescription(`Oh là là! Seu UID foi verificado pelo distinto moderador ${message.author}! E como todo grande ato merece sua recompensa... receba agora 1600 primogemas pelo seu esplêndido desempenho`)
                .setColor("Green")]
      })
    } else if (status === "recusado"){
      Furina.users.cache.get(user)
      .send({
        embeds: [new EmbedBuilder()
                .setTitle("Verificação Concluída")
                .setDescription(`Tsc... que decepção trágica! Seu UID foi analisado pelo moderador ${message.author}, mas, infelizmente, não passou na verificação. O palco exige autenticidade, mon cher!`)
                .setColor("Red")]
      })
    }
  }

  if (cmd === "g!lei"){

    const components = [
        new ContainerBuilder()
            .setAccentColor(1012179)
            .addSectionComponents(
                new SectionBuilder()
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL("https://i.imgur.com/C76KYYR.jpeg")
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("# **Bienvenue ao grande palco de Fontaine — onde até mesmo os sussurros seguem protocolo!**"),
                    ),
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent("Antes de atravessar as cortinas do nosso servidor de suporte, leia atentamente estas regras, mon cher. A ordem deve ser preservada para que o espetáculo nunca perca seu brilho."),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addSectionComponents(
                new SectionBuilder()
                    .setThumbnailAccessory(
                        new ThumbnailBuilder()
                            .setURL("https://i.imgur.com/hmzkz7q.png")
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("## **1. O respeito é a primeira sinfonia**\nTrate todos os cidadãos deste palco com cortesia. Difamações, preconceitos ou ofensas serão imediatamente retirados da cena.\n\n## **2. A trapaça não tem lugar sob os holofotes**\nEnganar, fraudar ou explorar sistemas — seja do bot ou do servidor — será punido sem intervalo para aplausos.\n\n## **3. Mantenha o palco limpo**\nEvite spam, flood ou qualquer comportamento que atrapalhe o andamento elegante do espetáculo.\n\n## **4. A veracidade é lei em Fontaine**\nForneça informações reais ao usar sistemas como verificação de UID. Mentiras são banidas dos bastidores.\n\n## **5. Os canais têm seus papéis bem definidos**\nCada espaço tem sua função — não desvie do roteiro! Use os canais corretamente e siga as descrições.\n\n## **6. O juiz não gosta de pirataria**\nConteúdo ilegal, links suspeitos ou qualquer material impróprio será imediatamente retirado da peça.\n\n## **7. Admiração não é submissão**\nQuestione com respeito. Os moderadores são parte do elenco, mas a plateia também merece voz.\n\n## **8. Quando em dúvida, entre no camarim**\nSe algo parecer fora do script, chame um moderador. Estamos sempre entre as cortinas, atentos."),
                    ),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addSectionComponents(
                new SectionBuilder()
                    .setButtonAccessory(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel("Me adicione!")
                            .setURL("https://discord.com/oauth2/authorize?client_id=1314904179680219136&permissions=8&integration_type=0&scope=bot+applications.commands")
                    )
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent("**A violação dessas regras poderá resultar em silenciamento, expulsão ou banimento.**\nEste palco é sagrado, e todos que nele pisam devem fazê-lo com graça, respeito e um toque de drama."),
                    ),
            )
            .addSeparatorComponents(
                new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
            )
            .addMediaGalleryComponents(
                new MediaGalleryBuilder()
                    .addItems(
                        new MediaGalleryItemBuilder()
                            .setURL("https://i.imgur.com/k5DVvUx.jpeg"),
                    ),
            ),
];

    await message.channel.send({
      flags: 32768,
      components: components
    })
  }
    }
})