const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    categoryId: { type: String, required: true },
    logChannelId: { type: String }, // Logging channel added
    panelTitle: { type: String, default: "🎫 Support Tickets" },
    panelDescription: { type: String, default: "Click the button below to create a ticket!" },
    embedColor: { type: String, default: "BLUE" },
    buttonLabel: { type: String, default: "Create Ticket" },
    buttonStyle: { type: Number, default: 1 }, // 1 = Primary, 2 = Secondary, 3 = Success, 4 = Danger
    buttonEmoji: { type: String, default: "📩" }
});

module.exports = mongoose.model("TicketConfig", configSchema);
