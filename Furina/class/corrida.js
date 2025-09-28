const {
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ContainerBuilder,
} = require("discord.js");

class Corrida {
  constructor(client, desafiante, desafiado, personagem1, personagem2, interaction, aposta = 0) {
    this.client = client;
    this.desafiante = desafiante;
    this.desafiado = desafiado;
    this.personagem1 = personagem1;
    this.personagem2 = personagem2;
    this.interaction = interaction;
    this.aposta = aposta;

    this.emojis = {
  personagens: {
    Mona: "<:Mona:1402263893740359721>",
    Furina: "<:Furina:1402263910135894107>",
    Barbara: "<:Barbara:1402264100058431568>",
    Xingqiu: "<:Xingqiu:1402264152067801128>",
    YaeMiko: "<:YaeMiko:1403704294477135912>",
    Keqing: "<:Keqing:1403704371862044722>",
    ShogunRaiden: "<:ShogunRaiden:1403704421619204187>",
    KujouSara: "<:KujouSara:1403704481472053318>",
    Beidou: "<:Beidou:1403704535284973628>",
    Iansan: "<:Iansan:1403704583552762038>",
    Sethos: "<:Sethos:1403704684144754800>",
    Neuvilette: "<:Neuvilette:1403704727992012800>",
    Fischl: "<:Fischl:1403704770597752872>",
    ShikanoinHeizou: "<:ShikanoinHeizou:1403704967407079455>",
    LanYan: "<:LanYan:1403706375934054542>",
    Jean: "<:Jean:1403706418267291748>",
    Faruzan: "<:Faruzan:1403706460864647330>",
    Scaramouche: "<:Scaramouche:1403706501758976030>",
    Layla: "<:Layla:1403706542552907847>",
    Rosaria: "<:Rosaria:1403706577676140554>",
    Qiqi: "<:Qiqi:1403706617362382880>",
    Charlotte: "<:Charlotte:1403706649948196966>",
    Chongyun: "<:Chongyun:1403706692478439546>",
    Mika: "<:Mika:1403706735105146891>",
    Thoma: "<:Thoma:1403707913779937310>",
    Arlecchino: "<:Arlecchino:1403707961662242857>",
    Chevreuse: "<:Chevreuse:1403708005823811704>",
    Diluc: "<:Diluc:1403708051759955978>",
    Bennett: "<:Bennett:1403708095913267200>",
    Xinyan: "<:Xinyan:1403708135281262744>",
    Mavuika: "<:Mavuika:1403708171100487750>",
    Xiangling: "<:Xiangling:1403708210929598546>",
    Noelle: "<:Noelle:1403709094203887656>",
    Xilonen: "<:Xilonen:1403709132296556564>",
    Zhongli: "<:Zhongli:1403709170318049352>",
    Nahida: "<:Nahida:1403709209073418304>",
    Yaoyao: "<:Yaoyao:1403709242128470097>",
  },
};


    this.mapa = [
      ["🟥"].concat(Array(9).fill("⬛️")),
      ["🟥"].concat(Array(9).fill("⬛️")),
    ];

    this.posicoes = [this.mapa[0].length - 1, this.mapa[1].length - 1];

    this.inicio = null;
    this.fim = null;

    this.msg = null;

    this.botao1 = null;
    this.botao2 = null;
  }

  getEmojiPersonagem(nomePersonagem) {
    if (
      this.emojis &&
      this.emojis.personagens &&
      this.emojis.personagens[nomePersonagem]
    ) {
      return this.emojis.personagens[nomePersonagem];
    }
    return ""; // fallback vazio se não achar
  }

  getTempoTotal() {
    return this.fim && this.inicio ? this.fim - this.inicio : null;
  }

