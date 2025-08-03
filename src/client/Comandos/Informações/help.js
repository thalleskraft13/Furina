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
      content: '🎭 Carregando o grandioso espetáculo de comandos...',
      ephemeral: true
    });

    const comandosNecessarios = [
      "banner-limitado", "personagem", "furina", "lembrete", "notificações",
      "serverinfo", "usuario", "uid", "duelo", "rank", "conquistas", "explorar",
      "guilda", "primogemas", "cancelar", "elemental", "modo-drama", "destino",
      "sorteio", "configurar"
    ];

    const comandos = {};
    await Promise.all(comandosNecessarios.map(async nome => {
      comandos[nome] = await client.obterComando(nome);
    }));

    const embedInicial = new EmbedBuilder()
      .setColor(COR_FURINA)
      .setTitle('🎭 Bem-vindo ao grande palco!')
      .setDescription(
        'Este é o meu grandioso palco de comandos! De personagens encantadores a conquistas cintilantes, de primogemas a comandos visuais — tudo cuidadosamente curado por moi, Furina~\nExplore os menus... e descubra tudo que posso oferecer neste espetáculo fabuloso!"'
      )
      .setImage("https://files.catbox.moe/7xsldi.png")
      .setFooter({ text: '— Furina', iconURL: client.user.displayAvatarURL() })
      .setThumbnail(client.user.displayAvatarURL());

    const embedGacha = new EmbedBuilder()
      .setColor(COR_FURINA)
      .setTitle('🎲 Gacha')
      .setDescription(
`**Ah, mon cher voyageur...! No grande palco de Teyvat, até mesmo os desejos dançam ao som do acaso!**

</banner-limitado:${comandos["banner-limitado"]}> — \`Veja o banner atual\`
</personagem ver:${comandos["personagem"]}> — \`Veja detalhes do personagem\`
</personagem equipe:${comandos["personagem"]}> — \`Monte sua equipe\``
      )
      .setFooter({ text: '— Furina', iconURL: client.user.displayAvatarURL() })
      .setThumbnail(client.user.displayAvatarURL());

    const embedInformacoes = new EmbedBuilder()
      .setColor(COR_FURINA)
      .setTitle('📚 Informações')
      .setDescription(
`**Ah, mon cher explorateur...! Nos corredores secretos de Teyvat, o conhecimento é poder!**

</furina informações:${comandos["furina"]}> — \`Informações sobre o bot\`
</furina ping:${comandos["furina"]}> — \`Veja a latência atual\`
</furina shards:${comandos["furina"]}> — \`Shards e clusters ativos\`
</lembrete:${comandos["lembrete"]}> — \`Crie um lembrete\`
</notificações ativar:${comandos["notificações"]}> — \`Ativar notificações no DM\`
</notificações desativar:${comandos["notificações"]}> — \`Desativar notificações\`
</serverinfo:${comandos["serverinfo"]}> — \`Informações do servidor\`
</usuario:${comandos["usuario"]}> — \`Perfil de um usuário\`
</uid salvar:${comandos["uid"]}> — \`Registrar UID\`
</uid ver:${comandos["uid"]}> — \`Ver UID de outro membro\``
      )
      .setFooter({ text: '— Furina', iconURL: client.user.displayAvatarURL() })
      .setThumbnail(client.user.displayAvatarURL());

    const embedAventureiro = new EmbedBuilder()
      .setColor(COR_FURINA)
      .setTitle('⚔️ Aventureiro')
      .setDescription(
`**Ah, mon cher aventureiro...! Cada duelo é uma dança de destino.**

</duelo abismo:${comandos["duelo"]}> — \`Inicia batalha no Abismo\`
</duelo membro:${comandos["duelo"]}> — \`PvP com outro jogador\`
</duelo status:${comandos["duelo"]}> — \`Seu histórico de duelos\`
</rank ver:${comandos["rank"]}> — \`Ranking individual\`
</rank global:${comandos["rank"]}> — \`Ranking global\`
</rank servidor:${comandos["rank"]}> — \`Ranking do servidor\`
</conquistas:${comandos["conquistas"]}> — \`Veja suas conquistas\`
</explorar mondstadt iniciar:${comandos["explorar"]}> — \`Explorar Mondstadt\`
</explorar liyue iniciar:${comandos["explorar"]}> — \`Explorar Liyue\`
</explorar inazuma iniciar:${comandos["explorar"]}> — \`Explorar Inazuma\`
</explorar sumeru iniciar:${comandos["explorar"]}> — \`Explorar Sumeru\`
</explorar status:${comandos["explorar"]}> — \`Ver status da exploração\`
</guilda convidar:${comandos["guilda"]}> — \`Convide um usuário para a guilda\`
</primogemas ver:${comandos["primogemas"]}> — \`Veja seu saldo\`
</primogemas daily:${comandos["primogemas"]}> — \`Receba a daily\`
</primogemas pagar:${comandos["primogemas"]}> — \`Envie primogemas a outro\``
      )
      .setFooter({ text: '— Furina', iconURL: client.user.displayAvatarURL() })
      .setThumbnail(client.user.displayAvatarURL());

    const embedRoleplay = new EmbedBuilder()
      .setColor(COR_FURINA)
      .setTitle('🎭 Diversão')
      .setDescription(
`**Ah, mon cher...! Que comece o espetáculo do caos e da comédia!**

</cancelar:${comandos["cancelar"]}> — \`Julgar com drama!\`
</elemental:${comandos["elemental"]}> — \`Ataque elemental teatral\`
</modo-drama:${comandos["modo-drama"]}> — \`Modo drama ativado!\`
</destino:${comandos["destino"]}> — \`Descubra seu destino\``
      )
      .setFooter({ text: '— Furina', iconURL: client.user.displayAvatarURL() })
      .setThumbnail(client.user.displayAvatarURL());

    const embedAdministracao = new EmbedBuilder()
      .setColor(COR_FURINA)
      .setTitle('📜 Administração')
      .setDescription(
`**A ordem também faz parte do espetáculo, non?**


</configurar:${comandos["configurar"]}> - \`Me configure em seu servidor.\`
</sorteio criar:${comandos["sorteio"]}> — \`Criar sorteio\`
</sorteio encerrar:${comandos["sorteio"]}> — \`Encerrar sorteio\`
</sorteio reroll:${comandos["sorteio"]}> — \`Refazer sorteio\``
      )
      .setFooter({ text: '— Furina', iconURL: client.user.displayAvatarURL() })
      .setThumbnail(client.user.displayAvatarURL());

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(client.CustomCollector.create(async (selectInteraction) => {
        if (selectInteraction.user.id !== interaction.user.id) {
          return selectInteraction.reply({
            content: '❌ Apenas quem usou o comando pode interagir!',
            ephemeral: true
          });
        }

        const escolha = selectInteraction.values[0];
        const embed = {
          gacha: embedGacha,
          informacoes: embedInformacoes,
          aventureiro: embedAventureiro,
          roleplay: embedRoleplay,
          administracao: embedAdministracao
        }[escolha];

        await selectInteraction.update({ embeds: [embed] });
      }, {
        authorId: interaction.user.id,
        timeout: 300_000
      }))
      .setPlaceholder('Selecione uma categoria de comandos')
      .addOptions([
        { label: '🎲 Gacha', value: 'gacha', description: 'Comandos de invocação e personagens' },
        { label: '📚 Informações', value: 'informacoes', description: 'Utilidades e dados pessoais' },
        { label: '⚔️ Aventureiro', value: 'aventureiro', description: 'Combate, ranking e exploração' },
        { label: '🎭 Diversão', value: 'roleplay', description: 'Comandos engraçados e criativos' },
        { label: '📜 Administração', value: 'administracao', description: 'Gerenciamento e sorteios' }
      ]);

    const rowSelect = new ActionRowBuilder().addComponents(selectMenu);

    const rowButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Me Adicione')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.com/oauth2/authorize?client_id=1314904179680219136&permissions=140190805184&integration_type=0&scope=bot+applications.commands'),
      new ButtonBuilder()
        .setLabel('Servidor de Suporte')
        .setStyle(ButtonStyle.Link)
        .setURL('https://discord.gg/MkneaxC8jY')
    );

    await interaction.editReply({
      content: `${interaction.user}`,
      embeds: [embedInicial],
      components: [rowSelect, rowButtons],
      ephemeral: true
    });
  }
};
