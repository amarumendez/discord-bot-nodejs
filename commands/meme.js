import { SlashCommandBuilder } from '@discordjs/builders';
import fetch from 'node-fetch';

export const data = new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Replies with a random meme or multiple memes!')
    .addIntegerOption(option =>
        option.setName('count')
            .setDescription('Number of memes to fetch (1-5)')
            .setRequired(false)
            .addChoices(
                { name: '1', value: 1 },
                { name: '2', value: 2 },
                { name: '3', value: 3 },
                { name: '4', value: 4 },
                { name: '5', value: 5 },
            ));

export async function execute(interaction) {
    const count = interaction.options.getInteger('count') || 1;

    if (count < 1 || count > 5) {
        await interaction.reply('Please provide a valid count between 1 and 5.');
        return;
    }

    try {
        const res = await fetch(`https://meme-api.com/gimme/${count}`);
        const memeData = await res.json();

        if (!memeData || !memeData.memes || memeData.memes.length === 0) {
            await interaction.reply('No memes found.');
            return;
        }

        const memeUrls = memeData.memes.map(meme => meme.url);
        await interaction.reply(memeUrls.join('\n'));
    } catch (error) {
        console.error('Error fetching memes:', error);
        await interaction.reply('Failed to fetch memes. Please try again later.');
    }
}
