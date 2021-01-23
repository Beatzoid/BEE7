import { MessageEmbed } from "discord.js";
import { Message } from "discord.js";
import { CustomCommand } from "../../classes/Command";

export default class NowPlayingCommand extends CustomCommand {
    public constructor() {
        super("nowplaying", {
            aliases: ["nowplaying", "np"],
            category: "Music",
            description: {
                content: "Get the currently playing song",
                usage: "nowplaying",
                examples: ["nowplaying", "np"]
            },
            ratelimit: 3
        });
    }

    public async exec(message: Message): Promise<Message> {
        const queue = this.client.player.getQueue(message);

        const voice = message.member.voice.channel;
        if (!voice) {
            return message.channel.send(
                "You must be connected to a voice channel to use this command!"
            );
        }

        if (!queue) {
            return message.channel.send("No music currently playing!");
        }

        const track = this.client.player.nowPlaying(message);

        const embed = new MessageEmbed()
            .setAuthor("Currently playing")
            .setThumbnail(track.thumbnail)
            .addField("Title", track.title, true)
            .addField("Artist", track.author, true)
            .addField(
                "Description",
                // If there is a track description
                // If the length is longer than 150 characters, slice it
                // otherwise show the full description
                // If there is no description, show "No description"
                track.description
                    ? track.description.length > 150
                        ? track.description.substring(0, 150) +
                          "\n" +
                          "And more...".toLowerCase()
                        : track.description
                    : "No description",
                true
            )
            .addField(
                "\u200B",
                this.client.player.createProgressBar(message, {
                    timecodes: true
                })
            )
            .setTimestamp()
            .setColor(this.client.config.transparentColor);

        message.channel.send(embed);
    }
}