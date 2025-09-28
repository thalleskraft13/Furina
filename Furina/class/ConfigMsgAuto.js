const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  PermissionsBitField,
} = require("discord.js");

class ConfigMsgAuto {
  constructor(client) {
    this.client = client;
  }

  // ======= FUNÇÃO PRINCIPAL PARA CONFIGURAR MENSAGENS DE BOAS-VINDAS / SAÍDA =======
  async abrirPainel(interaction, tipoEntrada, voltarCallback) {
    const serverId = interaction.guild.id;
    let servidor =
      (await this.client.serverdb.findOne({ serverId })) ||
      (await this.client.serverdb.create({ serverId }));

    const nomeParaTipo = {
    "👋 Mensagem de Boas-Vindas": "boas_vindas",
    "🏃 Mensagem de Saída": "saida",
  };

  const tipoParaNome = {
    boas_vindas: "👋 Mensagem de Boas-Vindas",
    saida: "🏃 Mensagem de Saída",
  };

  
  const tipo = nomeParaTipo[tipoEntrada] || tipoEntrada;


  const tipoNome = tipoParaNome[tipo] || tipo;

    
    
    const ativado = servidor?.mensagens?.[tipo]?.ativado ?? false;
  const canalId = servidor?.mensagens?.[tipo]?.canal ?? null;

   // console.log(tipo, tipoNome, ativado)

    const embed = new EmbedBuilder()
      .setTitle(`${tipoNome} • Configuração`)
      .setDescription(
        "Ajuste a performance desta parte do espetáculo!\n\n" +
          "**🔄 Variáveis disponíveis:**\n" +
          "`(user.username)` `(user.globalName)` `(user.id)` `(user.avatar)` `(@user)`\n" +
          "`(guild.name)` `(guild.id)` `(guild.avatar)` `(guild.membrosTotais)`\n\n" +
          `**⚙️ Status Atual:**\n` +
          `> Ativado: **${ativado ? "✅" : "❌"}**\n` +
          `> Canal: ${canalId ? `<#${canalId}>` : "❌ Nenhum canal configurado"}`
      )
      .setColor("#4A90E2");

    const btnRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(
          this.client.CustomCollector.create(
            (i) => this.configurarCanal(i, tipo, interaction, voltarCallback),
            {
              authorId: interaction.user.id,
            }
          )
        )
        .setLabel("Configurar Chat")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("📝"),
      new ButtonBuilder()
        .setCustomId(
          this.client.CustomCollector.create(
            (i) => this.toggleAtivar(i, tipo, interaction, voltarCallback),
            {
              authorId: interaction.user.id,
            }
          )
        )
        .setLabel("Ativar/Desativar")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🔁"),
      new ButtonBuilder()
        .setCustomId(
          this.client.CustomCollector.create((i) => this.testarMensagem(i, tipo), {
            authorId: interaction.user.id,
          })
        )
        .setLabel("Testar Mensagem")
        .setStyle(ButtonStyle.Success)
        .setEmoji("✅"),
      new ButtonBuilder()
        .setCustomId(
          this.client.CustomCollector.create(async (i) => {
            if (voltarCallback) {
              await i.deferUpdate();
              await voltarCallback(i);
            } else {
              await i.reply({
                content: "🔙 Função de voltar não implementada.",
                ephemeral: true,
              });
            }
          }, { authorId: interaction.user.id })
        )
        .setLabel("Voltar")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("⬅️")
    );

