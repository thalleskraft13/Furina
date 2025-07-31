const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType
} = require("discord.js");

module.exports = {
  name: "conquistas",
  description: "Veja suas conquistas gloriosas.",
  type: 1,

  async run(client, interaction) {
    await interaction.deferReply();
    const usuarioConquistas = (await client.conquistas.listarConquistasPorCategoria(interaction.user.id)) || {};

    let todasConquistasUsuario = [];
    for (const catUser in usuarioConquistas) {
      todasConquistasUsuario = todasConquistasUsuario.concat(usuarioConquistas[catUser]);
    }

    const conquistasDetalhadas = todasConquistasUsuario.map(c => {
      const info = client.conquistasJson.find(x => String(x.id) === String(c.id));
      return {
        id: c.id,
        data: c.data,
        nome: info ? info.nome : "Nome não encontrado",
        descricao: info ? info.descricao : "Descrição não encontrada",
        cartegoria: info ? info.cartegoria : c.cartegoria || "Sem categoria"
      };
    });

    const conquistasPorCategoria = {};
    for (const c of conquistasDetalhadas) {
      if (!conquistasPorCategoria[c.cartegoria]) {
        conquistasPorCategoria[c.cartegoria] = [];
      }
      conquistasPorCategoria[c.cartegoria].push(c);
    }

    const categorias = Object.keys(conquistasPorCategoria);
    const total = categorias.reduce((acc, cat) => acc + conquistasPorCategoria[cat].length, 0);

    if (total === 0) {
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🌊✨ Conquistas de Furina")
            .setDescription("Você ainda não possui nenhuma conquista desbloqueada...\n\nMas não tema! O palco da vida ainda reserva glórias para você.")
            .setColor("#7ed6df")
        ]
      });
    }

    const embedInicial = new EmbedBuilder()
      .setTitle("🌊✨ Minhas Glórias, Suas Conquistas")
      .setDescription([
        "“Oh, como é glorioso ver as histórias que você escreveu sob meu julgamento!”\n",
        `🔹 Conquistas desbloqueadas: **${total}**`,
        `🔸 Escolha uma categoria abaixo para admirar seus feitos.`
      ].join("\n"))
      .setColor("#00d4ff")
      .setFooter({ text: "Tribunal de Fontaine • Arquivos de Conquistas", iconURL: client.user.displayAvatarURL() });

    const menu = new StringSelectMenuBuilder()
      .setCustomId("menu_conquistas")
      .setPlaceholder("Selecione uma categoria, mon cher.")
      .addOptions(
        categorias.map(cat => ({
          label: cat,
          value: cat,
          emoji: "📜"
        }))
      );

    const row = new ActionRowBuilder().addComponents(menu);

    const msg = await interaction.editReply({ embeds: [embedInicial], components: [row], fetchReply: true });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000,
      filter: i => i.user.id === interaction.user.id
    });

    collector.on("collect", async (i) => {
      const categoria = i.values[0];
      const conquistas = conquistasPorCategoria[categoria];

      const descricaoFormatada = conquistas.map(c => {
        return `• **${c.nome}**\n  _${c.descricao}_\n  _Desbloqueada em:_ ${c.data}`;
      }).join("\n\n");

      const embedCategoria = new EmbedBuilder()
        .setTitle(`🎭 Conquistas — ${categoria}`)
        .setDescription(descricaoFormatada || "*Nenhuma conquista nessa categoria... ainda.*")
        .setColor("#2980b9")
        .setFooter({ text: "“Mesmo os atos menores compõem o grande espetáculo da vida.” – Furina" });

      await i.update({ embeds: [embedCategoria], components: [row] });
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
};
