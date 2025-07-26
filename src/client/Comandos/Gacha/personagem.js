const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags
} = require('discord.js');
const Usuarios = require('../../mongodb/user');

module.exports = {
  name: 'personagem',
  description: 'Veja e gerencie seus personagens!',
  options: [
    {
      name: 'ver',
      description: 'Veja informações completas de um personagem',
      type: 1,
      options: [
        {
          name: 'nome',
          description: 'Nome do personagem',
          type: 3,
          required: true,
          autocomplete: true
        }
      ]
    },
    {
      name: 'equipe',
      description: 'Monte sua equipe com até 4 personagens',
      type: 1,
      options: [
        {
          name: 'personagem1',
          description: 'Personagem principal da equipe',
          type: 3,
          required: true,
          autocomplete: true
        },
        {
          name: 'personagem2',
          description: 'Segundo personagem',
          type: 3,
          required: false,
          autocomplete: true
        },
        {
          name: 'personagem3',
          description: 'Terceiro personagem',
          type: 3,
          required: false,
          autocomplete: true
        },
        {
          name: 'personagem4',
          description: 'Quarto personagem',
          type: 3,
          required: false,
          autocomplete: true
        }
      ]
    }
  ],

  autocomplete: async (interaction) => {
    const userId = interaction.user.id;
    const focused = interaction.options.getFocused().toLowerCase();
    const userData = await Usuarios.findOne({ id: userId });
    if (!userData || !userData.personagens.length) return interaction.respond([]);
    const filtrados = userData.personagens
      .filter(p => p.nome.toLowerCase().includes(focused))
      .slice(0, 25)
      .map(p => ({ name: p.nome, value: p.nome }));
    return interaction.respond(filtrados);
  },

  run: async (client, interaction) => {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    const userData = await Usuarios.findOne({ id: userId });

    if (!userData || !userData.personagens.length) {
      return interaction.editReply({ content: 'Você ainda não tem personagens!', ephemeral: true });
    }

    // ========== /personagem ver ==========
    if (sub === 'ver') {
      const nome = interaction.options.getString('nome');
      const personagemIndex = userData.personagens.findIndex(p => p.nome.toLowerCase() === nome.toLowerCase());
      if (personagemIndex < 0) {
        return interaction.editReply({ content: `Você não possui "${nome}"!`, ephemeral: true });
      }
      let personagem = userData.personagens[personagemIndex];

      const limites = { 0: 20, 1: 40, 2: 50, 3: 80, 4: 90, 5: 90, 6: 90 };
      const limiteLevel = limites[personagem.ascensao] || 90;

      const calculaXpTotal = (level, xp) => {
        if (level <= 20) return level * 100 + xp;
        if (level <= 40) return 2000 + (level - 20) * 200 + xp;
        if (level <= 50) return 6000 + (level - 40) * 600 + xp;
        if (level <= 80) return 12000 + (level - 50) * (8000 / 30) + xp;
        return 20000 + (level - 80) * 1000 + xp;
      };

      let xpTotal = calculaXpTotal(personagem.level, personagem.xp);
      let novoLevel = personagem.level < limiteLevel ? limiteLevel : personagem.level;
      let xpTotalNovo = calculaXpTotal(novoLevel, 0);
      const xpNecessario = xpTotalNovo - xpTotal;
      const materiaisNecessarios = Math.ceil(xpNecessario / 10);

      const materiais = userData.itens.find(i => i.nome === 'Material de Elevação');
      const qtdMateriais = materiais?.quantidade || 0;

      const criarEmbed = () => new EmbedBuilder()
        .setTitle(`✨ Personagem: ${personagem.nome}`)
        .setColor('#6AB7FF')
        .addFields(
          { name: '🔹 Level', value: personagem.level.toString(), inline: true },
          { name: '🔸 Ascensão', value: personagem.ascensao.toString(), inline: true },
          { name: '⭐ Constelação', value: Math.min(personagem.c, 6).toString(), inline: true },
          { name: '🌊 Elemento', value: personagem.elemento, inline: true },
          { name: '📈 XP', value: personagem.xp.toString(), inline: true },
          {
            name: '🛡️ Atributos',
            value:
              `❤️ HP: ${personagem.atributos.hp}\n` +
              `⚔️ ATK: ${personagem.atributos.atk}\n` +
              `🛡️ DEF: ${personagem.atributos.def}\n` +
              `🔋 Recarga: ${personagem.atributos.recargaEnergia}%\n` +
              `🎯 Taxa Crítica: ${personagem.atributos.taxaCritica}%\n` +
              `💥 Dano Crítico: ${personagem.atributos.danoCritico}%`
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

      const criarRow = () => {
        const row = new ActionRowBuilder();
        if (personagem.level < limiteLevel) {
          row.addComponents(new ButtonBuilder().setCustomId('upar').setLabel('Upar de Level').setStyle(ButtonStyle.Primary));
        } else if (personagem.level >= limiteLevel && personagem.level < 90) {
          row.addComponents(new ButtonBuilder().setCustomId('ascender').setLabel('Ascender').setStyle(ButtonStyle.Success));
        }
        return row.components.length ? [row] : [];
      };

      await interaction.editReply({
        content: `Analisando **${personagem.nome}**! 🌟`,
        embeds: [criarEmbed()],
        components: criarRow()
      });

      const message = await interaction.fetchReply();

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15_000,
        filter: i => i.user.id === userId && i.message.id === message.id
      });

      collector.on('collect', async btn => {
        if (btn.user.id !== userId) {
          return btn.reply({ content: "Esses botões não são para você!", flags: MessageFlags.Ephemeral });
        }

        if (btn.customId === 'upar') {
          if (!materiais || materiais.quantidade < materiaisNecessarios) {
            return btn.reply({
              content: `Você tem apenas ${qtdMateriais} Materiais, mas precisa de ${materiaisNecessarios}.`,
              ephemeral: true
            });
          }
          const nivelAntes = personagem.level;
          materiais.quantidade -= materiaisNecessarios;
          personagem.level = novoLevel;
          personagem.xp = 0;
          const niveisSubidos = novoLevel - nivelAntes;
          personagem.atributos.hp += niveisSubidos * 10;
          personagem.atributos.atk += niveisSubidos * 5;
          personagem.atributos.def += niveisSubidos * 3;
          if (materiais.quantidade <= 0) userData.itens = userData.itens.filter(i => i.nome !== 'Material de Elevação');
          await userData.save();
          return btn.update({ content: `🎉 ${personagem.nome} subiu para o nível ${novoLevel}!`, embeds: [criarEmbed()], components: criarRow() });
        }

        if (btn.customId === 'ascender') {
          const ar = userData.level.ar;
          const requisitos = [16, 30, 50, 55];
          if (requisitos[personagem.ascensao] && ar < requisitos[personagem.ascensao]) {
            return btn.reply({ content: `Você precisa ser AR ${requisitos[personagem.ascensao]} para ascender!`, ephemeral: true });
          }
          const custo = personagem.level * 2 + 20;
          if (userData.primogemas < custo) {
            return btn.reply({ content: `Faltam primogemas! Precisa de ${custo}, mas você tem ${userData.primogemas}.`, ephemeral: true });
          }
          userData.primogemas -= custo;
          personagem.ascensao++;
          await userData.save();
          return btn.update({ content: `✨ ${personagem.nome} ascendeu para ${personagem.ascensao}!`, embeds: [criarEmbed()], components: criarRow() });
        }
      });

      collector.on('end', collected => {
        console.log(`Coletadas ${collected.size} interações.`);
      });
    }

    // ========== /personagem equipe ==========
    if (sub === 'equipe') {
      const nomes = [];
      for (let i = 1; i <= 4; i++) {
        const nome = interaction.options.getString(`personagem${i}`);
        if (nome) nomes.push(nome);
      }

      if (nomes.length < 1) {
        return interaction.editReply({ content: 'Você precisa selecionar pelo menos 1 personagem.', ephemeral: true });
      }

      const unicos = [...new Set(nomes.map(n => n.toLowerCase()))];
      if (unicos.length < nomes.length) {
        return interaction.editReply({ content: 'Os personagens da equipe devem ser únicos!', ephemeral: true });
      }

      // Verifica se todos os personagens existem no usuário
      for (const nome of nomes) {
        if (!userData.personagens.some(p => p.nome.toLowerCase() === nome.toLowerCase())) {
          return interaction.editReply({ content: `Você não possui o personagem "${nome}"!`, ephemeral: true });
        }
      }

      // Salva só os nomes (com capitalização original do input)
      userData.equipe = nomes;
      await userData.save();

      const equipeTexto = nomes.map((p, i) => `**${i + 1}.** ${p}`).join('\n');
      const embed = new EmbedBuilder()
        .setTitle('🎭 Nova Equipe Montada!')
        .setColor('#00bcd4')
        .setDescription(`Ahhh... que elenco interessante!`)
        .addFields({ name: '🌟 Equipe Atual', value: equipeTexto });

      return interaction.editReply({ embeds: [embed] });
    }
  }
};
