const { ActionRowBuilder, ButtonBuilder,  ButtonStyle, ModalBuilder, TextInputBuilder, ComponentType, TextInputStyle, TextDisplayBuilder, ThumbnailBuilder, SectionBuilder, SeparatorBuilder, SeparatorSpacingSize, ContainerBuilder, MediaGalleryBuilder, MediaGalleryItemBuilder } = require("discord.js");

const Discord = require("discord.js");
const ms = require("ms")
module.exports = {
name: "banner-limitado",
description: "Revele qual estrela cinco estrelas reina no banner desta cena!",
type: 1,
run: async(Furina, interaction) => {


let userdb = await Furina.userdb.findOne({
  id: interaction.user.id 
})

if (!userdb){
  let newuser = new Furina.userdb({
    id: interaction.user.id
  })

  await newuser.save();

  userdb = await Furina.userdb.findOne({
  id: interaction.user.id 
})
}

  if (userdb.uid === "0"){

       let msg = await interaction.editReply({
        content: `Ah, meu caro! Vejo que ainda não há um UID gravado em seus registros. Salve-o agora para que a magia possa prosseguir!`,
        components: [new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Enviar Uid").setCustomId("enviar-uid-"+interaction.user.id).setStyle(ButtonStyle.Secondary))]
      })
  } else {

const file = new Discord.AttachmentBuilder('./img/banners/' + Furina.bannerAtual + ".jpeg");

let embed = new Discord.EmbedBuilder()
.setTitle("**O palco estrelado desta temporada!**")
.setImage("attachment://" + Furina.bannerAtual + ".jpeg")
.setFooter({ text: `Pity: ${userdb.gacha.pity.five}/90 | Garantia: ${userdb.gacha.pity.garantia5 ? "Sim" : "Não"}`})
.setColor("#3E91CC")


let responss = await interaction.editReply({
embeds: [embed],
files: [file],
content: `${interaction.user}`,
components: [new Discord.ActionRowBuilder()
.addComponents(
new Discord.ButtonBuilder()
.setLabel("1")
.setEmoji("<:1000211202:1373804510148821133>")
.setCustomId(`giros_1_${interaction.id}`)
.setStyle(Discord.ButtonStyle.Secondary),
new Discord.ButtonBuilder()
.setLabel("10")
.setEmoji("<:1000211202:1373804510148821133>")
.setCustomId(`giros_10_${interaction.id}`)
.setStyle(Discord.ButtonStyle.Secondary)
)]
})


const collector = responss.createMessageComponentCollector({ componentType: Discord.ComponentType.Button, time: ms("1m") });


collector.on('collect', async(i) => {
  if (i.customId ==! "enviar-uid-"+interaction.user.id) {
        const modal = new ModalBuilder()
			.setCustomId('uid')
			.setTitle('Envio de UID a Verificação')

        let op_1 = new ActionRowBuilder()
        .addComponents(
          new TextInputBuilder()
		       	.setCustomId('1')
		        .setLabel("Digite seu nome no Genshin Impact")
		         .setStyle(TextInputStyle.Short)
        )

        let op_2 = new ActionRowBuilder()
        .addComponents(
          new TextInputBuilder()
		       	.setCustomId('2')
		        .setLabel("Digite seu Uid no Genshin Impact")
		         .setStyle(TextInputStyle.Short)
        )

        modal.addComponents(op_1, op_2);
        await i.showModal(modal)
        
      
    }  else if (i.customId === `giros_10_${interaction.id}`){
await i.deferUpdate();


if (userdb.primogemas < 1600) return await i.followUp({
  content: `Oh là là! Quanta ousadia… Pretender invocar as estrelas sem sequer 1600 primogemas? Mon cher, o palco não se curva a bolsos vazios!`,
  ephemeral: true
})

let resultado = await Furina.Banner.push(userdb.gacha.pity, interaction.user.id, 10)

console.log(resultado)



const t5List = resultado.filter(p => p.raridade === 5);
const t4List = resultado.filter(p => p.raridade === 4);
const t3List = resultado.filter(p => p.raridade === 3);

// Verificar se saiu um 5 estrelas
const t5 = t5List.length > 0;
const personagem = t5 ? t5List[0].personagem : (t4List[0]?.personagem || null);


let gif;
let data = {};

if (t5){
  gif = new Discord.AttachmentBuilder('./img/wish/10tiro-t5.gif');
  data = {
    files: [new Discord.AttachmentBuilder("./img/banners/personagens/" + personagem + ".png")],
    content: `${interaction.user}`,
    embeds: [new Discord.EmbedBuilder()
            .setTitle(`**Eis o desfecho desta rodada de desejos!**`)
            .setDescription(`${resultado.map(p => p.personagem).join("\n")}`)
            .setColor("#D9B468")
            .setImage(`attachment://${personagem}.png`)]
  }
} else {
  gif = new Discord.AttachmentBuilder('./img/wish/10tiro-t4.gif');

  data = {
    files: [new Discord.AttachmentBuilder("./img/banners/personagens/" + personagem + ".png")],
    content: `${interaction.user}`,
    embeds: [new Discord.EmbedBuilder()
            .setTitle(`**Eis o desfecho desta rodada de desejos!**`)
            .setDescription(`${resultado.map(p => p.personagem).join("\n")}`)
            .setColor("#D9B468")
            .setImage(`attachment://${personagem}.png`)]
  }
}

await i.editReply({
  files: [gif],
  components: [],
  embeds: []
})

setTimeout(async() => {
  
  await i.editReply(data)
}, 7000)

}   else if (i.customId === `giros_1_${interaction.id}`) {
    await i.deferUpdate();

    if (userdb.primogemas < 160) return await i.followUp({
      content: `Oh là là! Uma única estrela custa ao menos 160 primogemas, mon cher… Volte quando seu brilho puder pagar pelo espetáculo!`,
      ephemeral: true
    });

    let resultado = await Furina.Banner.push(userdb.gacha.pity, interaction.user.id, 1);
    const res = resultado[0];

    let gif, data;

    if (res.raridade === 5 || res.raridade === 4) {
      gif = new Discord.AttachmentBuilder(`./img/wish/1tiro-t${res.raridade}.gif`);
      
      data = {
        files: [new Discord.AttachmentBuilder(`./img/banners/personagens/${res.personagem}.png`)],
        content: `${interaction.user}`,
        embeds: [new Discord.EmbedBuilder()
          .setTitle("**A sorte lança seus dados!**")
          .setDescription(`Você obteve: **${res.personagem}**`)
          .setColor(res.raridade === 5 ? "#D9B468" : "#8A75D1")
          .setImage(`attachment://${res.personagem}.png`)]
      };
    } else {
      gif = new Discord.AttachmentBuilder(`./img/wish/1tiro-t3.gif`);

      data = {
        content: `${interaction.user}`,
        embeds: [new Discord.EmbedBuilder()
          .setTitle("**A sorte lança seus dados!**")
          .setDescription(`Você obteve: **${res.personagem}**`)
          .setColor("#A0A0A0")]
      };
    }

    await i.editReply({
      files: [gif],
      components: [],
      embeds: []
    });

    setTimeout(async () => {
      await i.editReply({embeds: [data], files: []});
    }, 5000);
  }

})}
}
}