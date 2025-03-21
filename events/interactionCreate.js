const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require("discord.js");
const Ticket = require("../models/ticketSchema");
const TicketConfig = require("../models/configSchema");
const faqResponses = require("../utils/faqResponses");
const { generateTranscript } = require("../utils/generateTranscript");
const config = require("../config.json");
const fs = require("fs");

module.exports = {
    name: "interactionCreate",
    async execute(client, interaction) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(client, interaction);
            } catch (error) {
                console.error(error);
                return interaction.reply({ content: "❌ An error occurred while executing this command!", ephemeral: true });
            }
        }

        // 🎫 **Ticket System**
        if (interaction.isButton()) {
            const configData = await TicketConfig.findOne({ guildId: interaction.guild.id });
            if (!configData) return interaction.reply({ content: "❌ Ticket system is not configured!", ephemeral: true });

            const userTickets = await Ticket.countDocuments({
                userId: interaction.user.id,
                guildId: interaction.guild.id,
                status: "open"
            });

            if (interaction.customId === "create_ticket") {
                if (userTickets >= configData.maxTicketsPerUser) {
                    return interaction.reply({ content: `❌ You can only have **${configData.maxTicketsPerUser}** open tickets!`, ephemeral: true });
                }

                const ticketCategory = configData.categoryId;
                if (!ticketCategory) {
                    return interaction.reply({ content: "❌ No ticket category is set!", ephemeral: true });
                }

                const ticketChannel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}-${userTickets + 1}`,
                    parent: ticketCategory,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel]
                        },
                        {
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                        }
                    ]
                });

                await Ticket.create({
                    userId: interaction.user.id,
                    guildId: interaction.guild.id,
                    ticketId: ticketChannel.id,
                    channelId: ticketChannel.id,
                    status: "open"
                });

                const embed = new EmbedBuilder()
                    .setTitle("🎫 Ticket Created")
                    .setDescription("A staff member will be with you shortly.")
                    .setColor("GREEN");

                const closeButton = new ButtonBuilder()
                    .setCustomId("close_ticket")
                    .setLabel("Close")
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji("🔒");

                const pingButton = new ButtonBuilder()
                    .setCustomId("ping_staff")
                    .setLabel("Tag Staff")
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("🔔");

                const row = new ActionRowBuilder().addComponents(closeButton, pingButton);

                await ticketChannel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });
                interaction.reply({ content: `✅ Your ticket has been created: ${ticketChannel}`, ephemeral: true });
            }

            if (interaction.customId === "close_ticket") {
                const ticket = await Ticket.findOne({ channelId: interaction.channel.id, status: "open" });
                if (!ticket) return interaction.reply({ content: "❌ This is not an open ticket!", ephemeral: true });

                const transcriptPath = await generateTranscript(interaction.channel);
                const attachment = { files: [transcriptPath] };

                await interaction.reply({ content: "✅ Ticket closed and transcript generated.", ...attachment });

                setTimeout(() => {
                    interaction.channel.delete();
                    fs.unlinkSync(transcriptPath);
                }, 5000);

                await Ticket.updateOne({ channelId: interaction.channel.id }, { status: "closed" });
            }

            // 🚨 **Tag Staff System**
            if (interaction.customId === "ping_staff") {
                if (!config.staffRoleId) {
                    return interaction.reply({ content: "❌ Staff role is not configured!", ephemeral: true });
                }

                const staffPing = `<@&${config.staffRoleId}>`;
                const embed = new EmbedBuilder()
                    .setTitle("🚨 Staff Assistance Requested")
                    .setDescription(`${interaction.user} has requested staff support!`)
                    .setColor("RED");

                await interaction.channel.send({ content: staffPing, embeds: [embed] });
                return interaction.reply({ content: "✅ Staff has been notified!", ephemeral: true });
            }
        }

        // 📜 **Admin Ticket Commands**
        if (interaction.isCommand() && interaction.commandName === "ticketadmin") {
            const subcommand = interaction.options.getSubcommand();
            const ticketChannel = interaction.channel;

            if (!ticketChannel.name.startsWith("ticket-")) {
                return interaction.reply({ content: "❌ This is not a valid ticket channel!", ephemeral: true });
            }

            if (subcommand === "forceclose") {
                const transcriptPath = await generateTranscript(ticketChannel);
                const attachment = { files: [transcriptPath] };

                await interaction.reply({ content: "✅ Ticket forcefully closed by admin.", ...attachment });

                setTimeout(() => {
                    ticketChannel.delete();
                    fs.unlinkSync(transcriptPath);
                }, 5000);
            }

            if (subcommand === "transcript") {
                const transcriptPath = await generateTranscript(ticketChannel);
                const attachment = { files: [transcriptPath] };

                await interaction.reply({ content: "📜 Here is the ticket transcript.", ...attachment, ephemeral: true });
            }
        }

        // 📖 **FAQ System**
        if (interaction.isStringSelectMenu() && interaction.customId === "faq_select") {
            const selected = interaction.values[0];
            if (!faqResponses[selected]) {
                return interaction.reply({ content: "❌ Invalid selection!", ephemeral: true });
            }

            return interaction.reply({ content: faqResponses[selected], ephemeral: true });
        }
    }
};
