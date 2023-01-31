const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require("discord.js");
const {QueryType} = require("discord-player");
const {EmbedBuilder} = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Plays song.")

    .addSubcommand((subcommand) =>
        subcommand.setName("song")
        .setDescription("Plays a song from URL.")
        .addStringOption((option) => option.setName("url").setDescription("song url").setRequired(true))
    )
    
    .addSubcommand((subcommand) =>
        subcommand.setName("playlist")
        .setDescription("Plays a playlist of songs from URL.")
        .addStringOption((option) => option.setName("url").setDescription("playlist url").setRequired(true))
    )

    .addSubcommand((subcommand) =>
        subcommand.setName("search")
        .setDescription("Searches for song from keywords.")
        .addStringOption((option) => option.setName("keywords").setDescription("keywords").setRequired(true))
    ),

    run: async ({client, interaction}) => {
        if(!interaction.member.voice.channel)
        {
            return interaction.editReply("Songs can only be requested if you're in a voice channel.");
        }
        const queue = await client.player.createQueue(interaction.guild);
        if(!queue.connection)
        {
            await queue.connect(interaction.member.voice.channel);
        }
        let embed = new EmbedBuilder()

        if(interaction.options.getSubcommand() === "song")
        {
            let url = interaction.options.getString("url");
            const result = await client.player.search(url,{
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            });
            if(result.tracks.length === 0)
            {
                return interaction.editReply("No results.");
            }
            const song = result.tracks[0];
            await queue.addTrack(song);
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the queue`)
                .setThumbnail(song.thumbnail)
                .setFooter({text: `Duration: ${song.duration}`})
        }
        else if(interaction.options.getSubcommand() === "playlist")
        {
            let url = interaction.options.getString("url");
            const result = await client.player.search(url,{
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            });
            if(result.tracks.length === 0)
            {
                return interaction.editReply("No results.");
            }
            const playlist = result.playlist;
            await queue.addTracks(result.tracks);
            embed
                .setDescription(`**${result.tracks.length} songs from [${playlist.title}](${playlist.url})** have been added to the queue`)
        }
        else if(interaction.options.getSubcommand() === "search")
        {
            let url = interaction.options.getString("keywords");
            url = url + " lyrics";
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            });
            if(result.tracks.length === 0)
            {
                return interaction.editReply("No results.");
            }
            const song = result.tracks[0];
            await queue.addTrack(song);
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the queue`)
                .setThumbnail(song.thumbnail)
                .setFooter({text: `Duration: ${song.duration}`})
        }
        if(!queue.playing)
        {
            await queue.play()
        }
        await interaction.editReply({
            embeds: [embed]
        })
    },
}