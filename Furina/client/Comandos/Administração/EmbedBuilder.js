const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  name: "embed-criar",
  description: "Crie e personalize uma embed usando menu e modais",
  type: 1,

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({
        content: "❌ Você precisa da permissão **Gerenciar Mensagens** para usar este comando.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    try {

    const embed = new EmbedBuilder();
    const embedData = {
      title: null,
      description: "Descrição da sua embed aqui",
      color: null,
      thumbnail: null,
      image: null,
      author: { name: null, icon_url: null },
      footer: { text: null, icon_url: null },
      fields: [],
    };

    
    const variaveisEmbed = [
      "(guild.name) - Nome do servidor",
      "(guild.avatar) - Avatar do servidor",
      "(guild.id) - ID do servidor",
      "(guild.membrosTotais) - Total de membros do servidor",
      "(user.username) - Seu nome de usuário",
      "(user.globalName) - Seu nome global (ou username se não tiver)",
      "(user.avatar) - Seu avatar",
      "(user.id) - Seu ID"
    ];

    const substituirVariaveis = (texto) => {
      if (!texto) return null;

      return texto
        .replace(/\(guild\.name\)/g, interaction.guild.name || "")
        .replace(/\(guild\.avatar\)/g, interaction.guild?.iconURL({ dynamic: true }) || client.user.displayAvatarURL())
        .replace(/\(guild\.id\)/g, interaction.guild?.id || "")
        .replace(/\(guild\.membrosTotais\)/g, (interaction.guild?.memberCount ?? 0).toString())
        .replace(/\(user\.username\)/g, interaction.user.username)
        .replace(/\(user\.globalName\)/g, interaction.user.globalName || interaction.user.username)
        .replace(/\(user\.avatar\)/g, interaction.user.displayAvatarURL({ dynamic: true }))
        .replace(/\(user\.id\)/g, interaction.user.id);
    };



    const atualizarEmbed = () => {
      embed.setTitle(substituirVariaveis(embedData.title));
      embed.setDescription(substituirVariaveis(embedData.description));
      embed.setColor(embedData.color || null);
      embed.setThumbnail(substituirVariaveis(embedData.thumbnail));
      embed.setImage(substituirVariaveis(embedData.image));

      if (embedData.author.name || embedData.author.icon_url) {
        embed.setAuthor({
          name: substituirVariaveis(embedData.author.name),
          iconURL: substituirVariaveis(embedData.author.icon_url),
        });
      } else embed.setAuthor(null);

      if (embedData.footer.text || embedData.footer.icon_url) {
        embed.setFooter({
          text: substituirVariaveis(embedData.footer.text),
          iconURL: substituirVariaveis(embedData.footer.icon_url),
        });
      } else embed.setFooter(null);

      embed.setFields(
        embedData.fields.map((f) => ({
          name: substituirVariaveis(f.name),
          value: substituirVariaveis(f.value),
          inline: f.inline,
        }))
      );
    };
    atualizarEmbed();

    const selectMenuId = client.CustomCollector.create(async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ Apenas quem iniciou pode usar.", ephemeral: true });
      }

      const campo = i.values[0];
      await abrirModal(i, campo);
    }, { authorId: interaction.user.id, timeout: 5 * 60 * 1000 });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(selectMenuId)
      .setPlaceholder("Selecione o campo para editar")
      .addOptions([
        { label: "Título", value: "title", description: "Editar o título da embed" },
        { label: "Descrição", value: "description", description: "Editar a descrição da embed" },
        { label: "Cor", value: "color", description: "Editar a cor da embed" },
        { label: "Thumbnail", value: "thumbnail", description: "Editar a thumbnail da embed" },
        { label: "Imagem", value: "image", description: "Editar a imagem da embed" },
        { label: "Author - Nome", value: "author_name", description: "Editar o nome do author" },
        { label: "Author - Avatar", value: "author_icon", description: "Editar o avatar do author" },
        { label: "Footer - Texto", value: "footer_text", description: "Editar o texto do footer" },
        { label: "Footer - Ícone", value: "footer_icon", description: "Editar o ícone do footer" },
        { label: "Fields - Adicionar", value: "fields_add", description: "Adicionar um campo (field)" },
        { label: "Fields - Remover", value: "fields_remove", description: "Remover um campo (field)" },
        { label: "Variáveis válidas", value: "variaveis", description: "Mostrar variáveis que podem ser usadas" },
      ]);

    const enviarId = client.CustomCollector.create(enviarEmbed, { authorId: interaction.user.id, timeout: 15 * 60 * 1000 });
    const jsonId = client.CustomCollector.create(mostrarJson, { authorId: interaction.user.id, timeout: 15 * 60 * 1000 });
    const webhookId = client.CustomCollector.create(enviarWebhook, { authorId: interaction.user.id, timeout: 15 * 60 * 1000 });

    const actionButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Enviar Embed")
        .setStyle(ButtonStyle.Success)
        .setCustomId(enviarId),
      new ButtonBuilder()
        .setLabel("Mostrar JSON")
        .setStyle(ButtonStyle.Primary)
        .setCustomId(jsonId),
      new ButtonBuilder()
        .setLabel("Enviar via Webhook")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(webhookId),
    );

    await interaction.editReply({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(selectMenu), actionButtons],
    });

    function mostrarJson(i) {
      const json = {
        title: embedData.title,
        description: embedData.description,
        color: embedData.color,
        thumbnail: embedData.thumbnail ? { url: embedData.thumbnail } : undefined,
        image: embedData.image ? { url: embedData.image } : undefined,
        author: embedData.author.name || embedData.author.icon_url
          ? {
              name: embedData.author.name || undefined,
              icon_url: embedData.author.icon_url || undefined,
            }
          : undefined,
        footer: embedData.footer.text || embedData.footer.icon_url
          ? {
              text: embedData.footer.text || undefined,
              icon_url: embedData.footer.icon_url || undefined,
            }
          : undefined,
        fields: embedData.fields.length > 0 ? embedData.fields : undefined,
      };

      return i.reply({ content: "```json\n" + JSON.stringify(json, null, 2) + "\n```", ephemeral: true });
    }
    async function enviarEmbed(i) {
      await i.reply({ content: "Mencione um canal de texto para enviar a embed:", ephemeral: true });
      try {
        const msg = await client.CustomCollector.coletarMensagem({
          userId: i.user.id,
          channel: i.channel,
          time: 30000,
        });

        const canal = msg.mentions.channels.first();
        if (!canal || !canal.isTextBased())
          return i.editReply({ content: "❌ Canal inválido ou não mencionado." });
        if (!canal.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages))
          return i.editReply({ content: "❌ Eu não tenho permissão para enviar mensagens nesse canal." });

        atualizarEmbed();
        await canal.send({ embeds: [embed] });
        await i.editReply({ content: "✅ Embed enviada com sucesso!" });
        await msg.delete().catch(() => {});
      } catch {
        await i.editReply({ content: "⏰ Tempo esgotado para mencionar canal." });
      }
    }

    async function enviarWebhook(i) {
      await i.reply({ content: "Envie a URL do webhook para enviar a embed:", ephemeral: true });
      try {
        const msg = await client.CustomCollector.coletarMensagem({
          userId: i.user.id,
          channel: i.channel,
          time: 30000,
        });

        const url = msg.content.trim();
        if (!url.startsWith("https://discord.com/api/webhooks/")) {
          await i.editReply({ content: "❌ URL de webhook inválida." });
          return;
        }

        const fetch = require("node-fetch");
        atualizarEmbed();

        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ embeds: [embed.toJSON()] }),
        });

        if (!res.ok) {
          await i.editReply({ content: `❌ Erro ao enviar webhook. Status ${res.status}` });
          return;
        }

        await i.editReply({ content: "✅ Embed enviada via webhook com sucesso!" });
        await msg.delete().catch(() => {});
      } catch {
        await i.editReply({ content: "⏰ Tempo esgotado para enviar URL do webhook." });
      }
    }

    async function abrirModal(i, campo) {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: "❌ Apenas quem iniciou pode usar.", ephemeral: true });
      }

      if (campo === "variaveis") {
        return i.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setTitle("Variáveis Válidas")
              .setDescription(variaveisEmbed.join("\n"))
              .setColor("#00AAFF"),
          ],
        });
      }

      if (campo === "fields_add") {
        const modalId = client.CustomCollector.createModal(async (modalI) => {
          const name = modalI.fields.getTextInputValue("field_name").trim();
          const value = modalI.fields.getTextInputValue("field_value").trim();
          const inlineStr = modalI.fields.getTextInputValue("field_inline").trim().toLowerCase();
          const inline = ["true", "sim", "yes", "1"].includes(inlineStr);

          if (!name || !value) {
            return modalI.reply({ content: "❌ Nome e valor são obrigatórios.", ephemeral: true });
          }

          embedData.fields.push({ name, value, inline });
          atualizarEmbed();

          await modalI.deferUpdate();
          await interaction.editReply({ embeds: [embed] });
        }, { authorId: interaction.user.id, timeout: 5 * 60 * 1000 });

        const modal = new ModalBuilder()
          .setCustomId(modalId)
          .setTitle("Adicionar Field")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("field_name")
                .setLabel("Nome do campo")
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("field_value")
                .setLabel("Valor do campo")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId("field_inline")
                .setLabel("Inline? (sim/não)")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
            )
          );

        return i.showModal(modal);
      }
      if (campo === "fields_remove") {
        if (embedData.fields.length === 0) {
          return i.reply({ content: "❌ Nenhum campo para remover.", ephemeral: true });
        }

        const removerId = client.CustomCollector.create(async (selectI) => {
          const index = parseInt(selectI.values[0], 10);
          if (isNaN(index) || index < 0 || index >= embedData.fields.length) {
            return selectI.reply({ content: "❌ Campo inválido.", ephemeral: true });
          }

          embedData.fields.splice(index, 1);
          atualizarEmbed();

          await selectI.deferUpdate();
          await interaction.editReply({ embeds: [embed] });
        }, { authorId: interaction.user.id, timeout: 5 * 60 * 1000 });

        const removerMenu = new StringSelectMenuBuilder()
          .setCustomId(removerId)
          .setPlaceholder("Selecione o campo para remover")
          .addOptions(embedData.fields.map((f, i) => ({
            label: f.name.length > 100 ? f.name.slice(0, 97) + "..." : f.name,
            description: f.value.length > 100 ? f.value.slice(0, 97) + "..." : f.value,
            value: i.toString(),
          })));

        return i.reply({
          ephemeral: true,
          content: "Escolha o campo que deseja remover:",
          components: [new ActionRowBuilder().addComponents(removerMenu)],
        });
      }

      // Campos simples
      let valorAtual = "";
      let tituloModal = "";
      let labelInput = "";
      let styleInput = TextInputStyle.Short;
      let placeholder = "";

      switch (campo) {
        case "title":
          valorAtual = embedData.title || "";
          tituloModal = "Editar Título";
          labelInput = "Título da embed";
          placeholder = "Ex: Bem-vindo(a)!";
          break;
        case "description":
          valorAtual = embedData.description || "";
          tituloModal = "Editar Descrição";
          labelInput = "Descrição da embed";
          styleInput = TextInputStyle.Paragraph;
          placeholder = "Escreva a descrição...";
          break;
        case "color":
          valorAtual = embedData.color ? `#${embedData.color.toString(16).padStart(6, "0")}` : "";
          tituloModal = "Editar Cor";
          labelInput = "Cor hexadecimal";
          placeholder = "#FF0000";
          break;
        case "thumbnail":
          valorAtual = embedData.thumbnail || "";
          tituloModal = "Editar Thumbnail";
          labelInput = "URL da Thumbnail";
          placeholder = "https://exemplo.com/imagem.png";
          break;
        case "image":
          valorAtual = embedData.image || "";
          tituloModal = "Editar Imagem";
          labelInput = "URL da Imagem";
          placeholder = "https://exemplo.com/imagem.png";
          break;
        case "author_name":
          valorAtual = embedData.author.name || "";
          tituloModal = "Editar Nome do Author";
          labelInput = "Nome do Author";
          placeholder = "(user.username), (guild.name), etc.";
          break;
        case "author_icon":
          valorAtual = embedData.author.icon_url || "";
          tituloModal = "Editar Avatar do Author";
          labelInput = "URL do Avatar";
          placeholder = "https://exemplo.com/avatar.png";
          break;
        case "footer_text":
          valorAtual = embedData.footer.text || "";
          tituloModal = "Editar Texto do Footer";
          labelInput = "Texto do Footer";
          placeholder = "(guild.name), (user.username), etc.";
          break;
        case "footer_icon":
          valorAtual = embedData.footer.icon_url || "";
          tituloModal = "Editar Ícone do Footer";
          labelInput = "URL do Ícone";
          placeholder = "https://exemplo.com/icon.png";
          break;
        default:
          return i.reply({ content: "Campo inválido.", ephemeral: true });
      }
      const modalId = client.CustomCollector.createModal(async (modalI) => {
        if (modalI.user.id !== interaction.user.id) {
          return modalI.reply({ content: "❌ Apenas quem iniciou pode usar.", ephemeral: true });
        }

        const valor = modalI.fields.getTextInputValue("input_value").trim();

        try {
          switch (campo) {
            case "title":
              embedData.title = valor || null;
              break;
            case "description":
              embedData.description = valor || null;
              break;
            case "color":
              if (valor) {
                const hex = valor.replace(/^#/, "");
                if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
                  embedData.color = parseInt(hex, 16);
                } else {
                  return modalI.reply({ content: "Cor hexadecimal inválida.", ephemeral: true });
                }
              } else {
                embedData.color = null;
              }
              break;
            case "thumbnail":
              embedData.thumbnail = valor || null;
              break;
            case "image":
              embedData.image = valor || null;
              break;
            case "author_name":
              embedData.author.name = valor || null;
              break;
            case "author_icon":
              embedData.author.icon_url = valor || null;
              break;
            case "footer_text":
              embedData.footer.text = valor || null;
              break;
            case "footer_icon":
              embedData.footer.icon_url = valor || null;
              break;
          }
        } catch {
          return modalI.reply({ content: "Erro ao atualizar embed.", ephemeral: true });
        }

        atualizarEmbed();
        await modalI.deferUpdate();
        await interaction.editReply({ embeds: [embed] });
      }, { authorId: interaction.user.id, timeout: 5 * 60 * 1000 });

      const modal = new ModalBuilder()
        .setCustomId(modalId)
        .setTitle(tituloModal)
        .addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("input_value")
              .setLabel(labelInput)
              .setStyle(styleInput)
              .setPlaceholder(placeholder)
              .setRequired(false)
              .setValue(valorAtual)
          )
        );

      await i.showModal(modal);
    }
      } catch (err) {
  console.error(err);

  const id = await client.reportarErro({
    erro: err,
    comando: interaction.commandName,
    servidor: interaction.guild
  });

  return interaction.editReply({
    content: `❌ Oh là là... Um contratempo inesperado surgiu durante a execução deste comando. Por gentileza, reporte este erro ao nosso servidor de suporte junto com o ID abaixo, para que a justiça divina possa ser feita!\n\n🆔 ID do erro: \`${id}\``,
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            label: "Servidor de Suporte",
            style: 5,
            url: "https://discord.gg/KQg2B5JeBh"
          }
        ]
      }
    ],
    embeds: [],
    files: []
  });
}

  },
};
