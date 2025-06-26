const { ApplicationCommandOptionType, EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const furina = require('../index.js');

const rest = new REST({ version: '10' }).setToken(process.env.token);
const logChannelId = '1385561354160836748';

async function sendLogDirectApi(channelId, embed) {
  try {
    await rest.post(Routes.channelMessages(channelId), {
      body: { embeds: [embed.toJSON()] },
    });
    return true;
  } catch (error) {
    console.error('[LOG] Erro ao enviar log pela API direta:', error);
    return false;
  }
}

furina.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    try {
      let serverdb = await furina.serverdb.findOne({ serverId: interaction.guild.id });
      if (!serverdb) {
        serverdb = new furina.serverdb({ serverId: interaction.guild.id });
        await serverdb.save();
      }

      serverdb.usoDeComandos += 1;
      await serverdb.save();

      const command = furina.commands.get(interaction.commandName);
      if (!command) return;

      await interaction.deferReply();
      await furina.RankAventureiro.addXp(interaction.user.id, 10);

      const user = interaction.user;
      let fullCommand = `/${interaction.commandName}`;
      const options = interaction.options.data;

      function parseOptions(opts, prefix = '') {
        for (const opt of opts) {
          if (opt.type === ApplicationCommandOptionType.SubcommandGroup) {
            fullCommand += ` ${prefix}${opt.name}`;
            parseOptions(opt.options, `${opt.name} `);
          } else if (opt.type === ApplicationCommandOptionType.Subcommand) {
            fullCommand += ` ${prefix}${opt.name}`;
            parseOptions(opt.options || [], '');
          } else {
            fullCommand += ` ${prefix}${opt.name}: ${opt.value}`;
          }
        }
      }

      parseOptions(options);

      const logEmbed = new EmbedBuilder()
        .setTitle('🎭 Comando Utilizado')
        .setColor('Blue')
        .addFields(
          { name: 'Usuário', value: `${user.tag} (\`${user.id}\`)`, inline: false },
          { name: 'Comando', value: fullCommand, inline: false },
          { name: 'Canal', value: interaction.channel ? `<#${interaction.channel.id}>` : 'Desconhecido', inline: false },
          { name: 'Horário', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false },
        );

      await sendLogDirectApi(logChannelId, logEmbed);
      await command.run(furina, interaction);

    } catch (e) {
      console.error(e);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '<:1000210943:1373427433570832475> | Inacreditável! Um comando tão inexistente quanto uma peça sem protagonista!',
          ephemeral: true,
        });
      }
    }

  } else if (interaction.isAutocomplete()) {
    const command = furina.commands.get(interaction.commandName);
    if (command && typeof command.autocomplete === 'function') {
      try {
        await command.autocomplete(interaction);
      } catch (e) {
        console.error(`Erro no autocomplete de ${interaction.commandName}:`, e);
      }
    }

  } else if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith('modal_sorteio_')) {
      return furina.GerenciadorSorteio.tratarModal(interaction);
    } else if (interaction.customId === 'uid') {
      let nome = interaction.fields.getTextInputValue('1');
      let uid = interaction.fields.getTextInputValue('2');

      const embed = new EmbedBuilder()
        .setTitle('Verificação de Uid')
        .setDescription(`Nome: ${nome}\nUid: ${uid}`)
        .setColor('Orange');

      await interaction.reply({
        content:
          'O grandioso ritual de verificação foi iniciado! Seu UID foi enviado aos olhos atentos do destino. Agora, adicione o portador do UID **662543202** no jogo para que a confirmação possa ocorrer. A avaliação levará cerca de 24 horas, e você será informado se a bênção da verificação foi concedida… ou recusada. Para mais detalhes, dirija-se ao salão de suporte: https://discord.gg/aC5yqnXvmv',
        ephemeral: true,
      });
    }

  } else if (interaction.isButton()) {
    furina.GerenciadorSorteio.tratarBotao(interaction);
  }
});
