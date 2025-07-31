const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
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
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('#3498db')
            .setDescription('🎭 Oh là là~ Você ainda não tem nenhum personagem em seu elenco!')
        ],
        ephemeral: true
      });
    }

    if (sub === 'ver') {
      const nome = interaction.options.getString('nome');
      const personagem = userData.personagens.find(p => p.nome.toLowerCase() === nome.toLowerCase());

      if (!personagem) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#e74c3c')
              .setDescription(`🎭 Mon dieu! Você não possui **${nome}** em seu elenco.`)
          ],
          ephemeral: true
        });
      }

      await interaction.deferReply();

      const limites = { 0: 20, 1: 40, 2: 50, 3: 80, 4: 90, 5: 90, 6: 90 };
      const limiteLevel = limites[personagem.ascensao] || 90;

      const calculaXpTotal = (level, xp) => {
        if (level <= 20) return level * 100 + xp;
        if (level <= 40) return 2000 + (level - 20) * 200 + xp;
        if (level <= 50) return 6000 + (level - 40) * 600 + xp;
        if (level <= 80) return 12000 + (level - 50) * (8000 / 30) + xp;
        return 20000 + (level - 80) * 1000 + xp;
      };

      const xpTotal = calculaXpTotal(personagem.level, personagem.xp);
      const novoLevel = personagem.level < limiteLevel ? limiteLevel : personagem.level;
      const xpTotalNovo = calculaXpTotal(novoLevel, 0);
      const xpNecessario = xpTotalNovo - xpTotal;
      const materiaisNecessarios = Math.ceil(xpNecessario / 10);
      const materiais = userData.itens.find(i => i.nome === 'Material de Elevação');
      const qtdMateriais = materiais?.quantidade || 0;

      const criarEmbed = () =>
        new EmbedBuilder()
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
          row.addComponents(new ButtonBuilder()
            .setCustomId(uparId)
            .setLabel('Upar de Level')
            .setStyle(ButtonStyle.Primary));
        } else if (personagem.level >= limiteLevel && personagem.level < 90) {
          row.addComponents(new ButtonBuilder()
            .setCustomId(ascenderId)
            .setLabel('Ascender')
            .setStyle(ButtonStyle.Success));
        }
        return row.components.length ? [row] : [];
      };

      const uparId = client.CustomCollector.create(async btn => {
        if (!materiais || materiais.quantidade < materiaisNecessarios) {
          return btn.reply({
            content: `Você tem apenas ${qtdMateriais} materiais, mas precisa de ${materiaisNecessarios}.`,
            ephemeral: true
          });
        }
        const antes = personagem.level;
        materiais.quantidade -= materiaisNecessarios;
        personagem.level = novoLevel;
        personagem.xp = 0;
        const ganhos = novoLevel - antes;
        personagem.atributos.hp += ganhos * 10;
        personagem.atributos.atk += ganhos * 5;
        personagem.atributos.def += ganhos * 3;
        if (materiais.quantidade <= 0)
          userData.itens = userData.itens.filter(i => i.nome !== 'Material de Elevação');
        await userData.save();
        return btn.update({
          content: `🎉 Bravo! ${personagem.nome} subiu para o nível ${novoLevel}!\n\nMais forte, mais belo, mais... dramático!`,
          embeds: [criarEmbed()],
          components: criarRow()
        });
      }, { authorId: userId, timeout: 60_000 });

      const ascenderId = client.CustomCollector.create(async btn => {
        const ar = userData.level.ar;
        const requisitos = [16, 30, 50, 55];
        if (requisitos[personagem.ascensao] && ar < requisitos[personagem.ascensao]) {
          return btn.reply({
            content: `🎭 Você precisa ser AR ${requisitos[personagem.ascensao]} para ascender este artista.`,
            ephemeral: true
          });
        }
        const custo = personagem.level * 2 + 20;
        if (userData.primogemas < custo) {
          return btn.reply({
            content: `Você precisa de ${custo} primogemas para a ascensão, mas só tem ${userData.primogemas}.`,
            ephemeral: true
          });
        }
        userData.primogemas -= custo;
        personagem.ascensao++;
        await userData.save();
        return btn.update({
          content: `✨ Uma nova era começa para ${personagem.nome}! Ascensão concluída.`,
          embeds: [criarEmbed()],
          components: criarRow()
        });
      }, { authorId: userId, timeout: 60_000 });

      return interaction.editReply({
        content: `Analisando **${personagem.nome}**! 🌟`,
        embeds: [criarEmbed()],
        components: criarRow()
      });
    }

    if (sub === 'equipe') {
      const nomes = [];
      for (let i = 1; i <= 4; i++) {
        const nome = interaction.options.getString(`personagem${i}`);
        if (nome) nomes.push(nome);
      }

      if (nomes.length < 1) {
        return interaction.reply({
          content: '🎭 Ao menos um ator deve entrar em cena!',
          ephemeral: true
        });
      }

      const unicos = [...new Set(nomes.map(n => n.toLowerCase()))];
      if (unicos.length < nomes.length) {
        return interaction.reply({
          content: '🎭 Os artistas não podem se repetir na mesma peça!',
          ephemeral: true
        });
      }

      for (const nome of nomes) {
        if (!userData.personagens.some(p => p.nome.toLowerCase() === nome.toLowerCase())) {
          return interaction.reply({
            content: `🎭 Você não possui o personagem "${nome}"!`,
            ephemeral: true
          });
        }
      }

      await interaction.deferReply();
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
