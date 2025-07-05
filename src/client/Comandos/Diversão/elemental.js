const { EmbedBuilder } = require("discord.js");

const gifs = {
  "Furina": "https://files.catbox.moe/wqo27v.gif",
  "Diluc": "https://files.catbox.moe/q6cd8q.gif",
  "Keqing": "https://files.catbox.moe/gk095x.gif",
  "Jean": "https://files.catbox.moe/0fdvst.gif",
  "Qiqi": "https://files.catbox.moe/h5wf5u.gif",
  "Mona": "https://files.catbox.moe/cyu5tp.gif"
};

module.exports = {
  name: "elemental",
  description: "A justiça será lançada com fúria elemental! Escolha seu alvo — e que os céus decidam o resto!",
  type: 1,
  options: [
    {
      name: "usuário",
      description: 'Insira o ID ou mencione o usuário',
      type: 6,
      required: true
    }
  ],

  run: async (Furina, interaction) => {
    try {
      const user = interaction.options.getUser("usuário");

      let userdb = await Furina.userdb.findOne({ id: interaction.user.id });

      if (!userdb) {
        let newuser = new Furina.userdb({ id: interaction.user.id });
        await newuser.save();

        userdb = await Furina.userdb.findOne({ id: interaction.user.id });
      }

      if (!user) {
        return await interaction.editReply({
          content: `Usuário inválido. Tente novamente com um ID ou menção válida.`
        });
      }

      if (interaction.user.id === user.id) {
        const jaTem = await Furina.conquistas.temConquista(interaction.user.id, 9);

        await interaction.editReply({
          content: `Autoataque? Que desperdício de energia… Cuide melhor de si mesmo antes de querer julgar os outros.`
        });

        if (!jaTem) {
          await Furina.conquistas.addConquista(interaction.user.id, 9, "Roleplay");

          if (userdb.notificar) {
            try {
              const userId = interaction.user.id;
              const conquistaId = 9;
              const user = await Furina.users.fetch(userId);

              const info = Furina.conquistasJson.find(x => String(x.id) === String(conquistaId)) || {};
              const nome = info.nome || "Conquista";
              const descricao = info.descricao || "Você desbloqueou uma nova conquista!";

              const embed = new EmbedBuilder()
                .setTitle("🌊✨ Conquista Desbloqueada!")
                .setDescription(`Você conquistou: **${nome}**\n\n_${descricao}_`)
                .setColor("#00d4ff")
                .setFooter({ text: "Tribunal de Fontaine • Furina do Discord", iconURL: Furina.user.displayAvatarURL() })
                .setTimestamp();

              await user.send({ embeds: [embed] }).catch(() => null);
            } catch {
              // Falha ao enviar DM
            }
          }
        }
      } else if (user.id === Furina.user.id) {
        const jaTem = await Furina.conquistas.temConquista(interaction.user.id, 8);

        const embed = new EmbedBuilder()
          .setDescription(`Insistir em desafiar ${interaction.user}? Prepare-se, pois a justiça não tolera afrontas!`)
          .setColor("#3A86FF")
          .setImage(gifs["Furina"]);

        await interaction.editReply({ embeds: [embed] });

        if (!jaTem) {
          await Furina.conquistas.addConquista(interaction.user.id, 8, "Roleplay");

          if (userdb.notificar) {
            try {
              const userId = interaction.user.id;
              const conquistaId = 8;
              const user = await Furina.users.fetch(userId);

              const info = Furina.conquistasJson.find(x => String(x.id) === String(conquistaId)) || {};
              const nome = info.nome || "Conquista";
              const descricao = info.descricao || "Você desbloqueou uma nova conquista!";

              const embed = new EmbedBuilder()
                .setTitle("🌊✨ Conquista Desbloqueada!")
                .setDescription(`Você conquistou: **${nome}**\n\n_${descricao}_`)
                .setColor("#00d4ff")
                .setFooter({ text: "Tribunal de Fontaine • Furina do Discord", iconURL: Furina.user.displayAvatarURL() })
                .setTimestamp();

              await user.send({ embeds: [embed] }).catch(() => null);
            } catch {
              // Falha ao enviar DM
            }
          }
        }
      } else {
        const ataquesUltimates = [
          {
            personagem: "Diluc",
            ataque: `${interaction.user} invoca as chamas da fúria com Templário Carmesim, incinerando ${user} em um mar de fogo!`,
            cor: "#FF4C29"
          },
          {
            personagem: "Diluc",
            ataque: `O poder de Templário Carmesim explode! ${interaction.user} queima ${user} com chamas devastadoras!`,
            cor: "#FF4C29"
          },
          {
            personagem: "Furina",
            ataque: `${interaction.user} convoca a Justiça Implacável, inundando ${user} com a força da Hydro divina!`,
            cor: "#3A86FF"
          },
          {
            personagem: "Furina",
            ataque: `A maré da sentença de ${interaction.user} rompe, submergindo ${user} na fúria do Arconte Hydro!`,
            cor: "#3A86FF"
          },
          {
            personagem: "Qiqi",
            ataque: `${interaction.user} libera Presença Preservadora, envolvendo ${user} numa névoa que cura e pune!`,
            cor: "#A7C7E7"
          },
          {
            personagem: "Qiqi",
            ataque: `${user} sente o toque gélido da Presença Preservadora invocada por ${interaction.user}, um julgamento frio e implacável!`,
            cor: "#A7C7E7"
          },
          {
            personagem: "Jean",
            ataque: `${interaction.user} convoca a Tempestade do Norte, varrendo ${user} com o furacão da justiça!`,
            cor: "#C1A56F"
          },
          {
            personagem: "Jean",
            ataque: `O vento de Jean sopra com força total! ${interaction.user} arrasta ${user} para longe com a Tempestade do Norte!`,
            cor: "#C1A56F"
          },
          {
            personagem: "Mona",
            ataque: `${interaction.user} ativa Dilúvio Astral, prendendo ${user} numa ilusão esmagadora!`,
            cor: "#6C63FF"
          },
          {
            personagem: "Mona",
            ataque: `Sob o poder do Dilúvio Astral de ${interaction.user}, ${user} é envolvido numa armadilha líquida inescapável!`,
            cor: "#6C63FF"
          },
          {
            personagem: "Keqing",
            ataque: `${interaction.user} invoca Estrela Cadente, lançando relâmpagos que fulminam ${user}!`,
            cor: "#C7DFFF"
          },
          {
            personagem: "Keqing",
            ataque: `Com Estrela Cadente, ${interaction.user} rasga o céu e desfere um ataque elétrico fatal contra ${user}!`,
            cor: "#C7DFFF"
          }
        ];

        const index = Math.floor(Math.random() * ataquesUltimates.length);
        const atq = ataquesUltimates[index];

        const embed = new EmbedBuilder()
          .setDescription(atq.ataque)
          .setColor(atq.cor)
          .setImage(gifs[atq.personagem]);

        return await interaction.editReply({ embeds: [embed] });
      }
    } catch (e) {
      console.error(e);
      await interaction.editReply({
        content: "⚠️ Ocorreu um erro ao executar o ataque elemental."
      });
    }
  }
};
