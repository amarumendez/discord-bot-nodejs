const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Replies with help info!'),
    async execute(interaction) {
        await interaction.reply('Available commands: ping, server, user, help, meme, snake');
    },
};
