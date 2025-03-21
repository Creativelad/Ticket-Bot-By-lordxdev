const { SlashCommandBuilder } = require("discord.js");
const TicketConfig = require("../../models/configSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("configureticket")
        .setDescription("Configure ticket system settings")
        .addChannelOption(option =>
            option.setName("category")
                .setDescription("Set the category where tickets will be created")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName("logchannel")
                .setDescription("Set the logging channel for ticket activity")
        )
        .addStringOption(option =>
            option.setName("title")
                .setDescription("Set the title for the ticket panel")
        )
        .addStringOption(option =>
            option.setName("description")
                .setDescription("Set the description for the ticket panel")
        )
        .addStringOption(option =>
            option.setName("color")
                .setDescription("Set the embed color (HEX code)")
        )
        .addStringOption(option =>
            option.setName("label")
                .setDescription("Set the button label")
        )
        .addStringOption(option =>
            option.setName("emoji")
                .setDescription("Set the button emoji")
        ),
        
    async execute(client, interaction) {
        if (!interaction.member.permissions.has("Administrator")) {
            return interaction.reply({ content: "❌ You need Administrator permissions to use this command!", ephemeral: true });
        }

        const guildId = interaction.guild.id;
        const categoryId = interaction.options.getChannel("category").id;
        const logChannelId = interaction.options.getChannel("logchannel")?.id || null;
        const panelTitle = interaction.options.getString("title") || "🎫 Support Tickets";
        const panelDescription = interaction.options.getString("description") || "Click the button below to create a ticket!";
        const embedColor = interaction.options.getString("color") || "BLUE";
        const buttonLabel = interaction.options.getString("label") || "Create Ticket";
        const buttonEmoji = interaction.options.getString("emoji") || "📩";

        await TicketConfig.findOneAndUpdate(
            { guildId },
            { guildId, categoryId, logChannelId, panelTitle, panelDescription, embedColor, buttonLabel, buttonEmoji },
            { upsert: true }
        );

        return interaction.reply({ content: "✅ Ticket system settings updated!", ephemeral: true });
    }
};
