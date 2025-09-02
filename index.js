require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { AuthedUsers, Key, ApprovedUsers, Panels, Servers, WebUsers, UserDiscordLinks } = require('./models/index');
const express = require('express');
const createRouter = require('./server');
const cors = require('cors');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction
    ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const app = express();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    (async () => {
        try {
            await AuthedUsers.sync();
            await Key.sync();
            await ApprovedUsers.sync();
            await Panels.sync();
            await Servers.sync();
            await WebUsers.sync();
            await UserDiscordLinks.sync();
            console.log('Database models synced');
        } catch (error) {
            console.error('Failed to sync database models:', error);
        }
    })();
});

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

app.use(express.json());

const corsOptions = {
    origin: process.env.CORS_ORIGIN || ['https://test.estopia.net', 'https://restore.estopia.net'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));

const router = createRouter();
app.use('/', router);
app.use('/api', router);

client.login(process.env.DISCORD_TOKEN)
    .catch(error => {
        console.error('Failed to login to Discord:', error);
    });

const port = process.env.PORT || 2999;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
