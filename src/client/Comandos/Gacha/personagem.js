const { EmbedBuilder } = require('discord.js');
const Usuarios = require('../../mongodb/user');

module.exports = {
  name: 'personagem',
  description: 'Veja informações de um personagem seu',
  options: [
    {
      name: 'nome',
      description: 'Nome do personagem',
      type: 3,
      required: true,
      autocomplete: true
    }
  ],

  autocomplete: async (interaction) => {
    const userId = interaction.user.id;
    const focusedValue = interaction.options.getFocused().toLowerCase();

    const userData = await Usuarios.findOne({ id: userId });
    if (!userData || !userData.personagens.length) return interaction.respond([]);

    const filtered = userData.personagens.filter(p =>
      p.nome.toLowerCase().includes(focusedValue)
    ).slice(0, 25);

    const choices = filtered.map(p => ({
      name: p.nome,
      value: p.nome
    }));

    await interaction.respond(choices);
  },

  run: async (client, interaction) => {
    const userId = interaction.user.id;
    const nomePersonagem = interaction.options.getString('nome');

    const userData = await Usuarios.findOne({ id: userId });

    if (!userData || !userData.personagens.length) {
      return interaction.editReply({
        content: 'Oh non non non~ Você ainda não possui personagens... Que cena mais... trágica!',
        ephemeral: true
      });
    }

    const personagem = userData.personagens.find(p => p.nome.toLowerCase() === nomePersonagem.toLowerCase());
    if (!personagem) {
      return interaction.editReply({
        content: `Hmm? "${nomePersonagem}"? Jamais ouvi tal nome em Fontaine! Tente novamente com um personagem que você possui.`,
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`✨ Personagem: ${personagem.nome}`)
      .setColor('#6AB7FF') 
      .addFields(
        { name: '🔹 Level', value: personagem.level.toString(), inline: false },
        { name: '🔸 Ascensão', value: personagem.ascensao.toString(), inline: false },
        { name: '⭐ Constelação', value: personagem.c.toString(), inline: false },
        { name: '🌊 Elemento', value: personagem.elemento, inline: false },
        { name: '📈 XP', value: personagem.xp.toString(), inline: false },
        { name: '\u200B', value: '\u200B' },
        {
          name: '🛡️ Atributos',
          value:
            `❤️ HP: ${personagem.atributos.hp}\n` +
            `⚔️ ATK: ${personagem.atributos.atk}\n` +
            `🛡️ DEF: ${personagem.atributos.def}\n` +
            `🔋 Recarga: ${personagem.atributos.recargaEnergia}%\n` +
            `🎯 Taxa Crítica: ${personagem.atributos.taxaCritica}%\n` +
            `💥 Dano Crítico: ${personagem.atributos.danoCritico}%\n`
        },
        {
          name: '🎭 Talentos',
          value:
            `• Ataque Normal: Nível ${personagem.talentos.ataqueNormal}\n` +
            `• Ataque Carga: Nível ${personagem.talentos.ataqueCarga}\n` +
            `• Habilidade Elemental: Nível ${personagem.talentos.habilidadeElemental}\n` +
            `• Supremo: Nível ${personagem.talentos.supremo}`
        }
      )
      .setFooter({ text: 'A performance foi brilhante, não foi?', iconURL: client.user.displayAvatarURL() });

    await interaction.editReply({
      content: `Ah~ Que espetáculo! Vamos analisar a estrela chamada **${personagem.nome}**! 🌟`,
      embeds: [embed],
      ephemeral: true
    });
  }
};