  gerarComponentes({ desabilitar = false } = {}) {
    const maxPos = this.mapa[0].length - 1;

    const progresso1 = `${maxPos - this.posicoes[0]} / ${maxPos}`;
    const progresso2 = `${maxPos - this.posicoes[1]} / ${maxPos}`;

    const emoji1 = this.getEmojiPersonagem(this.personagem1);
    const emoji2 = this.getEmojiPersonagem(this.personagem2);

    const linha1 = this.mapa[0]
      .map((b, i) => (i === this.posicoes[0] ? emoji1 : b))
      .join("");
    const linha2 = this.mapa[1]
      .map((b, i) => (i === this.posicoes[1] ? emoji2 : b))
      .join("");

    return [
      new ContainerBuilder()
        .setAccentColor(1173181)
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `# 🎭 Corrida Teatral!\n\nOh~ Que comece o espetáculo da velocidade e da glória!` +
              (this.aposta > 0
                ? `\n\n💰 Aposta: **${this.aposta} primogemas** (taxa de 10% aplicada — 10% vai para Furina!)`
                : "")
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Competidor 1** — (<@${this.desafiante.id}>)\n` +
              `✨ Personagem: \`${this.personagem1}\` ${emoji1}\n` +
              `📈 Progresso: \`${progresso1}\`\n\n${linha1}`
          )
        )
        .addSeparatorComponents(
          new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
        )
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**Competidor 2** — (<@${this.desafiado.id}>)\n` +
              `✨ Personagem: \`${this.personagem2}\` ${emoji2}\n` +
              `📈 Progresso: \`${progresso2}\`\n\n${linha2}`
          )
        )
        .addActionRowComponents(
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setStyle(ButtonStyle.Primary)
              .setLabel("Avançar 1")
              .setCustomId(this.botao1)
              .setDisabled(desabilitar),
            new ButtonBuilder()
              .setStyle(ButtonStyle.Primary)
              .setLabel("Avançar 2")
              .setCustomId(this.botao2)
              .setDisabled(desabilitar)
          )
        ),
    ];
  }

  async iniciar() {
    this.inicio = Date.now();

    this.botao1 = this.client.CustomCollector.create(
      async (interaction) => this.avancar(interaction, 0),
      { authorId: this.desafiante.id, timeout: 10 * 60 * 1000 }
    );
    this.botao2 = this.client.CustomCollector.create(
      async (interaction) => this.avancar(interaction, 1),
      { authorId: this.desafiado.id, timeout: 10 * 60 * 1000 }
    );

    const botaoSim = this.client.CustomCollector.create(
      async (interaction) => this.confirmarParticipacao(interaction, true),
      { authorId: this.desafiado.id, timeout: 60 * 1000 }
    );
    const botaoNao = this.client.CustomCollector.create(
      async (interaction) => this.confirmarParticipacao(interaction, false),
      { authorId: this.desafiado.id, timeout: 60 * 1000 }
    );

    this.confirmacaoSim = botaoSim;
    this.confirmacaoNao = botaoNao;

    await this.interaction.editReply({
      components: [
        new ContainerBuilder()
          .setAccentColor(1173181)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `${this.aposta > 0 ? `💰 **Aposta:** ${this.aposta} primogemas\n\n` : ""}` +
                `🎭 Corrida Teatral!\n\nOh~ Que comece o espetáculo da velocidade e da glória! <@${this.desafiado.id}>, você aceita o desafio?`
            )
          ),
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel("Aceito o desafio!")
            .setCustomId(botaoSim),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel("Recusar desafio")
            .setCustomId(botaoNao)
        ),
      ],
      flags: 32768,
      content: undefined,
      embeds: [],
    });
  }

  async confirmarParticipacao(interaction, aceitou) {
    if (!aceitou) {
      return interaction.update({
        components: [
          new ContainerBuilder()
            .setAccentColor(1173181)
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(`😔 <@${this.desafiado.id}> recusou o desafio. Talvez numa próxima vez!`)
            ),
        ],
        content: undefined,
        embeds: [],
        flags: 32768,
      });
    }

    await interaction.update({
      components: [
        new ContainerBuilder()
          .setAccentColor(1173181)
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`🏁 <@${this.desafiado.id}> aceitou o desafio! Preparem-se para a corrida!`)
          ),
      ],
      content: undefined,
      embeds: [],
      flags: 32768,
    });

    if (this.aposta > 0) {
      const taxa = Math.floor(this.aposta * 0.1);

      const user1Data = await this.client.userdb.findOne({ id: this.desafiante.id });
      const user2Data = await this.client.userdb.findOne({ id: this.desafiado.id });

      if (!user1Data || !user2Data) {
        return this.interaction.followUp({
          content: "Erro: Usuário(s) não encontrado(s). Corrida cancelada.",
          ephemeral: true,
        });
      }

      if (user1Data.primogemas < this.aposta || user2Data.primogemas < this.aposta) {
        return this.interaction.followUp({
          content:
            "Erro: Um dos jogadores não possui primogemas suficientes para a aposta. Corrida cancelada.",
          ephemeral: true,
        });
      }

      user1Data.primogemas -= this.aposta;
      user2Data.primogemas -= this.aposta;

      await user1Data.save();
      await user2Data.save();

      const furinaData = await this.client.userdb.findOne({ id: this.client.user.id });
      if (furinaData) {
        furinaData.primogemas += taxa * 2;
        await furinaData.save();
      }
    }

    const componentes = this.gerarComponentes();
    this.msg = await this.interaction.editReply({ components: componentes, flags: 32768, content: undefined });
  }

  async avancar(interaction, jogadorIndex) {
    if (this.fim) {
      return interaction.reply({
        content: "💧 A corrida já terminou, querida alma da pressa!",
        ephemeral: true,
      });
    }

    this.posicoes[jogadorIndex]--;

    if (this.posicoes[jogadorIndex] < 0) this.posicoes[jogadorIndex] = 0;

    if (this.posicoes[jogadorIndex] === 0) {
      this.fim = Date.now();

      const tempoSegundos = ((this.fim - this.inicio) / 1000).toFixed(2);

      if (this.aposta > 0) {
        const taxa = Math.floor(this.aposta * 0.1);
        const valorGanho = this.aposta * 2 - taxa * 2;

        const userVencedor = await this.client.userdb.findOne({ id: jogadorIndex === 0 ? this.desafiante.id : this.desafiado.id });
        if (userVencedor) {
          userVencedor.primogemas += valorGanho;
          await userVencedor.save();
        }
      }

      await interaction.update({
        components: this.gerarComponentes({ desabilitar: true }),
        content: undefined,
      });

      await interaction.followUp({
  ephemeral: false,
  content: `🏆 <@${jogadorIndex === 0 ? this.desafiante.id : this.desafiado.id}> venceu a corrida! Tempo total: **${tempoSegundos}s**. Que a velocidade esteja contigo!` +
    (this.aposta > 0
      ? `\n\n💰 **Aposta:** ${this.aposta} primogemas por jogador\n📦 **Prêmio recebido:** ${valorGanho} primogemas (taxa de 10% já aplicada)`
      : ""),
  embeds: [],
});


      return;
    }

    try {
      await interaction.update({ components: this.gerarComponentes(), content: undefined });
    } catch (err) {
      console.error("Erro ao atualizar mensagem da corrida:", err);
    }
  }
}

module.exports = Corrida;
