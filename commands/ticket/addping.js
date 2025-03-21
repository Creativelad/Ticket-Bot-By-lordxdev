const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addping")
        .setDescription("Add a 'Tag Staff' button in the ticket channel")
        .setDefaultMemberPermissions(0), // Only bot can execute

    async execute(client, interaction) {
        if (!interaction.channel.name.startsWith("ticket-")) {
            return interaction.reply({ content: "❌ This is not a valid ticket channel!", ephemeral: true });
        }

        const pingEmbed = new EmbedBuilder()
            .setTitle("🚨 Need Staff Assistance?")
            .setDescription("Click the button below to notify staff members.")
            .setColor("YELLOW");

        const pingButton = new ButtonBuilder()
            .setCustomId("ping_staff")
            .setLabel("Tag Staff")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🔔");

        const row = new ActionRowBuilder().addComponents(pingButton);

        return interaction.channel.send({ embeds: [pingEmbed], components: [row] });
    }
};
