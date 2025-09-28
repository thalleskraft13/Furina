const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  AttachmentBuilder
} = require("discord.js");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

const gifs = {
  "10tiro-t4": "https://files.catbox.moe/ejr418.gif",
  "10tiro-t5": "https://files.catbox.moe/4ztloj.gif",
  "1tiro-t3": "https://files.catbox.moe/hlkrkx.gif",
  "1tiro-t4": "https://files.catbox.moe/vay68b.gif",
  "1tiro-t5": "https://files.catbox.moe/e19qre.gif"
};

module.exports = {
  name: "gacha",
  description: "Revele qual estrela brilha no seu desejo!",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],

  options: [
    {
      name: "banner",
      description: "Escolha o banner para desejar",
      type: 3,
      required: true,
      choices: [
        { name: "Limitado 1", value: "1" },
        { name: "Limitado 2", value: "2" },
        { name: "Mochileiro", value: "mochileiro" },
        { name: "Regional Inazuma", value: "regional" },
        { name: "Armas", value: "armas" }
      ],
    },
  ],

  run: async (Furina, interaction) => {
    try {
      const bannerChoice = interaction.options.getString("banner") || "1";
      await interaction.deferReply();

      let userdb = await Furina.userdb.findOne({ id: interaction.user.id });
      if (!userdb) {
        await new Furina.userdb({ id: interaction.user.id }).save();
        userdb = await Furina.userdb.findOne({ id: interaction.user.id });
      }

      const agora = Date.now();
      let serverDB = await Furina.serverdb.findOne({ serverId: interaction.guild.id });
      if (!serverDB) {
        let newserver = new Furina.serverdb({ serverId: interaction.guild.id });
        await newserver.save();
        serverDB = await Furina.serverdb.findOne({ serverId: interaction.guild.id });
      }

      const isUserPremium = userdb.premium && userdb.premium > agora;
      const isServerPremium = serverDB?.premium && serverDB.premium > agora;
      const mareDourada = serverDB?.mareDouradaConfig || {};

      let pity = 90;
      if (isUserPremium) pity = 60;
      else if (isServerPremium && mareDourada.diminuiPity) pity = 75;

      // Escolha do banner
      let pityData;
      let bannerFile;
      let bannerURL;

      if (bannerChoice === "mochileiro") {
        pityData = userdb.gacha.pityMochileiro;
        bannerFile = new AttachmentBuilder(`./Furina/img/banners/Mochileiro.jpeg`);
        bannerURL = "attachment://Mochileiro.jpeg";
      } else if (bannerChoice === "regional") {
        pityData = userdb.gacha.regional;
        bannerFile = new AttachmentBuilder(`./Furina/img/banners/RegionalInazuma.jpeg`);
        bannerURL = "attachment://RegionalInazuma.jpeg";
      } else if (bannerChoice === "armas") {
        pityData = userdb.gacha.arma;
        bannerFile = new AttachmentBuilder(`./Furina/img/banners/${Furina.bannerAtual}arma.jpeg`);
        bannerURL = `attachment://${Furina.bannerAtual}arma.jpeg`;
      } else {
        pityData = userdb.gacha.pity;
        const bannerAtualEscolhido = `${Furina.bannerAtual}-${bannerChoice}`;
        bannerFile = new AttachmentBuilder(`./Furina/img/banners/${bannerAtualEscolhido}.jpeg`);
        bannerURL = `attachment://${bannerAtualEscolhido}.jpeg`;
      }

      // Embed inicial
      const embed = new EmbedBuilder()
        .setTitle("**O palco estrelado desta temporada!**")
        .setImage(bannerURL)
        .setFooter({
          text: `Pity: ${pityData.five}/${pity} | Garantia: ${pityData.garantia5 ? "Sim" : "Não"}`
        })
        .setColor("#3E91CC");

      // Função que gera imagem
      async function gerarImagemBanner(resultado, qtde) {
        const WIDTH = 1250, HEIGHT = 600;
        const canvas = createCanvas(WIDTH, HEIGHT);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#111"; ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const baseDir = path.join(process.cwd(), "Furina", "img", "banners");
        const images = [];
        for (const p of resultado) {
          try {
            let imgPath = path.join(baseDir, p.type === "Arma" ? "armas" : "personagens", `${p.nome}.png`);
            images.push(await loadImage(imgPath));
          } catch {
            images.push(null);
          }
        }
        for (let i = 0; i < resultado.length; i++) {
          const p = resultado[i];
          const img = images[i];
          if (img) ctx.drawImage(img, i * 120, 100, 100, 100);
          ctx.fillStyle = "#fff";
          ctx.fillText(`${p.nome} (${p.raridade}★)`, i * 120, 230);
        }
        return canvas.toBuffer("image/jpeg", { quality: 0.8 });
      }

      // Botão de 1 tiro
      const btnId1 = Furina.CustomCollector.create(async (btnInt) => {
        await btnInt.deferUpdate();
        if (btnInt.user.id !== interaction.user.id) return;
        if (userdb.primogemas < 160) return;

        const resultado = await Furina.Banner.push(pityData, interaction.user.id, 1, bannerChoice, interaction.guild.id);
        const res = resultado[0];
        const gifUrl = gifs[`1tiro-t${res.raridade}`];

        await btnInt.editReply({ embeds: [new EmbedBuilder().setImage(gifUrl)], components: [], files: [] });

        setTimeout(async () => {
          // envia a imagem no canal e pega a URL
          let url = null;
          if (res.raridade >= 4) {
            const file = new AttachmentBuilder(`./Furina/img/banners/${res.type === "Arma" ? "armas" : "personagens"}/${res.nome}.png`);
            const msg = await interaction.channel.send({ files: [file] });
            url = msg.attachments.first().url;
          }

          const embed = new EmbedBuilder()
            .setTitle("**A sorte lança seus dados!**")
            .setDescription(`Você obteve: **${res.nome}** (${res.type}) - ${res.raridade}★`)
            .setColor(res.raridade === 5 ? "#D9B468" : res.raridade === 4 ? "#8A75D1" : "#A0A0A0");

          if (url) embed.setImage(url);

          await btnInt.editReply({ embeds: [embed], files: [] });
        }, 5000);
      }, { type: "button", checkAuthor: true, authorId: interaction.user.id, timeout: 60000 });

      // Botão de 10 tiros
      const btnId10 = Furina.CustomCollector.create(async (btnInt) => {
        await btnInt.deferUpdate();
        if (btnInt.user.id !== interaction.user.id) return;
        if (userdb.primogemas < 1600) return;

        const resultado = await Furina.Banner.push(pityData, interaction.user.id, 10, bannerChoice, interaction.guild.id);
        const t5 = resultado.some(p => p.raridade === 5);
        const gifUrl = t5 ? gifs["10tiro-t5"] : gifs["10tiro-t4"];

        await btnInt.editReply({ embeds: [new EmbedBuilder().setImage(gifUrl)], components: [], files: [] });

        setTimeout(async () => {
          const buffer = await gerarImagemBanner(resultado, 10);
          const msg = await interaction.channel.send({ files: [new AttachmentBuilder(buffer, { name: "resultado.jpg" })] });
          const url = msg.attachments.first().url;

          await btnInt.editReply({
            content: `${interaction.user}`,
            embeds: [new EmbedBuilder()
              .setTitle("**Resultado dos 10 desejos!**")
              .setDescription(resultado.map(p => `**${p.nome}** (${p.type}) - ${p.raridade}★`).join("\n"))
              .setColor("#D9B468")
              .setImage(url)
            ]
          });
        }, 7000);
      }, { type: "button", checkAuthor: true, authorId: interaction.user.id, timeout: 60000 });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("1").setEmoji("<:1000211202:1373804510148821133>").setCustomId(btnId1).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setLabel("10").setEmoji("<:1000211202:1373804510148821133>").setCustomId(btnId10).setStyle(ButtonStyle.Secondary)
      );

      await interaction.editReply({
        content: `${interaction.user}`,
        embeds: [embed],
        files: [bannerFile],
        components: [row]
      });

    } catch (err) {
      console.error(err);
      return interaction.editReply({
        content: `❌ Um erro ocorreu!`,
        components: [{ type: 1, components: [{ type: 2, label: "Servidor de Suporte", style: 5, url: "https://discord.gg/KQg2B5JeBh" }] }],
        embeds: [],
        files: []
      });
    }
  }
};
