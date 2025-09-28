const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

const Abismo = require("./Abismo");

class Pvp {
  constructor(client) {
    this.client = client;
    this.abismo = new Abismo(client);
  }

  async iniciarDuelo(interaction, oponenteId) {
    const Usuarios = this.client.userdb;
    const desafianteId = interaction.user.id;
    const desafiante = await Usuarios.findOne({ id: desafianteId });
    const oponente = await Usuarios.findOne({ id: oponenteId });

    if (!desafiante || !oponente || !desafiante.equipe.length || !oponente.equipe.length) {
      const erroEmbed = new EmbedBuilder()
        .setTitle("⛔ Drama não autorizado!")
        .setDescription("Tanto o desafiador quanto o desafiado precisam ter equipes completas para que este espetáculo comece!")
        .setColor("Red");
      return interaction.editReply({ embeds: [erroEmbed] });
    }

    const customAceitar = `aceitar_duelo_${desafianteId}_${oponenteId}`;
    const customRecusar = `recusar_duelo_${desafianteId}_${oponenteId}`;

    const confirmEmbed = new EmbedBuilder()
      .setTitle("🎭 O palco se arma!")
      .setDescription(`Oh, <@${oponenteId}>! Você foi desafiado por **${interaction.user.username}**!\nAceitará o chamado deste confronto? Ou fugirá dos holofotes?`)
      .setColor("Gold");

    const aceitar = new ButtonBuilder().setCustomId(customAceitar).setLabel("Aceitar").setStyle(ButtonStyle.Success);
    const recusar = new ButtonBuilder().setCustomId(customRecusar).setLabel("Recusar").setStyle(ButtonStyle.Danger);
    const rowConfirm = new ActionRowBuilder().addComponents(aceitar, recusar);

    await interaction.editReply({ embeds: [confirmEmbed], components: [rowConfirm] });

    const collector = interaction.channel.createMessageComponentCollector({
      time: 30000,
      filter: i =>
        i.user.id === oponenteId &&
        (i.customId === customAceitar || i.customId === customRecusar),
    });

    collector.on("collect", async i => {
      if (i.customId === customAceitar) {
        await i.update({ content: "heh", embeds: [], components: [] });
        collector.stop();
        this.iniciarBatalha(interaction, desafiante, oponente);
      } else if (i.customId === customRecusar) {
        const recusa = new EmbedBuilder()
          .setTitle("🎭 Cortinas fechadas!")
          .setDescription("O duelo foi recusado. Que anticlímax, não achas?")
          .setColor("DarkGrey");
        await i.update({ embeds: [recusa], components: [] });
        collector.stop();
      }
    });

    collector.on("end", async (_, reason) => {
      if (reason === "time") {
        const embed = new EmbedBuilder()
          .setTitle("⌛ O tempo esgotou!")
          .setDescription("O silêncio respondeu por você... O duelo foi cancelado.")
          .setColor("DarkRed");
        await interaction.editReply({ embeds: [embed], components: [] });
      }
    });
  }

