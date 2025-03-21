const { Client, Intents } = require("discord.js");
const checkLicense = require("./utils/licenseCheck");
const mongoose = require("mongoose");
const config = require("./config.json");

// ✅ License Verification
checkLicense();

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
});

// ✅ Database Connection
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("🚨 MongoDB Connection Error:", err));

// ✅ Event Handling
client.on("ready", () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// ✅ Command Handling
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === "ping") {
        await interaction.reply("🏓 Pong!");
    }
});

// ✅ Bot Login
client.login(config.token).catch(err => {
    console.error("🚨 Invalid Token! Please check your config.json");
});
