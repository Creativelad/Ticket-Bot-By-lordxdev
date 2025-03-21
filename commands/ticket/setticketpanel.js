const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const TicketConfig = require("../../models/configSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setticketpanel")
        .setDescription("Setup the ticket panel in a channel")
        .addChannelOption(option =>
            option.setName("channel")
                .setDescription("Select the channel to send the ticket panel")
                .setRequired(true)
        ),
        
    async execute(client, interaction) {
        if (!interaction.member.permissions.has("Administrator")) {
            return interaction.reply({ content: "❌ You need Administrator permissions to use this command!", ephemeral: true });
        }

        const channel = interaction.options.getChannel("channel");

        // Fetch Ticket Config from Database
        let config = await TicketConfig.findOne({ guildId: interaction.guild.id });
        if (!config) {
            return interaction.reply({ content: "❌ No ticket system is configured for this server!", ephemeral: true });
        }

        // Create Embed
        const embed = new EmbedBuilder()
            .setTitle(config.panelTitle || "🎫 Support Tickets")
            .setDescription(config.panelDescription || "Click the button below to create a ticket!")
            .setColor(config.embedColor || "BLUE");

        // Create Button
        const button = new ButtonBuilder()
            .setCustomId("create_ticket")
            .setLabel(config.buttonLabel || "Create Ticket")
            .setStyle(config.buttonStyle || ButtonStyle.Primary)
            .setEmoji(config.buttonEmoji || "📩");

        const row = new ActionRowBuilder().addComponents(button);

        // Send Ticket Panel
        await channel.send({ embeds: [embed], components: [row] });
        return interaction.reply({ content: `✅ Ticket panel sent to ${channel}!`, ephemeral: true });
    }
};
