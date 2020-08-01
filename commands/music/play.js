// eslint-disable-next-line
const { MessageEmbed } = require("discord.js");
const { Utils } = require("erela.js");

module.exports = {
    name: "play",
    category: "Music",
    description: "Play some epic tunes",
    usage: "play <song name or url>",
    timeout: 5000,
    aliases: ["p"],
    // eslint-disable-next-line
    run: async (bot, message, args) => {
        try {
            const { channel } = message.member.voice;
            if (!channel)
                return message.channel.send(
                    "You need to be in a voice channel to play music.",
                );

            const permissions = channel.permissionsFor(bot.user);
            if (!permissions.has("CONNECT"))
                return message.channel.send(
                    "I cannot connect to your voice channel, make sure I have permission to!",
                );
            if (!permissions.has("SPEAK"))
                return message.channel.send(
                    "I cannot connect to your voice channel, make sure I have permission to!",
                );

            if (!args[0])
                return message.channel.send(
                    "Please provide a song name or link to search.",
                );

            const player = bot.music.players.spawn({
                guild: message.guild,
                textChannel: message.channel,
                voiceChannel: channel,
            });

            bot.music
                .search(args.join(" "), message.author)
                .then(async (res) => {
                    switch (res.loadType) {
                        case "TRACK_LOADED":
                            player.queue.add(res.tracks[0]);
                            message.channel.send(
                                `:inbox_tray: | Enqueuing \`${
                                    res.tracks[0].title
                                }\` \`${Utils.formatTime(
                                    res.tracks[0].duration,
                                    true,
                                )}\``,
                            );
                            if (!player.playing) player.play();
                            break;

                        case "SEARCH_RESULT":
                            let index = 1;
                            const tracks = res.tracks.slice(0, 5);
                            const embed = new MessageEmbed()
                                .setColor("#2f3136")
                                .setAuthor(
                                    "Song Selection.",
                                    message.author.displayAvatarURL,
                                )
                                .setDescription(
                                    tracks.map(
                                        (video) =>
                                            `**${index++} -** ${video.title}`,
                                    ),
                                )
                                .setFooter(
                                    "Your response time closes within the next 30 seconds. Type 'cancel' to cancel the selection",
                                );

                            await message.channel.send(embed);

                            const collector = message.channel.createMessageCollector(
                                (m) => {
                                    return (
                                        m.author.id === message.author.id &&
                                        new RegExp(
                                            `^([1-5]|cancel)$`,
                                            "i",
                                        ).test(m.content)
                                    );
                                },
                                { time: 30000, max: 1 },
                            );

                            collector.on("collect", (m) => {
                                if (/cancel/i.test(m.content))
                                    return collector.stop("cancelled");

                                const track = tracks[Number(m.content) - 1];
                                player.queue.add(track);
                                message.channel.send(
                                    `:inbox_tray: | Enqueuing \`${
                                        track.title
                                    }\` \`${Utils.formatTime(
                                        track.duration,
                                        true,
                                    )}\``,
                                );
                                if (!player.playing) player.play();
                            });

                            collector.on("end", (_, reason) => {
                                if (["time", "cancelled"].includes(reason))
                                    return message.channel.send(
                                        "Cancelled selection.",
                                    );
                            });
                            break;

                        case "PLAYLIST_LOADED":
                            res.playlist.tracks.forEach((track) =>
                                player.queue.add(track),
                            );
                            const duration = Utils.formatTime(
                                res.playlist.tracks.reduce((acc, cur) => ({
                                    duration: acc.duration + cur.duration,
                                })).duration,
                                true,
                            );
                            message.channel.send(
                                `:inbox_tray: | Enqueuing \`${res.playlist.tracks.length}\` \`${duration}\` tracks in playlist \`${res.playlist.info.name}\``,
                            );
                            if (!player.playing) player.play();
                            break;
                    }
                });
            // eslint-disable-next-line brace-style
        } catch (err) {
            const db = require("../../db");
            const prefix = (await db.get(`Prefix_${message.guild.id}`))
                ? await db.get(`Prefix_${message.guild.id}`)
                : "!";
            console.log(`There was an error!\nError: ${err.stack}`);
            message.channel.send(
                `**ERROR!**\nThere was an error trying to run this command: \`${err.message}\`\nIf you don't know what this means please do \`${prefix}support\`, join the support server, and report this error ASAP!`,
            );
        }
    },
};
