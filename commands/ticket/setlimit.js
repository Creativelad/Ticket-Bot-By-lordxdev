const { SlashCommandBuilder } = require("discord.js");
const TicketConfig = require("../../models/configSchema");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setlimit")
        .setDescription("Set the maximum number of tickets a user can have open at once")
        .addIntegerOption(option =>
            option.setName("limit")
                .setDescription("Enter the ticket limit per user")
                .setRequired(true)
        ),

    async execute(client, interaction) {
        if (!interaction.member.permissions.has("Administrator")) {
            return interaction.reply({ content: "❌ You need Administrator permissions to use this command!", ephemeral: true });
        }

        const limit = interaction.options.getInteger("limit");

        await TicketConfig.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { maxTicketsPerUser: limit },
            { upsert: true }
        );

        return interaction.reply({ content: `✅ Ticket limit set to **${limit}** per user.`, ephemeral: true });
    }
};