  async iniciarBatalha(interaction, user1, user2) {
    const Usuarios = this.client.userdb;
    const jogadores = [
      { id: user1.id, user: user1, nome: `<@${user1.id}>`, equipe: [...user1.equipe] },
      { id: user2.id, user: user2, nome: `<@${user2.id}>`, equipe: [...user2.equipe] },
    ];

    const emojiElemento = {
      Pyro: "🔥", Cryo: "❄️", Electro: "⚡", Hydro: "💧", Dendro: "🍃", Geo: "🪨", Anemo: "💨"
    };

    let vez = 0;
    let batalhaEncerrada = false;

    const getPersonagem = (j, nome) =>
      j.user.personagens.find(p => p.nome.toLowerCase() === nome.toLowerCase());

    const atualizarEquipeHP = jogador =>
      jogador.equipe
        .map(n => {
          const p = getPersonagem(jogador, n);
          return p && p.atributos.hp > 0 ? `${n} (${p.atributos.hp} HP)` : null;
        })
        .filter(Boolean)
        .join(" | ") || "*Todos caíram... O show acabou.*";

    async function resetarHP() {
      for (const j of jogadores) {
        for (const p of j.user.personagens) {
          p.atributos.hp = p.atributos.hpMax || 1000;
        }
        await Usuarios.updateOne({ id: j.id }, { personagens: j.user.personagens });
      }
    }

    const aplicarAtaque = async (atual, oponente, personagemNome, acao) => {
      const atacante = getPersonagem(atual, personagemNome);
      const defensor = getPersonagem(oponente, oponente.equipe[0]);
      if (!atacante || !defensor) return;

      const resultado = this.abismo.calculaDano(
        atacante, acao, defensor.elemento,
        atual.user.personagens,
        { ultUsada: acao === "supremo" },
        defensor.nivel
      );

      defensor.atributos.hp -= resultado.dano;
      if (defensor.atributos.hp < 0) defensor.atributos.hp = 0;

      let linhas = [];
      linhas.push(`${emojiElemento[atacante.elemento] || ""} **${atual.nome}** escolheu **${personagemNome}** e lançou **${acao}**.`);
      linhas.push(`🎯 Dano: **${resultado.dano}** em **${defensor.nome}**, que agora tem **${defensor.atributos.hp} HP**.`);
      if (resultado.critico) linhas.push("💥 Um golpe crítico encheu os holofotes!");
      if (resultado.multiplicadorReacao > 1) linhas.push(`✨ Reação elemental ocorreu! (x${resultado.multiplicadorReacao.toFixed(2)})`);

      const ataqueEmbed = new EmbedBuilder()
        .setTitle("🎼 Ato de Batalha Executado")
        .setDescription(linhas.join("\n"))
        .setColor("Gold");
      await interaction.followUp({ embeds: [ataqueEmbed] });
    };

    const executarTurno = async () => {
      const atual = jogadores[vez];
      const outro = jogadores[vez === 0 ? 1 : 0];

      atual.equipe = atual.equipe.filter(n => {
        const p = getPersonagem(atual, n);
        return p && p.atributos.hp > 0;
      });
      outro.equipe = outro.equipe.filter(n => {
        const p = getPersonagem(outro, n);
        return p && p.atributos.hp > 0;
      });

      if (outro.equipe.length === 0) {
        batalhaEncerrada = true;
        await Usuarios.updateOne({ id: atual.id }, { $inc: { vitoriasPvP: 1 } });
        await Usuarios.updateOne({ id: outro.id }, { $inc: { derrotasPvP: 1 } });

        const vitoriaEmbed = new EmbedBuilder()
          .setTitle("🎉 Vitória Gloriosa!")
          .setDescription(`**Bravo!** ${atual.nome} dominou este palco com sua performance brilhante!`)
          .setColor("Green");

        const derrotaEmbed = new EmbedBuilder()
          .setTitle("🎭 Derrota Dramática.")
          .setDescription(`${outro.nome} caiu... Mas até a tragédia pode ter um final épico.`)
          .setColor("Red");

        await interaction.followUp({ embeds: [vitoriaEmbed] });
        await interaction.followUp({ embeds: [derrotaEmbed] });
        await resetarHP();
        return;
      }

      const menuPersonagem = new StringSelectMenuBuilder()
        .setCustomId("personagem").setPlaceholder("Escolha o personagem")
        .addOptions(atual.equipe.map(n => ({ label: n, value: n })));
      const menuAcao = new StringSelectMenuBuilder()
        .setCustomId("acao").setPlaceholder("Escolha a ação")
        .addOptions([
          { label: "Ataque Normal", value: "ataque_normal" },
          { label: "Ataque Carregado", value: "ataque_carga" },
          { label: "Habilidade Elemental", value: "habilidade_elemental" },
          { label: "Supremo", value: "supremo" },
        ]);
      const botao = new ButtonBuilder().setCustomId("confirmar").setLabel("🤝 Confirmar Ato").setStyle(ButtonStyle.Success);

      const statusEmbed = new EmbedBuilder()
        .setTitle("🎻 Status Atual do Espetáculo")
        .addFields(
          { name: `🟢 ${jogadores[0].nome}`, value: atualizarEquipeHP(jogadores[0]) },
          { name: `🔴 ${jogadores[1].nome}`, value: atualizarEquipeHP(jogadores[1]) }
        )
        .setColor("Blue");

      await interaction.followUp({
        content: `🎬 É a sua vez, ${atual.nome}! Tem apenas 20 segundos para brilhar.`,
        embeds: [statusEmbed],
        components: [
          new ActionRowBuilder().addComponents(menuPersonagem),
          new ActionRowBuilder().addComponents(menuAcao),
          new ActionRowBuilder().addComponents(botao),
        ],
      });

      let personagem = atual.equipe[0];
      let acao = "ataque_normal";
      let confirmado = false;

      const collector = interaction.channel.createMessageComponentCollector({
        time: 20000, filter: i => i.user.id === atual.id
      });

      collector.on("collect", async i => {
        if (i.customId === "personagem") personagem = i.values[0];
        if (i.customId === "acao") acao = i.values[0];
        if (i.customId === "confirmar") {
          confirmado = true;
          collector.stop("confirmado");
        }
        await i.deferUpdate();
      });

      collector.on("end", async () => {
        if (!confirmado) {
          const embed = new EmbedBuilder()
            .setTitle("😴 Ato Perdido!")
            .setDescription(`Oh não! ${atual.nome} perdeu sua deixa no palco e não agiu a tempo...`)
            .setColor("DarkRed");
          await interaction.followUp({ embeds: [embed] });
        } else {
          await aplicarAtaque(atual, outro, personagem, acao);
        }
        vez = vez === 0 ? 1 : 0;
        if (!batalhaEncerrada) await executarTurno();
      });
    };

    const inicioEmbed = new EmbedBuilder()
      .setTitle("🎭 Duelo Iniciado!")
      .setDescription(`Sob as luzes do grande palco, ${jogadores[0].nome} enfrenta ${jogadores[1].nome}!`)
      .setColor("Purple");

    await interaction.followUp({ embeds: [inicioEmbed] });
    executarTurno();
  }
}

module.exports = Pvp;
