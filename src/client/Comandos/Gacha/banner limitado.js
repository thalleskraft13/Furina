const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
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
  name: "banner-limitado",
  description: "Revele qual estrela cinco estrelas reina no banner desta cena!",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],

  // Aqui você adiciona a opção (choice) do comando, para o banner (1 ou 2)
  options: [
    {
      name: "banner",
      description: "Escolha o banner limitado (1 ou 2)",
      type: 3, // STRING
      required: true,
      choices: [
        { name: "Banner 1", value: "1" },
        { name: "Banner 2", value: "2" }
      ],
    },
  ],

  run: async (Furina, interaction) => {
    try {
      // Pega o valor da escolha no comando
      const bannerChoice = interaction.options.getString("banner") || "1";

      let userdb = await Furina.userdb.findOne({ id: interaction.user.id });
      if (!userdb) {
        await new Furina.userdb({ id: interaction.user.id }).save();
        userdb = await Furina.userdb.findOne({ id: interaction.user.id });
      }

      async function gerarImagemBanner(resultado, qtde) {
        const WIDTH = 1250;
        const HEIGHT = 600;
        const canvas = createCanvas(WIDTH, HEIGHT);
        const ctx = canvas.getContext("2d");

        const gradient = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, HEIGHT * 0.1, WIDTH / 2, HEIGHT / 2, HEIGHT);
        gradient.addColorStop(0, "#1e2251");
        gradient.addColorStop(1, "#0d0f2c");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        const spacing = 8;
        const maxTotalHeight = HEIGHT * 0.9;
        const starAreaHeight = maxTotalHeight * 0.12;
        const maxItemHeight = maxTotalHeight - starAreaHeight;

        const itemHeight = maxItemHeight;
        const itemWidth = itemHeight / 4;
        const startY = (HEIGHT - maxTotalHeight) / 2 + starAreaHeight;

        function getBorderColor(rarity) {
          if (rarity === 5) return "#FFD700";
          if (rarity === 4) return "#A86EF9";
          return "#3B91FF";
        }

        function getStarColor(rarity) {
          if (rarity === 5) return "#FFD700";
          if (rarity === 4) return "#A86EF9";
          return "#88BBFF";
        }

        function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
          let rot = Math.PI / 2 * 3;
          const step = Math.PI / spikes;
          ctx.beginPath();
          ctx.moveTo(cx, cy - outerRadius);
          for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
            rot += step;
          }
          ctx.closePath();
        }

        function drawStars(x, y, rarity, itemWidth) {
          const starSizeOuter = itemWidth * 0.1;
          const starSizeInner = starSizeOuter * 0.5;
          const spacing = starSizeOuter * 2;
          const totalWidth = spacing * rarity;
          const startX = x + (itemWidth - totalWidth) / 2 + starSizeOuter;
          for (let i = 0; i < rarity; i++) {
            const cx = startX + i * spacing;
            const cy = y;
            ctx.save();
            ctx.shadowColor = "rgba(255, 255, 255, 0.7)";
            ctx.shadowBlur = starSizeOuter * 0.8;
            ctx.fillStyle = getStarColor(rarity);
            drawStar(ctx, cx, cy, 5, starSizeOuter, starSizeInner);
            ctx.fill();
            ctx.shadowColor = "transparent";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
          }
        }

        function drawDecorativeBorder(ctx, x, y, width, height, rarity) {
          const spikeDepth = width * 0.07;
          const radius = width * 0.2;
          ctx.lineWidth = Math.max(2, width * 0.05);
          ctx.strokeStyle = getBorderColor(rarity);
          ctx.shadowColor = ctx.strokeStyle;
          ctx.shadowBlur = width * 0.1;
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          const midTopX = x + width / 2;
          ctx.lineTo(midTopX - spikeDepth, y);
          ctx.quadraticCurveTo(midTopX, y - spikeDepth * 1.5, midTopX + spikeDepth, y);
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          const midRightY = y + height / 2;
          ctx.lineTo(x + width, midRightY - spikeDepth);
          ctx.quadraticCurveTo(x + width + spikeDepth * 1.5, midRightY, x + width, midRightY + spikeDepth);
          ctx.lineTo(x + width, y + height - radius);
          ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          const midBottomX = x + width / 2;
          ctx.lineTo(midBottomX + spikeDepth, y + height);
          ctx.quadraticCurveTo(midBottomX, y + height + spikeDepth * 1.5, midBottomX - spikeDepth, y + height);
          ctx.lineTo(x + radius, y + height);
          ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
          const midLeftY = y + height / 2;
          ctx.lineTo(x, midLeftY + spikeDepth);
          ctx.quadraticCurveTo(x - spikeDepth * 1.5, midLeftY, x, midLeftY - spikeDepth);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        const baseDir = path.join(process.cwd(), "src", "img", "banners");

        async function loadItemImage(p) {
          let basePath = "";
          if (qtde === 10) {
            if (p.type === "Personagem") {
              basePath = path.join(baseDir, "personagens", "10tiro");
            } else {
              basePath = path.join(baseDir, "armas");
            }
          } else {
            if (p.type === "Personagem") {
              basePath = path.join(baseDir, "personagens");
            } else {
              basePath = path.join(baseDir, "armas");
            }
          }
          if (p.nome === "Scaramouche"){
          const filePath = path.join(basePath, `Scaramouche.png`);
          return loadImage(filePath);
          } else {
            const filePath = path.join(basePath, `${p.nome}.png`);
          return loadImage(filePath);
          }
        }

        const ordenado = [...resultado].sort((a, b) => {
          if (a.type === b.type) return 0;
          return a.type === "Personagem" ? -1 : 1;
        });

        const images = [];
        for (const p of ordenado) {
          try {
            const img = await loadItemImage(p);
            images.push(img);
          } catch {
            images.push(null);
          }
        }

        for (let i = 0; i < ordenado.length; i++) {
          const p = ordenado[i];
          const img = images[i];
          const x = i * (itemWidth + spacing);
          const y = startY;
          drawDecorativeBorder(ctx, x, y, itemWidth, itemHeight, p.raridade);
          if (img) {
            ctx.drawImage(img, x + itemWidth * 0.05, y + itemHeight * 0.05, itemWidth * 0.9, itemHeight * 0.9);
          }
          drawStars(x, y - starAreaHeight * 0.7, p.raridade, itemWidth);
        }

        return canvas.toBuffer();
      }

      const premium = userdb.premium;
      const agora = Date.now();
      let pity = 90;
      if (premium > agora) pity = 60;

      // Aqui formamos o bannerAtual com a escolha do banner: ex: "nomeBanner-1" ou "nomeBanner-2"
      const bannerAtualEscolhido = `${Furina.bannerAtual}-${bannerChoice}`;

      const bannerURL = `attachment://${bannerAtualEscolhido}.jpeg`;
      const file = new AttachmentBuilder(`./src/img/banners/${bannerAtualEscolhido}.jpeg`);

      const embed = new EmbedBuilder()
        .setTitle("**O palco estrelado desta temporada!**")
        .setImage(bannerURL)
        .setFooter({
          text: `Pity: ${userdb.gacha.pity.five}/${pity} | Garantia: ${userdb.gacha.pity.garantia5 ? "Sim" : "Não"}`
        })
        .setColor("#3E91CC");

      const responss = await interaction.editReply({
        content: `${interaction.user}`,
        embeds: [embed],
        files: [file],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("1")
              .setEmoji("<:1000211202:1373804510148821133>")
              .setCustomId(`giros_1_${interaction.id}`)
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setLabel("10")
              .setEmoji("<:1000211202:1373804510148821133>")
              .setCustomId(`giros_10_${interaction.id}`)
              .setStyle(ButtonStyle.Secondary)
          )
        ]
      });

      const collector = responss.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60000
      });

      collector.on("collect", async i => {
        if (i.customId === `giros_10_${interaction.id}`) {
          await i.deferUpdate();
          if (userdb.primogemas < 1600)
            return i.followUp({
              content: `Oh là là! Quanta ousadia… Pretender invocar as estrelas sem sequer 1600 primogemas?`,
              ephemeral: true
            });

          const resultado = await Furina.Banner.push(userdb.gacha.pity, interaction.user.id, 10, `${bannerChoice}`);
          const t5 = resultado.some(p => p.raridade === 5);
          const gifUrl = t5 ? gifs["10tiro-t5"] : gifs["10tiro-t4"];

          await i.editReply({
            embeds: [new EmbedBuilder().setImage(gifUrl)],
            components: [],
            files: []
          });

          setTimeout(async () => {
            const buffer = await gerarImagemBanner(resultado, 10);
            const attachment = new AttachmentBuilder(buffer, { name: "resultado_10tiros.png" });

            await i.editReply({
              content: `${interaction.user}`,
              embeds: [
                new EmbedBuilder()
                  .setTitle("**Eis o desfecho desta rodada de desejos!**")
                  .setDescription(
                    resultado
                      .map(p => `**${p.nome}** (${p.type}) - ${p.raridade}★`)
                      .join("\n")
                  )
                  .setColor("#D9B468")
                  .setImage("attachment://resultado_10tiros.png")
              ],
              files: [attachment]
            });
          }, 7000);
        }

        if (i.customId === `giros_1_${interaction.id}`) {
          await i.deferUpdate();
          if (userdb.primogemas < 160)
            return i.followUp({
              content: `Oh là là! Uma única estrela custa ao menos 160 primogemas...`,
              ephemeral: true
            });

          const resultado = await Furina.Banner.push(userdb.gacha.pity, interaction.user.id, 1, `${bannerChoice}`);
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
              .setDescription(`Você obteve: **${res.nome}** (${res.type}) - ${res.raridade}★`)
              .setColor(
                res.raridade === 5 ? "#D9B468" : res.raridade === 4 ? "#8A75D1" : "#A0A0A0"
              )
              .setImage(res.raridade < 4 ? null : `attachment://${res.nome}.png`);

            await i.editReply({
              embeds: [embed],
              files:
                res.raridade < 4
                  ? []
                  : [new AttachmentBuilder(`./src/img/banners/personagens/${res.nome}.png`)]
            });
          }, 5000);
        }
      });
    } catch (e) {
      console.log(e);
      return interaction.editReply(
        `❌ Oh là là! Algo deu errado ao executar o comando. Por favor, reporte ao servidor de suporte para que possamos trazer justiça a essa falha.\n\n\`\`\`\n${e}\n\`\`\``
      );
    }
  }
};
