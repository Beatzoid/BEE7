// eslint-disable-next-line
const { MessageAttachment } = require("discord.js");

module.exports = {
    name: "magik",
    category: "Images",
    description: "Magik yours or someone else's pfp",
    usage: "magik [user mention]",
    timeout: 5000,
    // eslint-disable-next-line
    run: async (bot, message, args) => {
        try {
            const msg = await message.channel.send(
                "<a:loading:721436743550763055>",
            );
            const member = message.mentions.members.first() || message.member;

            const image = await bot.alexclient.image.magik({
                image: member.user.displayAvatarURL({
                    format: "png",
                    size: 4096,
                }),
            });
            await message.channel.send(
                new MessageAttachment(image, "wooosh.png"),
            );
            msg.delete();
            // eslint-disable-next-line brace-style
        } catch (err) {
            const db = require("../../db");
            const prefix = (await db.get(`Prefix_${message.guild.id}`))
                ? await db.get(`Prefix_${message.guild.id}`)
                : "!";
            console.log(`There was an error!\nError: ${err.stack}`);
            message.channel.send(
                `**ERROR!**\nThere was an error trying to run this command:\`${err.message}\`\nPlease do \`${prefix}support\`, join the support server, and report this error ASAP!`,
            );
        }
    },
};
