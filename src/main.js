import Game from './game/Game.js';

const startBtn = document.getElementById('start-btn');
const overlay = document.getElementById('overlay');
const gameUI = document.getElementById('game-ui');

let game;

startBtn.addEventListener('click', async () => {
    try {
        if (!game) {
            game = new Game();
        }

        await game.start();

        overlay.style.display = 'none';
        gameUI.style.display = 'block';

    } catch (e) {
        console.error("Failed to start game:", e);
        alert("Could not start audio context. Please try again.");
    }
});
