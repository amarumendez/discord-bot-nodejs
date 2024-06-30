const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('snake')
        .setDescription('Play snake game'),
    async execute(interaction) {
        // Initialize game variables
        let snake = [{ x: 5, y: 5 }]; // Initial snake position
        let apple = { x: 8, y: 8 }; // Initial apple position
        let score = 0;
        let direction = 'right'; // Initial direction

        // Function to render game state
        const renderGame = async () => {
            const boardSize = 10; // Size of the game board (10x10 in this example)

            // Create the game board using emojis
            let board = '';
            for (let y = 0; y < boardSize; y++) {
                let row = '';
                for (let x = 0; x < boardSize; x++) {
                    // Check if current position is snake or apple
                    let isSnake = false;
                    let isApple = false;
                    for (let segment of snake) {
                        if (segment.x === x && segment.y === y) {
                            isSnake = true;
                            break;
                        }
                    }
                    if (apple.x === x && apple.y === y) {
                        isApple = true;
                    }

                    // Determine emoji for current tile
                    if (isSnake) {
                        row += ':green_square:';
                    } else if (isApple) {
                        row += ':red_circle:';
                    } else {
                        row += ':black_large_square:';
                    }
                }
                board += `${row}\n`;
            }

            // Create and send embed message with game board
            const embed = new MessageEmbed()
                .setColor('#00ff00')
                .setTitle('Snake Game')
                .setDescription(board)
                .addField('Score', score);

            await interaction.reply({ embeds: [embed] });

            // Add reactions for controls
            const message = await interaction.fetchReply();
            await message.react('⬅️'); // Left
            await message.react('➡️'); // Right
            await message.react('⬆️'); // Up
            await message.react('⬇️'); // Down

            // Handle reactions to control the snake's movement
            const filter = (reaction, user) => {
                return ['⬅️', '➡️', '⬆️', '⬇️'].includes(reaction.emoji.name) && user.id === interaction.user.id;
            };

            const collector = message.createReactionCollector({ filter, time: 60000 }); // Collector for 1 minute
            collector.on('collect', async (reaction, user) => {
                // Update direction based on reaction
                if (reaction.emoji.name === '⬅️' && direction !== 'right') {
                    direction = 'left';
                } else if (reaction.emoji.name === '➡️' && direction !== 'left') {
                    direction = 'right';
                } else if (reaction.emoji.name === '⬆️' && direction !== 'down') {
                    direction = 'up';
                } else if (reaction.emoji.name === '⬇️' && direction !== 'up') {
                    direction = 'down';
                }

                // Move the snake
                moveSnake();

                // Render updated game state
                await renderGame();
            });

            // Function to move the snake
            const moveSnake = () => {
                // Create a new head based on current direction
                let newHead = { ...snake[0] };
                switch (direction) {
                    case 'left':
                        newHead.x--;
                        break;
                    case 'right':
                        newHead.x++;
                        break;
                    case 'up':
                        newHead.y--;
                        break;
                    case 'down':
                        newHead.y++;
                        break;
                }

                // Check for collisions with boundaries (wrap around in this example)
                if (newHead.x < 0) newHead.x = boardSize - 1;
                if (newHead.x >= boardSize) newHead.x = 0;
                if (newHead.y < 0) newHead.y = boardSize - 1;
                if (newHead.y >= boardSize) newHead.y = 0;

                // Check if snake collides with itself
                for (let i = 1; i < snake.length; i++) {
                    if (snake[i].x === newHead.x && snake[i].y === newHead.y) {
                        // Game over condition
                        console.log('Game over!');
                        // Optionally, reset game state here
                        return;
                    }
                }

                // Check if snake eats the apple
                if (newHead.x === apple.x && newHead.y === apple.y) {
                    // Increase score and grow snake
                    score++;
                    snake.unshift(newHead); // Add new head
                    generateApple(); // Generate new apple
                } else {
                    // Move snake by adding new head and removing tail
                    snake.unshift(newHead);
                    snake.pop();
                }
            };

            // Function to generate new apple
            const generateApple = () => {
                // Generate random position for apple (avoiding snake's current positions)
                do {
                    apple.x = Math.floor(Math.random() * boardSize);
                    apple.y = Math.floor(Math.random() * boardSize);
                } while (snake.some(segment => segment.x === apple.x && segment.y === apple.y));
            };
        };

        // Render initial game state
        await renderGame();
    },
};
