const { Client, GatewayIntentBits, REST, Routes, Collection, EmbedBuilder } = require('discord.js');

const startServer = require('./server');
const fs = require('fs');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

async function registerCommands() {
  try {
    console.log('Started refreshing application (/) commands.');

    const commands = commandFiles.map(file => require(`./commands/${file}`).data);

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

client.once('ready', () => {
  console.log('Ready!');
});

client.on('guildMemberAdd', async member => {
  const channel = member.guild.systemChannel;

  if (channel) {
    const welcomeEmbed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle(`Welcome to **${member.guild.name}**!`)
      .setDescription(`Welcome **${member.user.username}** to **${member.guild.name}**!`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({ text: 'Play Video Games, Coding Sessions, Stream, Mess with bot, much more coming soon!' });

    channel.send({ embeds: [welcomeEmbed] });
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
  }
});

(async () => {
  await registerCommands();
  await client.login(process.env.TOKEN);
  startServer();
})();
