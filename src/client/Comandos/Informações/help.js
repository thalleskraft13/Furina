const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

const COR_FURINA = '#4A90E2';

module.exports = {
  name: 'ajuda',
  description: 'Mostra o menu de ajuda com categorias',
  type: 1,

  run: async (client, interaction) => {
    await interaction.reply({
      content: '🎭 Carregando informações do espetáculo... Aguarde um momento!',
      ephemeral: true,
    });

    const comandosNecessarios = [
      "banner-limitado", "personagem", "furina", "lembrete", "notificações",
      "serverinfo", "usuario", "uid", "duelo", "rank", "conquistas", "explorar",
      "guilda", "primogemas", "cancelar", "elemental", "modo-drama", "destino",
      "sorteio"
    ];

    const comandos = {};
    await Promise.all(comandosNecessarios.map(async nome => {
      comandos[nome] = await client.obterComando(nome);
    }));

    const embedInicial = new EmbedBuilder()
      .setColor(COR_FURINA)
      .setTitle('🎭 Bem-vindo ao grande palco!')
      .setDescription(
        'Este é o meu grandioso palco de comandos! De personagens encantadores a conquistas cintilantes, de primogemas a comandos visuais — tudo cuidadosamente curado por moi, Furina~\n\nExplore os menus... e descubra tudo que posso oferecer neste espetáculo fabuloso!"'
      )
      .setImage("https://files.catbox.moe/7xsldi.png")
      .setFooter({ text: '— Furina', iconURL: client.user.displayAvatarURL() })
      .setThumbnail(client.user.displayAvatarURL());

    const embeds = {
      gacha: new EmbedBuilder().setColor(COR_FURINA).setTitle('Gacha').setDescription(
`"**Ah, mon cher voyageur...!**"

* </banner-limitado:${comandos["banner-limitado"]}>
↳ **\`Veja o banner atual.\`**

* </personagem ver:${comandos["personagem"]}>
↳ **\`Veja informações de um personagem\`**

* </personagem equipe:${comandos["personagem"]}>
↳ **\`Monte sua equipe com até 4 personagens\`**`
      ).setFooter({ text: '— Furina', iconURL: client.user.displayAvatarURL() })
       .setThumbnail(client.user.displayAvatarURL()),

      informacoes: new EmbedBuilder().setColor(COR_FURINA).setTitle('Informações').setDescription(
`"**Ah, mon cher explorateur...!**"

</furina informações:${comandos["furina"]}>
↳ **\`Detalhes sobre moi, Furina!\`**

</furina ping:${comandos["furina"]}>
↳ **\`Veja minha latência atual.\`**

</lembrete:${comandos["lembrete"]}>
↳ **\`Crie um lembrete pessoal.\`**

</serverinfo:${comandos["serverinfo"]}>
↳ **\`Veja informações do servidor.\`**`
      ).setFooter({ text: '— Furina', iconURL: client.user.displayAvatarURL() })
       .setThumbnail(client.user.displayAvatarURL()),

      aventureiro: new EmbedBuilder().setColor(COR_FURINA).setTitle('Aventureiro').setDescription(
`"**Ah, mon cher aventureiro...!**"

</duelo abismo:${comandos["duelo"]}>
↳ **\`Inicie uma batalha no Abismo.\`**

</duelo membro:${comandos["duelo"]}>
↳ **\`Desafie outro jogador para PvP.\`**

</rank global:${comandos["rank"]}>
↳ **\`Rank global dos aventureiros.\`**

</conquistas:${comandos["conquistas"]}>
↳ **\`Veja suas conquistas.\`**

</explorar status:${comandos["explorar"]}>
↳ **\`Veja suas explorações ativas.\`**

</guilda convidar:${comandos["guilda"]}>
↳ **\`Convide um membro para sua guilda.\`**

</primogemas ver:${comandos["primogemas"]}>
↳ **\`Veja suas primogemas.\`**`
      ).setFooter({ text: '— Furina', iconURL: client.user.displayAvatarURL() })
       .setThumbnail(client.user.displayAvatarURL()),

      roleplay: new EmbedBuilder().setColor(COR_FURINA).setTitle('Diversão').setDescription(
`"**Ah, mon cher...! Que comece o espetáculo!**"

</cancelar:${comandos["cancelar"]}>
↳ **\`Julgue com drama e esplendor!\`**

</modo-drama:${comandos["modo-drama"]}>
↳ **\`Ative o modo drama.\`**

</destino:${comandos["destino"]}>
↳ **\`Veja o que o destino reservou!\`**`
      ).setFooter({ text: '— Furina', iconURL: client.user.displayAvatarURL() })
       .setThumbnail(client.user.displayAvatarURL()),

      administracao: new EmbedBuilder().setColor(COR_FURINA).setTitle('Administração').setDescription(
`"**Ah... o fardo do poder!**"

</sorteio criar:${comandos["sorteio"]}>
↳ **\`Crie um sorteio.\`**

</sorteio encerrar:${comandos["sorteio"]}>
↳ **\`Encerre um sorteio ativo.\`**

</sorteio reroll:${comandos["sorteio"]}>
↳ **\`Refaça o sorteio.\`**`
      ).setFooter({ text: '— Furina', iconURL: client.user.displayAvatarURL() })
       .setThumbnail(client.user.displayAvatarURL()),
    };

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(client.CustomCollector.create(async (selectInteraction) => {
        if (selectInteraction.user.id !== interaction.user.id) {
          return selectInteraction.reply({
            content: '❌ Apenas quem usou o comando pode interagir!',
            ephemeral: true,
          });
        }

        const escolha = selectInteraction.values[0];
        const embedResposta = embeds[escolha];
        await selectInteraction.update({ embeds: [embedResposta] });
      }, { authorId: interaction.user.id, timeout: 300_000 }))
      .setPlaceholder('Selecione uma categoria')
      .addOptions([
        { label: 'Gacha', value: 'gacha', description: 'Comandos do sistema Gacha' },
        { label: 'Informações', value: 'informacoes', description: 'Comandos de informações do bot' },
        { label: 'Aventureiro', value: 'aventureiro', description: 'Comandos do personagem aventureiro' },
        { label: 'Diversão', value: 'roleplay', description: 'Comandos de diversão' },
        { label: 'Administração', value: 'administracao', description: 'Comandos administrativos' },
      ]);

    const rowSelect = new ActionRowBuilder().addComponents(selectMenu);

    const rowButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Me Adicione')
        .setURL('https://discord.com/oauth2/authorize?client_id=1314904179680219136&permissions=140190805184&integration_type=0&scope=bot+applications.commands')
        .setStyle(ButtonStyle.Link),

      new ButtonBuilder()
        .setLabel('Servidor de Suporte')
        .setURL('https://discord.gg/MkneaxC8jY')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.editReply({
      content: null,
      embeds: [embedInicial],
      components: [rowSelect, rowButtons],
      ephemeral: true,
    });
  },
};
