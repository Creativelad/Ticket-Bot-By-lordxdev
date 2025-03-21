const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addfaq")
        .setDescription("Add an FAQ selection menu in the ticket channel")
        .setDefaultMemberPermissions(0), // Only bot can execute

    async execute(client, interaction) {
        if (!interaction.channel.name.startsWith("ticket-")) {
            return interaction.reply({ content: "❌ This is not a valid ticket channel!", ephemeral: true });
        }

        const faqEmbed = new EmbedBuilder()
            .setTitle("📖 Frequently Asked Questions")
            .setDescription("Select an option below to get an instant answer!")
            .setColor("BLUE");

        const faqMenu = new StringSelectMenuBuilder()
            .setCustomId("faq_select")
            .setPlaceholder("Choose a FAQ topic...")
            .addOptions([
                { label: "Refund Policy", value: "refund", emoji: "💰" },
                { label: "Delivery Time", value: "delivery", emoji: "📦" },
                { label: "Support Hours", value: "support", emoji: "🛠" },
                { label: "Other Queries", value: "custom", emoji: "❓" }
            ]);

        const row = new ActionRowBuilder().addComponents(faqMenu);

        return interaction.channel.send({ embeds: [faqEmbed], components: [row] });
    }
};
