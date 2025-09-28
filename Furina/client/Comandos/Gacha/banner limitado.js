const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  AttachmentBuilder
} = require("discord.js");

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

      let pityData;
      let bannerFile;
      if (bannerChoice === "mochileiro") {
        pityData = userdb.gacha.pityMochileiro;
        bannerFile = `./Furina/img/banners/Mochileiro.jpeg`;
      } else if (bannerChoice === "regional") {
        pityData = userdb.gacha.regional;
        bannerFile = `./Furina/img/banners/RegionalInazuma.jpeg`;
      } else if (bannerChoice === "armas") {
        pityData = userdb.gacha.arma;
        bannerFile = `./Furina/img/banners/${Furina.bannerAtual}arma.jpeg`;
      } else {
        pityData = userdb.gacha.pity;
        const bannerAtualEscolhido = `${Furina.bannerAtual}-${bannerChoice === "1" || bannerChoice === "2" ? bannerChoice : "1"}`;
        bannerFile = `./Furina/img/banners/${bannerAtualEscolhido}.jpeg`;
      }

      const embed = new EmbedBuilder()
        .setTitle("**O palco estrelado desta temporada!**")
        .setImage(`attachment://${bannerFile.split("/").pop()}`)
        .setFooter({
          text: `Pity: ${pityData.five}/${pity} | Garantia: ${pityData.garantia5 ? "Sim" : "Não"}`
        })
        .setColor("#3E91CC");

      const btnId1 = Furina.CustomCollector.create(async (btnInt) => {
        await btnInt.deferUpdate();
        if (btnInt.user.id !== interaction.user.id) return btnInt.followUp({ content: "❌ Apenas quem executou o comando pode usar estes botões.", ephemeral: true });
        if (userdb.primogemas < 160) return btnInt.followUp({ content: "Uma única invocação custa 160 primogemas.", ephemeral: true });

        const resultado = await Furina.Banner.push(pityData, interaction.user.id, 1, bannerChoice, interaction.guild.id);
        const res = resultado[0];
        const gifUrl = gifs[`1tiro-t${res.raridade}`];

        await btnInt.editReply({ embeds: [new EmbedBuilder().setImage(gifUrl)], components: [], files: [] });

        setTimeout(async () => {
          const attachment = res.raridade >= 4 ? [new AttachmentBuilder(`./Furina/img/banners/${res.type === "Arma" ? "armas" : "personagens"}/${res.nome}.png`)] : [];
          const embedResult = new EmbedBuilder()
            .setTitle("**A sorte lança seus dados!**")
            .setDescription(`Você obteve: **${res.nome}** (${res.type}) - ${res.raridade}★`)
            .setColor(res.raridade === 5 ? "#D9B468" : res.raridade === 4 ? "#8A75D1" : "#A0A0A0")
            .setImage(res.raridade >= 4 ? `attachment://${res[0]?.nome}.png` : null);

          await btnInt.editReply({ embeds: [embedResult], files: attachment, components: [] });
        }, 5000);
      }, { type: "button", checkAuthor: true, authorId: interaction.user.id, timeout: 60000 });

      const btnId10 = Furina.CustomCollector.create(async (btnInt) => {
        await btnInt.deferUpdate();
        if (btnInt.user.id !== interaction.user.id) return btnInt.followUp({ content: "❌ Apenas quem executou o comando pode usar estes botões.", ephemeral: true });
        if (userdb.primogemas < 1600) return btnInt.followUp({ content: "10 invocações custam 1600 primogemas.", ephemeral: true });

        const resultado = await Furina.Banner.push(pityData, interaction.user.id, 10, bannerChoice, interaction.guild.id);
        const t5 = resultado.some(p => p.raridade === 5);
        const gifUrl = t5 ? gifs["10tiro-t5"] : gifs["10tiro-t4"];

        const attachments = resultado.filter(p => p.raridade >= 4)
          .map(p => new AttachmentBuilder(`./Furina/img/banners/${p.type === "Arma" ? "armas" : "personagens"}/${p.nome}.png`));

        const embedResult = new EmbedBuilder()
          .setTitle("**Resultado dos 10 desejos!**")
          .setDescription(resultado.map(p => `**${p.nome}** (${p.type}) - ${p.raridade}★`).join("\n"))
          .setColor("#D9B468")
          .setImage(attachments[0] ? `attachment://${attachments[0].name}` : null);

        await btnInt.editReply({ embeds: [new EmbedBuilder().setImage(gifUrl)], components: [], files: [] });
        setTimeout(async () => {
          await btnInt.editReply({ embeds: [embedResult], files: attachments, components: [] });
        }, 5000);
      }, { type: "button", checkAuthor: true, authorId: interaction.user.id, timeout: 60000 });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("1").setEmoji("<:1000211202:1373804510148821133>").setCustomId(btnId1).setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setLabel("10").setEmoji("<:1000211202:1373804510148821133>").setCustomId(btnId10).setStyle(ButtonStyle.Secondary)
      );

      await interaction.editReply({
        content: `${interaction.user}`,
        embeds: [embed],
        files: [new AttachmentBuilder(bannerFile)],
        components: [row]
      });

      if (bannerChoice === "regional"){
        return await interaction.followUp({
          content: "Na próxima versão, todos os seus personagens pegos do banner regional irão ganhar suas assinaturas.",
          ephemeral: true
        })
      }

    } catch (err) {
      console.error(err);
      const id = Furina.reportarErro({ erro: err, comando: interaction.commandName, servidor: interaction.guild });
      return interaction.editReply({
        content: `❌ Um erro ocorreu! ID: \`${id}\``,
        components: [{ type: 1, components: [{ type: 2, label: "Servidor de Suporte", style: 5, url: "https://discord.gg/KQg2B5JeBh" }] }],
        embeds: [],
        files: []
      });
    }
  }
};
