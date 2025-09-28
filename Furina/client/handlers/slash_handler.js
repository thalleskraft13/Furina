const fs = require('fs');
const chalk = require('colors');

const { PermissionsBitField } = require('discord.js');
const { Routes } = require('discord-api-types/v10');
const { REST } = require('@discordjs/rest');

const TOKEN = process.env.token;
const CLIENT_ID = "1385407052901515265";

const rest = new REST({ version: '10' }).setToken(TOKEN);

module.exports = (client) => {
  const slashCommands = [];

  fs.readdirSync('./Furina/client/Comandos/').forEach(dir => {
    const files = fs.readdirSync(`./Furina/client/Comandos/${dir}/`).filter(file => file.endsWith('.js'));

    for (const file of files) {
      const slashCommand = require(`../Comandos/${dir}/${file}`);

      slashCommands.push({
        name: slashCommand.name,
        description: slashCommand.description,
        type: slashCommand.type,
        options: slashCommand.options ?? null,
        default_permission: slashCommand.default_permission ?? null,
        default_member_permissions: slashCommand.default_member_permissions
          ? PermissionsBitField.resolve(slashCommand.default_member_permissions).toString()
          : null,
        integration_types: slashCommand.integration_types ?? null,
  contexts: slashCommand.contexts ?? null,
      });

      if (slashCommand.name) {
        client.commands.set(slashCommand.name, slashCommand);
      }
    }
  });

  // 🔒 Registrar comandos apenas no cluster 0
  if (client.clusterId === 0) {
    (async () => {
      try {
        

        await rest.put(
          Routes.applicationCommands(CLIENT_ID),
          { body: slashCommands }
        );

        
        
      } catch (error) {
        console.error(chalk.red("[Slash] Erro ao registrar comandos:"), error);
      }
    })();
  } else {

  }
};
