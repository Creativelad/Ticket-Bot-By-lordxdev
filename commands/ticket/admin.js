const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { generateTranscript } = require("../../utils/generateTranscript");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticketadmin")
        .setDescription("Admin commands for ticket management")
        .addSubcommand(subcommand =>
            subcommand.setName("forceclose")
                .setDescription("Forcefully close a ticket channel")
        )
        .addSubcommand(subcommand =>
            subcommand.setName("transcript")
                .setDescription("Manually generate and download a transcript")
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(client, interaction) {
        const subcommand = interaction.options.getSubcommand();
        const ticketChannel = interaction.channel;

        if (!ticketChannel.name.startsWith("ticket-")) {
            return interaction.reply({ content: "❌ This is not a valid ticket channel!", ephemeral: true });
        }

        // 🔒 **Force Close Ticket**
        if (subcommand === "forceclose") {
            const transcriptPath = await generateTranscript(ticketChannel);
            const attachment = new AttachmentBuilder(transcriptPath);

            await interaction.reply({
                content: "✅ Ticket forcefully closed by admin.",
                files: [attachment]
            });

            setTimeout(() => {
                ticketChannel.delete();
                fs.unlinkSync(transcriptPath);
            }, 5000);
        }

        // 📜 **Download Transcript**
        if (subcommand === "transcript") {
            const transcriptPath = await generateTranscript(ticketChannel);
            const attachment = new AttachmentBuilder(transcriptPath);

            await interaction.reply({
                content: "📜 Here is the ticket transcript.",
                files: [attachment],
                ephemeral: true
            });
        }
    }
};
