const { Events, Collection, EmbedBuilder } = require("discord.js");

class ReactionEvent {
    constructor(client, options = {}) {
        this.client = client;
        this.messageCount = 0;
        this.interval = this.randomInterval(1, 60);
        this.duration = options.duration || 60 * 1000;
        this.activeWindow = options.activeWindow || 5 * 60 * 1000;

        this.reactionRewards = {
            "🔥": 25,
            "💎": 250,
            "⭐": 60,
            "🍀": 40,
            "🎁": 15
        };

        this.activeReactions = new Collection();
        this.lastActive = new Collection();

        this.logChannelId = "1421849079549526016"; // canal de log

        this.client.on(Events.MessageCreate, (msg) => this.onMessage(msg));
        this.client.on(Events.MessageReactionAdd, (reaction, user) => this.onReaction(reaction, user));
    }

    randomInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    async sendLog(embed) {
        if (!this.client.restMessenger) {
            console.error("[ReactionEvent] RestMessenger não está instanciado!");
            return;
        }

        try {
            await this.client.restMessenger.enviar(this.logChannelId, { embeds: [embed] });
        } catch (err) {
            console.error("[ReactionEvent] Erro ao enviar embed para log:", err);
        }
    }

    async onMessage(message) {
        if (!message.guild || message.author.bot) return;
       // if (message.guild.id !== "1373420276737507489") return;

        this.lastActive.set(message.author.id, Date.now());
        this.messageCount++;

        const messagesLeft = this.interval - this.messageCount;

        // log contagem
        const embedContagem = new EmbedBuilder()
            .setTitle("📊 Contagem para Spawn de Emoji")
            .setColor("Random")
            .addFields(
                { name: "Servidor", value: message.guild.name, inline: true },
                { name: "Mensagens Faltando", value: `${messagesLeft < 0 ? 0 : messagesLeft}`, inline: true },
                { name: "Intervalo Atual", value: `${this.interval} mensagens`, inline: true },
                { name: "Horário", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
            );
      //  await this.sendLog(embedContagem);

        // spawn emoji
        if (this.messageCount >= this.interval) {
            this.messageCount = 0;

            const serverData = await this.client.serverdb.findOne({ serverId: message.guild.id });
            if (!serverData?.furinaEventos) return;

            const emojis = Object.keys(this.reactionRewards);
            const chosenEmoji = emojis[Math.floor(Math.random() * emojis.length)];

            try {
                await message.react(chosenEmoji);
            } catch {}

            this.activeReactions.set(message.id, {
                expires: Date.now() + this.duration,
                emoji: chosenEmoji,
                points: this.reactionRewards[chosenEmoji],
                reactedUsers: new Set()
            });

            this.interval = this.randomInterval(1, 60);

            const embedSpawn = new EmbedBuilder()
                .setTitle("✨ Emoji Spawnado")
                .setColor("Random")
                .addFields(
                    { name: "Servidor", value: message.guild.name, inline: true },
                    { name: "Mensagem ID", value: message.id, inline: true },
                    { name: "Emoji", value: chosenEmoji, inline: true },
                    { name: "Primogemas", value: `${this.reactionRewards[chosenEmoji]}`, inline: true },
                    { name: "Próximo Spawn", value: `Em ${this.interval} mensagens`, inline: true },
                    { name: "Horário", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                );
            await this.sendLog(embedSpawn);
        }
    }

    async onReaction(reaction, user) {
        if (!reaction.message.guild || user.bot) return;
        //if (reaction.message.guild.id !== "1373420276737507489") return;

        const data = this.activeReactions.get(reaction.message.id);
        if (!data) return;
        if (Date.now() > data.expires) {
            this.activeReactions.delete(reaction.message.id);
            return;
        }
        if (reaction.emoji.name !== data.emoji) return;
        if (data.reactedUsers.has(user.id)) return;

        const last = this.lastActive.get(user.id);
        if (!last || Date.now() - last > this.activeWindow) return;

        data.reactedUsers.add(user.id);

        const userData = await this.client.userdb.findOne({ id: user.id });
        if (!userData) return;

        const amount = data.points;
        userData.primogemas += amount;
        await userData.save();

        this.interval = this.randomInterval(1, 60);

        const userInfo = await this.client.restMessenger.buscarUsuario(user.id);
        const embedReacao = new EmbedBuilder()
            .setTitle("🏆 Reação Coletada")
            .setColor("Gold")
            .addFields(
                { name: "Servidor", value: reaction.message.guild.name, inline: true },
                { name: "Mensagem ID", value: reaction.message.id, inline: true },
                { name: "Usuário", value: `${userInfo?.username || user.tag} (${user.id})`, inline: true },
                { name: "Emoji", value: reaction.emoji.name, inline: true },
                { name: "Primogemas Ganhas", value: `${amount}`, inline: true },
                { name: "Total Primogemas", value: `${userData.primogemas}`, inline: true },
                { name: "Próximo Spawn", value: `Em ${this.interval} mensagens`, inline: true },
                { name: "Horário", value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
            );
        await this.sendLog(embedReacao);
    }
}

module.exports = ReactionEvent;
