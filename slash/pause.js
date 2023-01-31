const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");
const {EmbedBuilder} = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Pauses the current song."),
    run: async ({client,interaction}) => {
        const queue = client.player.getQueue(interaction.guildId)
        if(!queue)
        {
            return await interaction.editReply("There are no songs in the queue.")
        }
        queue.setPaused(true)
        await interaction.editReply("I'll shut up until you use `/resume`.")
    },
}