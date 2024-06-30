const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snake')
        .setDescription('Play snake game'),
    async execute(interaction) {
        let snake = [{ x: 5, y: 5 }];
        let apple = { x: 8, y: 8 };
        let score = 0;
        let direction = 'right';

        const renderGame = async () => {
            const boardSize = 10;
            let board = '';

            for (let y = 0; y < boardSize; y++) {
                let row = '';
                for (let x = 0; x < boardSize; x++) {
                    let isSnake = snake.some(segment => segment.x === x && segment.y === y);
                    let isApple = apple.x === x && apple.y === y;

                    if (isSnake) {
                        row += '🟩';
                    } else if (isApple) {
                        row += '🍎';
                    } else {
                        row += '⬛';
                    }
                }
                board += `${row}\n`;
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('Snake Game')
                .setDescription(board)
                .addFields({ name: 'Score', value: `${score}` });

            await interaction.reply({ embeds: [embed] });

            const message = await interaction.fetchReply();
            await message.react('⬅️');
            await message.react('➡️');
            await message.react('⬆️');
            await message.react('⬇️');

            const filter = (reaction, user) => {
                return ['⬅️', '➡️', '⬆️', '⬇️'].includes(reaction.emoji.name) && user.id === interaction.user.id;
            };

            const collector = message.createReactionCollector({ filter, time: 60000 });
            collector.on('collect', async (reaction) => {
                if (reaction.emoji.name === '⬅️' && direction !== 'right') {
                    direction = 'left';
                } else if (reaction.emoji.name === '➡️' && direction !== 'left') {
                    direction = 'right';
                } else if (reaction.emoji.name === '⬆️' && direction !== 'down') {
                    direction = 'up';
                } else if (reaction.emoji.name === '⬇️' && direction !== 'up') {
                    direction = 'down';
                }

                moveSnake();
                await renderGame();
            });

            const moveSnake = () => {
                let newHead = { ...snake[0] };
                switch (direction) {
                    case 'left': newHead.x--; break;
                    case 'right': newHead.x++; break;
                    case 'up': newHead.y--; break;
                    case 'down': newHead.y++; break;
                }

                if (newHead.x < 0) newHead.x = boardSize - 1;
                if (newHead.x >= boardSize) newHead.x = 0;
                if (newHead.y < 0) newHead.y = boardSize - 1;
                if (newHead.y >= boardSize) newHead.y = 0;

                if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
                    console.log('Game over!');
                    return;
                }

                if (newHead.x === apple.x && newHead.y === apple.y) {
                    score++;
                    snake.unshift(newHead);
                    generateApple();
                } else {
                    snake.unshift(newHead);
                    snake.pop();
                }
            };

            const generateApple = () => {
                do {
                    apple.x = Math.floor(Math.random() * boardSize);
                    apple.y = Math.floor(Math.random() * boardSize);
                } while (snake.some(segment => segment.x === apple.x && segment.y === apple.y));
            };
        };

        await renderGame();
    },
};