    const selectId = this.client.CustomCollector.create(async (i) => {
      const escolha = i.values[0];

      await i.deferUpdate();

      await i.followUp({
        content:
          escolha === "comum"
            ? `📝 Por favor, digite a mensagem de texto para a configuração **${tipo}**.\nVocê pode usar as variáveis disponíveis.`
            : `📦 Por favor, envie o JSON da embed para a configuração **${tipo}**.`,
        ephemeral: true,
      });

      try {
        const msg = await this.client.CustomCollector.coletarMensagem({
          userId: i.user.id,
          channel: i.channel,
          time: 60000,
        });

        await msg.delete().catch(() => {});

        if (escolha === "comum") {
          await this.client.serverdb.updateOne(
            { serverId: i.guild.id },
            {
              $set: {
                [`mensagens.${tipo}.conteudo`]: msg.content,
                [`mensagens.${tipo}.tipo`]: "texto",
              },
            },
            { upsert: true }
          );

          await i.followUp({
            content: "💬 Mensagem comum configurada com sucesso!",
            ephemeral: true,
          });
        } else if (escolha === "embed") {
          let json;
          try {
            json = JSON.parse(msg.content);
          } catch {
            return i.followUp({
              content: "❌ JSON inválido. Por favor, tente novamente.",
              ephemeral: true,
            });
          }

          json = this.substituirVariaveisNoEmbed(json, i.user, i.guild);

          await this.client.serverdb.updateOne(
            { serverId: i.guild.id },
            {
              $set: {
                [`mensagens.${tipo}.embed`]: json,
                [`mensagens.${tipo}.tipo`]: "embed",
              },
            },
            { upsert: true }
          );

          await i.followUp({
            content: "📦 Embed configurada com sucesso!",
            ephemeral: true,
          });
        }

        await this.abrirPainel(i, tipo, voltarCallback);
      } catch {
        await i.followUp({
          content: "⏰ Tempo esgotado! Nenhuma mensagem foi recebida.",
          ephemeral: true,
        });
      }
    }, { authorId: interaction.user.id });

    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(selectId)
        .setPlaceholder("Configurar mensagem...")
        .addOptions([
          {
            label: "Mensagem Comum",
            value: "comum",
            description: "Texto simples com variáveis",
            emoji: "💬",
          },
          {
            label: "Mensagem por Embed",
            value: "embed",
            description: "Mensagem usando JSON",
            emoji: "📦",
          },
        ])
    );

    

    try {
  if (interaction.deferred || interaction.replied) {
    // Já respondeu antes? então edita
    await interaction.editReply({
      embeds: [embed],
      components: [btnRow, selectRow],
    });
  } else {
      await interaction.deferUpdate();
    
    await interaction.editReply({
      embeds: [embed],
      components: [btnRow, selectRow],
      fetchReply: true,
    });
  }
} catch (e) {
  console.error("Erro ao tentar atualizar o painel:", e);
}
  }

  // ======= CONFIGURAR CANAL DE ENVIO =======
    async configurarCanal(interaction, tipo, interactionOriginal, voltarCallback) {
  const canalInteracao = interaction.channel;
      await interaction.deferUpdate();

  await interaction.followUp({
    content: "📢 Mencione o canal onde a mensagem será enviada:",
    ephemeral: true,
  });

  try {
    const msg = await this.client.CustomCollector.coletarMensagem({
      userId: interaction.user.id,
      channel: canalInteracao,
      time: 30000,
    });

    const canal = msg.mentions.channels.first();
    if (!canal)
      return interaction.followUp({
        content: "❌ Nenhum canal mencionado!",
        ephemeral: true,
      });

    if (!canal.isTextBased())
      return interaction.followUp({
        content: "❌ Canal inválido.",
        ephemeral: true,
      });

    if (!canal.permissionsFor(this.client.user)?.has(PermissionsBitField.Flags.SendMessages))
      return interaction.followUp({
        content: "❌ Sem permissão para enviar mensagens nesse canal.",
        ephemeral: true,
      });

    // Salva no banco
    await this.client.serverdb.updateOne(
      { serverId: interaction.guild.id },
      { $set: { [`mensagens.${tipo}.canal`]: canal.id } },
      { upsert: true }
    );

    
    await this.abrirPainel(interaction, tipo, voltarCallback);

    
    return interaction.followUp({
      content: `✅ Canal configurado para <#${canal.id}>.`,
      ephemeral: true,
    });
  } catch {
    return interaction.followUp({
      content: "⏰ Tempo esgotado! Nenhuma mensagem foi recebida.",
      ephemeral: true,
    });
  }
}



  async enviarResposta(interaction, data) {
  try {
    if (interaction.deferred || interaction.replied) {
      return await interaction.followUp(data);
    } else {
      return await interaction.reply(data);
    }
  } catch (err) {
    console.error("❌ Erro ao enviar resposta:", err);
  }
}


  // ======= ATIVAR / DESATIVAR MENSAGEM =======
  async toggleAtivar(interaction, tipo, interactionOriginal, voltarCallback) {
    const servidor = await this.client.serverdb.findOne({ serverId: interaction.guild.id });
    const ativado = !(servidor?.mensagens?.[tipo]?.ativado ?? false);

  //  console.log(tipo, ativado)

    await this.client.serverdb.updateOne(
      { serverId: interaction.guild.id },
      { $set: { [`mensagens.${tipo}.ativado`]: ativado } },
      { upsert: true }
    );

    //interaction.channel.send(`status: ${ativado}`)

    // Atualiza o painel
    await this.abrirPainel(interaction, tipo, voltarCallback);

    // Envia uma notificação em ephemeral
    return interaction.followUp({
      content: `🔁 Sistema **${ativado ? "ativado" : "desativado"}** com sucesso para ${tipo.replace(
        "_",
        " "
      )}.`,
      ephemeral: true,
    });
  }


  // ======= TESTAR ENVIO DE MENSAGEM =======
  async testarMensagem(interaction, tipo) {
    const servidor = await this.client.serverdb.findOne({ serverId: interaction.guild.id });
    const cfg = servidor?.mensagens?.[tipo];
    const canal = interaction.guild.channels.cache.get(cfg?.canal);

    if (!canal || !canal.isTextBased())
      return interaction.reply({ content: "❌ Canal de envio inválido.", ephemeral: true });

    if (!canal.permissionsFor(this.client.user).has(PermissionsBitField.Flags.SendMessages))
      return interaction.reply({ content: "❌ Sem permissão para enviar mensagens no canal.", ephemeral: true });

    try {
      if (cfg.tipo === "texto") {
        const msg = this.substituirVariaveis(cfg.conteudo, interaction.user, interaction.guild);
        await canal.send(msg);
        return interaction.reply({ content: "✅ Mensagem comum enviada com sucesso!", ephemeral: true });
      }

      if (cfg.tipo === "embed") {
        let embedData = this.substituirVariaveisNoEmbed(cfg.embed, interaction.user, interaction.guild);
        const embed = new EmbedBuilder(embedData);
        await canal.send({ embeds: [embed] });
        return interaction.reply({ content: "✅ Embed enviada com sucesso!", ephemeral: true });
      }

      return interaction.reply({ content: "❌ Nenhuma mensagem configurada.", ephemeral: true });
    } catch (err) {
      return interaction.reply({
        content: `❌ Erro ao enviar mensagem: ${err.message}`,
        ephemeral: true,
      });
    }
  }

  // ======= SUBSTITUIR VARIÁVEIS EM TEXTO SIMPLES =======
  substituirVariaveis(texto, user, guild) {
    if (!texto) return "";
    return texto
      .replace(/\(user\.username\)/g, user.username)
      .replace(/\(user\.globalName\)/g, user.globalName || user.username)
      .replace(/\(user\.id\)/g, user.id)
      .replace(/\(user\.avatar\)/g, user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .replace(/\(@user\)/g, `<@${user.id}>`)
      .replace(/\(guild\.name\)/g, guild.name)
      .replace(/\(guild\.id\)/g, guild.id)
      .replace(/\(guild\.avatar\)/g, guild.iconURL({ dynamic: true, size: 1024 }) || "")
      .replace(/\(guild\.membrosTotais\)/g, guild.memberCount.toString());
  }

  // ======= SUBSTITUIR VARIÁVEIS EM EMBED JSON =======
  substituirVariaveisNoEmbed(embedJson, user, guild) {
    if (!embedJson || typeof embedJson !== "object") return embedJson;

    function substituir(texto) {
      if (!texto || typeof texto !== "string") return texto;

      return texto
        .replace(/\(user\.username\)/g, user.username)
        .replace(/\(user\.globalName\)/g, user.globalName || user.username)
        .replace(/\(user\.id\)/g, user.id)
        .replace(/\(user\.avatar\)/g, user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .replace(/\(@user\)/g, `<@${user.id}>`)
        .replace(/\(guild\.name\)/g, guild.name)
        .replace(/\(guild\.id\)/g, guild.id)
        .replace(/\(guild\.avatar\)/g, guild.iconURL({ dynamic: true, size: 1024 }) || "")
        .replace(/\(guild\.membrosTotais\)/g, guild.memberCount.toString());
    }

    if (embedJson.title) embedJson.title = substituir(embedJson.title);
    if (embedJson.description) embedJson.description = substituir(embedJson.description);

    if (embedJson.thumbnail?.url) {
      embedJson.thumbnail.url = substituir(embedJson.thumbnail.url);
      if (!this.validarUrl(embedJson.thumbnail.url)) delete embedJson.thumbnail;
    }

    if (embedJson.image?.url) {
      embedJson.image.url = substituir(embedJson.image.url);
      if (!this.validarUrl(embedJson.image.url)) delete embedJson.image;
    }

    if (embedJson.author) {
      if (embedJson.author.name) embedJson.author.name = substituir(embedJson.author.name);

      if (embedJson.author.icon_url) {
        embedJson.author.icon_url = substituir(embedJson.author.icon_url);
        if (!this.validarUrl(embedJson.author.icon_url)) {
          delete embedJson.author.icon_url;
          if (Object.keys(embedJson.author).length === 1 && embedJson.author.name) {
            // ok
          } else if (Object.keys(embedJson.author).length === 0) {
            delete embedJson.author;
          }
        }
      }
    }

    if (embedJson.footer) {
      if (embedJson.footer.text) embedJson.footer.text = substituir(embedJson.footer.text);

      if (embedJson.footer.icon_url) {
        embedJson.footer.icon_url = substituir(embedJson.footer.icon_url);
        if (!this.validarUrl(embedJson.footer.icon_url)) {
          delete embedJson.footer.icon_url;
          if (Object.keys(embedJson.footer).length === 1 && embedJson.footer.text) {
            // ok
          } else if (Object.keys(embedJson.footer).length === 0) {
            delete embedJson.footer;
          }
        }
      }
    }

    if (Array.isArray(embedJson.fields)) {
      embedJson.fields = embedJson.fields.map((f) => ({
        name: substituir(f.name),
        value: substituir(f.value),
        inline: f.inline,
      }));
    }

    return embedJson;
  }

  validarUrl(url) {
    if (!url || typeof url !== "string") return false;

    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  
  async abrirListaMensagensCustom(interaction) {
    const servidor = await this.client.serverdb.findOne({ serverId: interaction.guild.id });
    const mensagens = servidor?.mensagens_personalizadas || [];

    const embed = new EmbedBuilder()
      .setTitle("🧩 Mensagens por Palavra-chave")
      .setDescription(
        "Configure respostas automáticas baseadas em palavras ou expressões que os usuários enviam no chat!\n\n" +
          `**💡 Máximo permitido:** 10 mensagens\n` +
          `**📦 Cadastradas:** ${mensagens.length}\n\n` +
          (mensagens.length > 0
            ? "🔽 Selecione abaixo uma palavra-chave para editar:"
            : "❌ Nenhuma palavra-chave cadastrada ainda.")
      )
      .setColor("#4A90E2")
      .setFooter({ text: "Furina, regendo cada resposta com esplendor!" });

    const rows = [];

    if (mensagens.length > 0) {
      const selectId = this.client.CustomCollector.create(
        async (i) => {
          const palavra = i.values[0];
          await i.deferUpdate();
          await this.editarMensagemCustom(i, palavra);
        },
        { authorId: interaction.user.id }
      );

      const select = new StringSelectMenuBuilder()
        .setCustomId(selectId)
        .setPlaceholder("Escolha uma palavra-chave para editar")
        .addOptions(
          mensagens.map((m, idx) => ({
            label: `🔹 ${m.palavra}`,
            description: `Tipo: ${m.tipo} • ${m.ativado ? "Ativo" : "Desativado"}`,
            value: m.palavra.slice(0, 100),
          }))
        );

      rows.push(new ActionRowBuilder().addComponents(select));
    }

    const btnRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(
          this.client.CustomCollector.create(
            (i) => this.criarMensagemCustom(i),
            { authorId: interaction.user.id }
          )
        )
        .setLabel("Criar Nova")
        .setStyle(ButtonStyle.Success)
        .setEmoji("🆕"),
      new ButtonBuilder()
        .setCustomId(
          this.client.CustomCollector.create(
            async (i) => {
              await i.deferUpdate();
              await this.abrirPainel(i, "mensagem_automatica");
            },
            { authorId: interaction.user.id }
          )
        )
        .setLabel("Voltar")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("⬅️")
    );

    rows.push(btnRow);

  //  await interaction.deferUpdate();
    await interaction.editReply({
      embeds: [embed],
      components: rows,
    });
  }

  async criarMensagemCustom(interaction) {
  const servidor = await this.client.serverdb.findOne({ serverId: interaction.guild.id });
  const mensagens = servidor?.mensagens_personalizadas || [];

    await interaction.deferUpdate();

  if (mensagens.length >= 10) {
    return interaction.followUp({
      content: "❌ Limite de 10 mensagens personalizadas atingido.",
      ephemeral: true
    });
  }

  // Em vez de abrir modal, pede mensagem no chat
  let msg = await interaction.followUp({
    content: "✍️ Por favor, envie agora a **palavra-chave (gatilho)** para a nova mensagem automática.",
    ephemeral: true,
    fetchReply: true
  });

  // Espera o usuário enviar a mensagem com a palavra-chave
  let msgPalavra;
  try {
    msgPalavra = await this.client.CustomCollector.coletarMensagem({
      userId: interaction.user.id,
      channel: interaction.channel,
      time: 60000
    });
  } catch {
    return interaction.followUp({
      content: "⏰ Tempo esgotado! Nenhuma palavra-chave foi enviada.",
      ephemeral: true
    });
  }

  const palavra = msgPalavra.content.trim().toLowerCase();
  await msgPalavra.delete().catch(() => {});

  if (mensagens.find(m => m.palavra === palavra)) {
    return interaction.followUp({
      content: "❌ Já existe uma resposta para essa palavra-chave.",
      ephemeral: true
    });
  }


    // Escolher tipo da mensagem (texto ou embed)
    await interaction.followUp({
      content: "📦 Escolha o tipo da resposta: texto comum ou embed (JSON)?",
      ephemeral: true,
      components: [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(this.client.CustomCollector.create(async (i) => {
              const tipo = i.values[0];
              await this.coletarConteudoMensagem(i, palavra, tipo, interaction);
            }, { authorId: interaction.user.id }))
            .setPlaceholder("Tipo da resposta")
            .addOptions([
              { label: "Texto comum", value: "texto", emoji: "💬" },
              { label: "Embed (JSON)", value: "embed", emoji: "📦" }
            ])
        )
      ]
    });
  }

  async coletarConteudoMensagem(interaction, palavra, tipo, interactionT) {
   await interaction.deferUpdate();

    const modoId = this.client.CustomCollector.create(async (i) => {
      const modo = i.values[0]; 

      await i.reply({
        content:
          tipo === "texto"
            ? "✍️ Envie agora o **texto da resposta**.\nVocê pode usar variáveis como `(user.username)`, `(guild.name)`, etc."
            : "📥 Envie agora o **JSON da embed** que será usada como resposta.",
        ephemeral: true
      });

      try {
        const msg = await this.client.CustomCollector.coletarMensagem({
          userId: i.user.id,
          channel: i.channel,
          time: 60000
        });

        const conteudoBruto = msg.content;
        await msg.delete().catch(() => {});

        if (tipo === "texto") {
          await this.client.serverdb.updateOne(
            { serverId: i.guild.id },
            {
              $push: {
                mensagens_personalizadas: {
                  palavra,
                  tipo: "texto",
                  modo,
                  resposta: conteudoBruto,
                  ativado: true
                }
              }
            }
          );
        } else {
          let json;
          try {
            json = JSON.parse(conteudoBruto);
          } catch {
            return i.followUp({ content: "❌ JSON inválido!", ephemeral: true });
          }

          json = this.substituirVariaveisNoEmbed(json, i.user, i.guild);

          await this.client.serverdb.updateOne(
            { serverId: i.guild.id },
            {
              $push: {
                mensagens_personalizadas: {
                  palavra,
                  tipo: "embed",
                  modo,
                  embed: json,
                  ativado: true
                }
              }
            }
          );
        }

      //  i.channel.send("chegou na parte de responder")

        await i.followUp({
          content: "✅ Mensagem personalizada criada com sucesso!",
          ephemeral: true
        });
  
        await this.abrirListaMensagensCustom(interactionT);
      } catch {
        return i.followUp({
          content: "⏰ Tempo esgotado! Nenhuma mensagem foi recebida.",
          ephemeral: true
        });
      }
    }, { authorId: interaction.user.id });

    await interaction.followUp({
      content: "📤 Como a resposta deve ser enviada?",
      ephemeral: true,
      components: [
        new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(modoId)
            .setPlaceholder("Escolha o modo de envio")
            .addOptions([
              { label: "Responder a mensagem", value: "responder", emoji: "↩️" },
              { label: "Apenas enviar no canal", value: "enviar", emoji: "📢" }
            ])
        )
      ]
    });
  }
  async editarMensagemCustom(interaction, palavraChave) {
    const servidor = await this.client.serverdb.findOne({ serverId: interaction.guild.id });
    const mensagens = servidor?.mensagens_personalizadas || [];
    const mensagem = mensagens.find(m => m.palavra === palavraChave);

    //await interaction.deferUpdate();
    
    if (!mensagem) {
      return interaction.reply({ content: "❌ Mensagem não encontrada.", ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🛠️ Editando: ${mensagem.palavra}`)
      .setDescription(
        `**📝 Palavra-chave:** \`${mensagem.palavra}\`\n` +
        `**📤 Modo de envio:** \`${mensagem.modo}\`\n` +
        `**📦 Tipo de resposta:** \`${mensagem.tipo}\`\n` +
        `**⚙️ Ativado:** ${mensagem.ativado ? "✅" : "❌"}`
      )
      .setColor("#4A90E2");

    const btnRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(this.client.CustomCollector.create(async (i) => {
          await i.deferUpdate();
          await this.client.serverdb.updateOne(
            { serverId: i.guild.id, "mensagens_personalizadas.palavra": mensagem.palavra },
            { $set: { "mensagens_personalizadas.$.ativado": !mensagem.ativado } }
          );
          await this.editarMensagemCustom(i, palavraChave);
        }, { authorId: interaction.user.id }))
        .setLabel(mensagem.ativado ? "Desativar" : "Ativar")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🔁"),

      new ButtonBuilder()
        .setCustomId(this.client.CustomCollector.create(async (i) => {
          await i.deferUpdate()
          await i.followUp({
            content:
              mensagem.tipo === "texto"
                ? "✍️ Envie o novo conteúdo da mensagem:"
                : "📥 Envie o novo JSON da embed:",
            ephemeral: true
          });

          try {
            const msg = await this.client.CustomCollector.coletarMensagem({
              userId: i.user.id,
              channel: i.channel,
              time: 60000
            });

            const novoConteudo = msg.content;
            await msg.delete().catch(() => {});

            if (mensagem.tipo === "texto") {
              await this.client.serverdb.updateOne(
                { serverId: i.guild.id, "mensagens_personalizadas.palavra": mensagem.palavra },
                { $set: { "mensagens_personalizadas.$.resposta": novoConteudo } }
              );
            } else {
              let json;
              try {
                json = JSON.parse(novoConteudo);
              } catch {
                return i.followUp({ content: "❌ JSON inválido.", ephemeral: true });
              }

              json = this.substituirVariaveisNoEmbed(json, i.user, i.guild);

              await this.client.serverdb.updateOne(
                { serverId: i.guild.id, "mensagens_personalizadas.palavra": mensagem.palavra },
                { $set: { "mensagens_personalizadas.$.embed": json } }
              );
            }

            await i.followUp({ content: "✅ Mensagem atualizada com sucesso!", ephemeral: true });
            await this.editarMensagemCustom(i, palavraChave);
          } catch {
            return i.followUp({ content: "⏰ Tempo esgotado!", ephemeral: true });
          }
        }, { authorId: interaction.user.id }))
        .setLabel("Editar Conteúdo")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("✏️"),

      new ButtonBuilder()
        .setCustomId(this.client.CustomCollector.create(async (i) => {
          await i.deferUpdate();
          
          const modoId = this.client.CustomCollector.create(async (sel) => {
            const novoModo = sel.values[0];
            
            await this.client.serverdb.updateOne(
              { serverId: sel.guild.id, "mensagens_personalizadas.palavra": mensagem.palavra },
              { $set: { "mensagens_personalizadas.$.modo": novoModo } }
            );
            
            await sel.deferUpdate();

            await this.editarMensagemCustom(i, palavraChave);
            
            await sel.followUp({ content: "✅ Modo de envio atualizado!", ephemeral: true });
            
            
          }, { authorId: i.user.id });

          

          await i.followUp({
            content: "🔁 Escolha o novo modo de envio:",
            ephemeral: true,
            components: [
              new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId(modoId)
                  .setPlaceholder("Novo modo de envio")
                  .addOptions(
                    { label: "Responder", value: "responder", emoji: "↩️" },
                    { label: "Apenas enviar", value: "enviar", emoji: "📢" }
                  )
              )
            ]
          });
        }, { authorId: interaction.user.id }))
        .setLabel("Editar Modo")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("📤")
    );

    const btnRow2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(this.client.CustomCollector.create(async (i) => {
          await i.deferUpdate()
          await i.followUp({
            content: "✍️ Envie a nova palavra-chave:",
            ephemeral: true
          });

          try {
            const msg = await this.client.CustomCollector.coletarMensagem({
              userId: i.user.id,
              channel: i.channel,
              time: 30000
            });

            const novaPalavra = msg.content.toLowerCase().trim();
            await msg.delete().catch(() => {});

            if (mensagens.some(m => m.palavra === novaPalavra)) {
              return i.followUp({ content: "❌ Essa palavra-chave já existe!", ephemeral: true });
            }

            await this.client.serverdb.updateOne(
              { serverId: i.guild.id, "mensagens_personalizadas.palavra": mensagem.palavra },
              { $set: { "mensagens_personalizadas.$.palavra": novaPalavra } }
            );

            await i.followUp({ content: "✅ Palavra-chave atualizada!", ephemeral: true });
            await this.editarMensagemCustom(i, novaPalavra);
          } catch {
            return i.followUp({ content: "⏰ Tempo esgotado.", ephemeral: true });
          }
        }, { authorId: interaction.user.id }))
        .setLabel("Editar Palavra")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("📝"),

      new ButtonBuilder()
        .setCustomId(this.client.CustomCollector.create(async (i) => {

          await i.deferUpdate();
          await this.client.serverdb.updateOne(
            { serverId: i.guild.id },
            { $pull: { mensagens_personalizadas: { palavra: mensagem.palavra } } }
          );
          await i.followUp({ content: "🗑️ Mensagem excluída com sucesso!", ephemeral: true });
          await this.abrirListaMensagensCustom(i);
        }, { authorId: interaction.user.id }))
        .setLabel("Apagar")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("🗑️"),

      new ButtonBuilder()
        .setCustomId(this.client.CustomCollector.create(async (i) => {
          await i.deferUpdate();
          await this.abrirListaMensagensCustom(i);
        }, { authorId: interaction.user.id }))
        .setLabel("Voltar")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("⬅️")
    );

    await interaction.editReply({
      embeds: [embed],
      components: [btnRow, btnRow2]
    });
  }
  substituirVariaveis(texto, user, guild) {
    if (!texto) return "";
    return texto
      .replace(/\(user\.username\)/g, user.username)
      .replace(/\(user\.globalName\)/g, user.globalName || user.username)
      .replace(/\(user\.id\)/g, user.id)
      .replace(/\(user\.avatar\)/g, user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .replace(/\(@user\)/g, `<@${user.id}>`)
      .replace(/\(guild\.name\)/g, guild.name)
      .replace(/\(guild\.id\)/g, guild.id)
      .replace(/\(guild\.avatar\)/g, guild.iconURL({ dynamic: true, size: 1024 }) || "")
      .replace(/\(guild\.membrosTotais\)/g, guild.memberCount.toString());
  }

  substituirVariaveisNoEmbed(embedJson, user, guild) {
    if (!embedJson || typeof embedJson !== "object") return embedJson;

    function substituir(texto) {
      if (!texto || typeof texto !== "string") return texto;

      return texto
        .replace(/\(user\.username\)/g, user.username)
        .replace(/\(user\.globalName\)/g, user.globalName || user.username)
        .replace(/\(user\.id\)/g, user.id)
        .replace(/\(user\.avatar\)/g, user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .replace(/\(@user\)/g, `<@${user.id}>`)
        .replace(/\(guild\.name\)/g, guild.name)
        .replace(/\(guild\.id\)/g, guild.id)
        .replace(/\(guild\.avatar\)/g, guild.iconURL({ dynamic: true, size: 1024 }) || "")
        .replace(/\(guild\.membrosTotais\)/g, guild.memberCount.toString());
    }

    if (embedJson.title) embedJson.title = substituir(embedJson.title);
    if (embedJson.description) embedJson.description = substituir(embedJson.description);

    if (embedJson.thumbnail?.url) {
      embedJson.thumbnail.url = substituir(embedJson.thumbnail.url);
      if (!this.validarUrl(embedJson.thumbnail.url)) delete embedJson.thumbnail;
    }

    if (embedJson.image?.url) {
      embedJson.image.url = substituir(embedJson.image.url);
      if (!this.validarUrl(embedJson.image.url)) delete embedJson.image;
    }

    if (embedJson.author) {
      if (embedJson.author.name) embedJson.author.name = substituir(embedJson.author.name);

      if (embedJson.author.icon_url) {
        embedJson.author.icon_url = substituir(embedJson.author.icon_url);
        if (!this.validarUrl(embedJson.author.icon_url)) {
          delete embedJson.author.icon_url;
          if (Object.keys(embedJson.author).length === 1 && embedJson.author.name) {
            // ok
          } else if (Object.keys(embedJson.author).length === 0) {
            delete embedJson.author;
          }
        }
      }
    }

    if (embedJson.footer) {
      if (embedJson.footer.text) embedJson.footer.text = substituir(embedJson.footer.text);

      if (embedJson.footer.icon_url) {
        embedJson.footer.icon_url = substituir(embedJson.footer.icon_url);
        if (!this.validarUrl(embedJson.footer.icon_url)) {
          delete embedJson.footer.icon_url;
          if (Object.keys(embedJson.footer).length === 1 && embedJson.footer.text) {
            // ok
          } else if (Object.keys(embedJson.footer).length === 0) {
            delete embedJson.footer;
          }
        }
      }
    }

    if (Array.isArray(embedJson.fields)) {
      embedJson.fields = embedJson.fields.map((f) => ({
        name: substituir(f.name),
        value: substituir(f.value),
        inline: f.inline,
      }));
    }

    return embedJson;
  }

  validarUrl(url) {
    if (!url || typeof url !== "string") return false;

    try {
      const parsed = new URL(url);
      return ["http:", "https:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }
}

module.exports = ConfigMsgAuto;
