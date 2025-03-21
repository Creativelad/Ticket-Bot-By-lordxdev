const fs = require("fs");
const path = require("path");

module.exports = (client) => {
    const commandFolders = fs.readdirSync(path.join(__dirname, "../commands"));

    for (const folder of commandFolders) {
        const commandFiles = fs.readdirSync(path.join(__dirname, `../commands/${folder}`)).filter(file => file.endsWith(".js"));

        for (const file of commandFiles) {
            const command = require(`../commands/${folder}/${file}`);
            if (command.name) {
                client.commands.set(command.name, command);
                console.log(`✅ Loaded command: ${command.name}`);
            } else {
                console.warn(`⚠️ Skipping ${file} (missing command name)`);
            }
        }
    }
};
