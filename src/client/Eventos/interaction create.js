const { ApplicationCommandOptionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const userdb = require('../mongodb/user.js');
const logChannelId = '1385561354160836748';
const rest = new REST({ version: '10' }).setToken(process.env.token);

async function sendLogDirectApi(channelId, embed) {
  try {
    await rest.post(Routes.channelMessages(channelId), {
      body: { embeds: [embed.toJSON()] },
    });
  } catch (error) {
    console.error('[LOG] Erro ao enviar log via API:', error);
  }
}

module.exports = {
  evento: 'interactionCreate',
  run: async (client, interaction) => {
    try {
      if (interaction.isChatInputCommand()) {
        let serverdb;
        if (interaction.guild) {
          serverdb = await client.serverdb.findOne({ serverId: interaction.guild.id });
          if (!serverdb) {
            serverdb = new client.serverdb({ serverId: interaction.guild.id });
            await serverdb.save();
          }
          serverdb.usoDeComandos += 1;
          await serverdb.save();
        }

        let user = await userdb.findOne({ id: interaction.user.id });
        if (!user) {
          user = new userdb({ id: interaction.user.id });
          await user.save();
        }

        if (user.blacklist && user.blacklist.tempo) {
          const { ilimitado, tempo } = user.blacklist.tempo;
          const agora = Date.now();
          const aindaPunido = ilimitado === true || tempo > agora;

          if (!aindaPunido) {
            user.blacklist = undefined;
            await user.save();
          } else {
            const tempoStr = ilimitado
              ? '⏳ **Punição permanente**'
              : `⏳ **Tempo restante:** <t:${Math.floor(tempo / 1000)}:R>`;

            const punidor = user.blacklist.equipe;
            const punidorStr = punidor?.id
              ? `[${punidor.username}](https://discord.com/users/${punidor.id})`
              : 'Desconhecido';

            const blacklistEmbed = new EmbedBuilder()
              .setTitle('🚫 Alerta de Blacklist')
              .setDescription(
                `**Motivo:** ${user.blacklist.motivo || 'Motivo não informado.'}\n` +
                `**Punido por:** ${punidorStr}\n` +
                `${tempoStr}\n\n` +
                `> _“Às vezes, a tempestade é necessária para purificar a alma e encontrar a verdadeira luz.”_`
              )
              .setColor('#FF4C4C');

            const suporteButton = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel('Servidor de Suporte')
                .setURL('https://discord.gg/MkneaxC8jY')
                .setStyle(ButtonStyle.Link)
            );

            if (!interaction.replied && !interaction.deferred) {
              await interaction.reply({ embeds: [blacklistEmbed], components: [suporteButton], ephemeral: true }).catch(() => {});
            } else {
              await interaction.followUp({ embeds: [blacklistEmbed], components: [suporteButton], ephemeral: true }).catch(() => {});
            }
            return;
          }
        }

        // **LÓGICA MISSÃO COMANDOS**
        if (user.guilda) {
          const guilda = await client.guilda.findOne({ tag: user.guilda });
          if (guilda && guilda.missoes && guilda.missoes.length > 0) {
            const missaoComandos = guilda.missoes.find(m => m.tipo === "comandos" && !m.concluida && new Date(m.expira) > new Date());
            if (missaoComandos) {
              missaoComandos.progresso = (missaoComandos.progresso || 0) + 1;
              if (missaoComandos.progresso >= missaoComandos.objetivo) {
                missaoComandos.concluida = true;
                guilda.mora += missaoComandos.recompensa.mora || 0;
                guilda.primogemas += missaoComandos.recompensa.primogemas || 0;
                guilda.xp = (guilda.xp || 0) + (missaoComandos.recompensa.xp || 0);
              }
              await guilda.save();
            }
          }
        }

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        await interaction.deferReply().catch(() => {});
        await client.RankAventureiro.addXp(interaction.user.id, 10);

        const options = interaction.options.data;
        let fullCommand = `/${interaction.commandName}`;
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
          .setTitle('🎭 Comando Invocado')
          .setColor('#3B82F6')
          .addFields(
            { name: 'Usuário', value: `${interaction.user.tag} (\`${interaction.user.id}\`)` },
            { name: 'Comando', value: fullCommand },
            { name: 'Canal', value: interaction.channel?.name || 'Desconhecido' },
            { name: 'Horário', value: `<t:${Math.floor(Date.now() / 1000)}:F>` },
            {
              name: 'Servidor',
              value: interaction.guild ? `${interaction.guild.name} (\`${interaction.guild.id}\`)` : 'DM'
            }
          );

        await sendLogDirectApi(logChannelId, logEmbed);
        await command.run(client, interaction);

        if (user?.aviso?.ativado && user.aviso.texto) {
          try {
            if (!interaction.replied && !interaction.deferred) {
              await interaction.deferReply({ ephemeral: true }).catch(() => {});
            }

            const avisoEmbed = new EmbedBuilder()
              .setTitle('⚠️ Você recebeu um aviso da equipe')
              .setDescription(`> _${user.aviso.texto}_`)
              .setColor('#6BCFFF')
              .setFooter({ text: 'Fique atento e siga os bons caminhos para brilhar cada vez mais!' });

            const suporteButton = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel('Servidor de Suporte')
                .setURL('https://discord.gg/MkneaxC8jY')
                .setStyle(ButtonStyle.Link)
            );

            await interaction.followUp({ embeds: [avisoEmbed], components: [suporteButton], ephemeral: true }).catch(() => {});

            user.aviso.ativado = false;
            await user.save();
          } catch {}
        }
      }

      else if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (command && typeof command.autocomplete === 'function') {
          try {
            await command.autocomplete(interaction);
          } catch {}
        }
      }

      else if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('modal_sorteio_')) {
          return client.GerenciadorSorteio.tratarModal(interaction);
        }
      }

      else if (interaction.isButton() || interaction.isStringSelectMenu()) {
        let user = await userdb.findOne({ id: interaction.user.id });
        if (!user) {
          user = new userdb({ id: interaction.user.id });
          await user.save();
        }

        if (user.blacklist && user.blacklist.tempo) {
          const { ilimitado, tempo } = user.blacklist.tempo;
          const agora = Date.now();
          const aindaPunido = ilimitado === true || tempo > agora;

          if (aindaPunido) {
            const embed = new EmbedBuilder()
              .setTitle('🚫 Você está na blacklist')
              .setDescription('Você não pode usar interações enquanto estiver punido.')
              .setColor('#FF4C4C');

            const suporteButton = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel('Servidor de Suporte')
                .setURL('https://discord.gg/MkneaxC8jY')
                .setStyle(ButtonStyle.Link)
            );

            await interaction.reply({ embeds: [embed], components: [suporteButton], ephemeral: true }).catch(() => {});
            return;
          } else {
            user.blacklist = undefined;
            await user.save();
          }
        }

        if (interaction.isButton()) {
          await client.GerenciadorSorteio.tratarBotao(interaction);
        }

        if (user?.aviso?.ativado && user.aviso.texto) {
          try {
            const avisoEmbed = new EmbedBuilder()
              .setTitle('⚠️ Você recebeu um aviso da equipe')
              .setDescription(`> _${user.aviso.texto}_`)
              .setColor('#6BCFFF')
              .setFooter({ text: 'Fique atento e siga os bons caminhos para brilhar cada vez mais!' });

            const suporteButton = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel('Servidor de Suporte')
                .setURL('https://discord.gg/MkneaxC8jY')
                .setStyle(ButtonStyle.Link)
            );

            await interaction.followUp({ embeds: [avisoEmbed], components: [suporteButton], ephemeral: true }).catch(() => {});

            user.aviso.ativado = false;
            await user.save();
          } catch {}
        }
      }
    } catch (err) {
      console.error('[ERRO NA INTERAÇÃO]', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'Erro inesperado ao executar o comando.',
          ephemeral: true
        }).catch(() => {});
      }
    }
  }
};
