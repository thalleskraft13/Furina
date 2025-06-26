const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ComponentType, EmbedBuilder, AttachmentBuilder } = require("discord.js");

const gifs = {
"10tiro-t4": "https://files.catbox.moe/ejr418.gif",
"10tiro-t5": "https://files.catbox.moe/4ztloj.gif",
"1tiro-t3": "https://files.catbox.moe/hlkrkx.gif",
"1tiro-t4": "https://files.catbox.moe/vay68b.gif",
"1tiro-t5": "https://files.catbox.moe/e19qre.gif"
};

module.exports = {
name: "banner-limitado",
description: "Revele qual estrela cinco estrelas reina no banner desta cena!",
type: 1,
run: async (Furina, interaction) => {
try {
let userdb = await Furina.userdb.findOne({ id: interaction.user.id });

if (!userdb) {
await new Furina.userdb({ id: interaction.user.id }).save();
userdb = await Furina.userdb.findOne({ id: interaction.user.id });
}

if (userdb.uid === "0") {
let msg = await interaction.editReply({
content: `Ah, meu caro! Vejo que ainda não há um UID gravado em seus registros. Salve-o agora para que a magia possa prosseguir!`,
components: [
new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setLabel("Enviar Uid")
.setCustomId("enviar-uid-" + interaction.user.id)
.setStyle(ButtonStyle.Secondary)
)
]
});

let collector1 = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

collector1.on("collect", async (i) => {
if (i.customId !== "enviar-uid-" + interaction.user.id) return;

const modal = new ModalBuilder()
.setCustomId('uid')
.setTitle('Envio de UID a Verificação');

let op_1 = new ActionRowBuilder()
.addComponents(
new TextInputBuilder()
.setCustomId('1')
.setLabel("Digite seu nome no Genshin Impact")
.setStyle(TextInputStyle.Short)
);

let op_2 = new ActionRowBuilder()
.addComponents(
new TextInputBuilder()
.setCustomId('2')
.setLabel("Digite seu Uid no Genshin Impact")
.setStyle(TextInputStyle.Short)
);

modal.addComponents(op_1, op_2);
await i.showModal(modal);
});
}

const bannerURL = `attachment://${Furina.bannerAtual}.jpeg`;
const file = new AttachmentBuilder(`./src/img/banners/${Furina.bannerAtual}.jpeg`);
const embed = new EmbedBuilder()
.setTitle("**O palco estrelado desta temporada!**")
.setImage(bannerURL)
.setFooter({
text: `Pity: ${userdb.gacha.pity.five}/90 | Garantia: ${userdb.gacha.pity.garantia5 ? "Sim" : "Não"}`
})
.setColor("#3E91CC");

const responss = await interaction.editReply({
content: `${interaction.user}`,
embeds: [embed],
files: [file],
components: [
new ActionRowBuilder().addComponents(
new ButtonBuilder().setLabel("1").setEmoji("<:1000211202:1373804510148821133>").setCustomId(`giros_1_${interaction.id}`).setStyle(ButtonStyle.Secondary),
new ButtonBuilder().setLabel("10").setEmoji("<:1000211202:1373804510148821133>").setCustomId(`giros_10_${interaction.id}`).setStyle(ButtonStyle.Secondary)
)
]
});

const collector = responss.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

collector.on('collect', async i => {
if (i.customId === `giros_10_${interaction.id}`) {
await i.deferUpdate();

if (userdb.primogemas < 1600) return i.followUp({ content: `Oh là là! Quanta ousadia… Pretender invocar as estrelas sem sequer 1600 primogemas?`, ephemeral: true });

const resultado = await Furina.Banner.push(userdb.gacha.pity, interaction.user.id, 10);
const t5List = resultado.filter(p => p.raridade === 5);
const t4List = resultado.filter(p => p.raridade === 4);
const t3List = resultado.filter(p => p.raridade === 3);

const t5 = t5List.length > 0;
const personagem = t5 ? t5List[0].personagem : (t4List[0]?.personagem || null);
const gifUrl = t5 ? gifs["10tiro-t5"] : gifs["10tiro-t4"];

await i.editReply({
embeds: [new EmbedBuilder().setImage(gifUrl)],
components: [],
files: []
});

setTimeout(async () => {
await i.editReply({
embeds: [
new EmbedBuilder()
.setTitle("**Eis o desfecho desta rodada de desejos!**")
.setDescription(resultado.map(p => p.personagem).join("\n"))
.setColor("#D9B468")
.setImage(`attachment://${personagem}.png`)
],
content: `${interaction.user}`,
files: [new AttachmentBuilder(`./src/img/banners/personagens/${personagem}.png`)]
});
}, 7000);
}

if (i.customId === `giros_1_${interaction.id}`) {
await i.deferUpdate();

if (userdb.primogemas < 160) return i.followUp({ content: `Oh là là! Uma única estrela custa ao menos 160 primogemas...`, ephemeral: true });

const resultado = await Furina.Banner.push(userdb.gacha.pity, interaction.user.id, 1);
const res = resultado[0];
const gifUrl = gifs[`1tiro-t${res.raridade}`];

await i.editReply({
embeds: [new EmbedBuilder().setImage(gifUrl)],
components: [],
files: []
});

setTimeout(async () => {
const embed = new EmbedBuilder()
.setTitle("**A sorte lança seus dados!**")
.setDescription(`Você obteve: **${res.personagem}**`)
.setColor(res.raridade === 5 ? "#D9B468" : res.raridade === 4 ? "#8A75D1" : "#A0A0A0")
.setImage(res.raridade < 4 ? null : `attachment://${res.personagem}.png`);

await i.editReply({
embeds: [embed],
files: res.raridade < 4 ? [] : [new AttachmentBuilder(`./src/img/banners/personagens/${res.personagem}.png`)]
});
}, 5000);
}
});
} catch (e) {
console.log(e);
return interaction.editReply(`❌ Oh là là! Algo deu errado ao executar o comando. Por favor, reporte ao servidor de suporte para que possamos trazer justiça a essa falha.\n\n\`\`\`\n${e}\n\`\`\``);
}
}
};
