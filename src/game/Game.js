import AudioEngine from '../audio/AudioEngine.js';
import Maze from './Maze.js';
import Player from './Player.js';
import Synth from '../audio/Synth.js';

export default class Game {
    constructor() {
        this.audioEngine = new AudioEngine();
        this.maze = new Maze(15, 15); // Odd numbers for maze generation
        this.player = new Player(this.maze);
        this.lastTime = 0;
        this.input = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            strafeLeft: false,
            strafeRight: false,
            ping: false
        };

        this.soundSources = []; // All environmental sounds
        this.hazards = []; // Specific reference for collision logic
        this.isRunning = false;

        // Game State
        this.status = 'playing'; // playing, won, lost
        this.timeLeft = 120; // Seconds
    }

    async start() {
        await this.audioEngine.init();
        await this.audioEngine.resume();

        // Reset state if restarting
        this.status = 'playing';
        this.timeLeft = 120;

        // Clear old sources
        this.soundSources.forEach(s => s.stop());
        this.soundSources = [];
        this.hazards = [];

        this.setupInput();
        this.setupWorldSounds();

        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop.bind(this));
    }

    setupInput() {
        // Remove previous listeners to avoid duplicates if this is called multiple times?
        // Actually, better to just check if listeners are added, or just add them once in constructor.
        // For now, I'll just check if I've already added them or just rely on overwrite.
        // Ideally, move event listeners to constructor or a separate initInput method called once.
        if (this.hasInputListeners) return;

        window.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'KeyW': case 'ArrowUp': this.input.forward = true; break;
                case 'KeyS': case 'ArrowDown': this.input.backward = true; break;
                case 'KeyA': case 'ArrowLeft': this.input.left = true; break;
                case 'KeyD': case 'ArrowRight': this.input.right = true; break;
                case 'KeyQ': this.input.strafeLeft = true; break;
                case 'KeyE': this.input.strafeRight = true; break;
                case 'Space': this.triggerSonar(); break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch(e.code) {
                case 'KeyW': case 'ArrowUp': this.input.forward = false; break;
                case 'KeyS': case 'ArrowDown': this.input.backward = false; break;
                case 'KeyA': case 'ArrowLeft': this.input.left = false; break;
                case 'KeyD': case 'ArrowRight': this.input.right = false; break;
                case 'KeyQ': this.input.strafeLeft = false; break;
                case 'KeyE': this.input.strafeRight = false; break;
            }
        });
        this.hasInputListeners = true;
    }

    setupWorldSounds() {
        // Goal (Artifact)
        const exitPos = this.maze.exitPos;
        this.goalSound = new Synth(this.audioEngine, {
            x: exitPos.x + 0.5,
            y: exitPos.y + 0.5,
            z: 0,
            freq: 660, // High pitch hum
            type: 'triangle',
            loop: true
        });
        this.goalSound.startDrone();
        this.soundSources.push(this.goalSound);

        // Hazards
        // Place 3 random hazards
        for(let i=0; i<3; i++) {
            let hx, hy;
            do {
                hx = Math.floor(Math.random() * this.maze.width);
                hy = Math.floor(Math.random() * this.maze.height);
            } while (
                this.maze.isWall(hx, hy) ||
                (Math.abs(hx - this.player.x) < 3 && Math.abs(hy - this.player.y) < 3) ||
                (hx === exitPos.x && hy === exitPos.y)
            );

            const hazard = new Synth(this.audioEngine, {
                x: hx + 0.5,
                y: hy + 0.5,
                z: 0,
                freq: 55, // Low pitch growl
                type: 'sawtooth',
                loop: true
            });

            hazard.startDrone();
            this.soundSources.push(hazard);

            // Store collision data
            this.hazards.push({
                x: hx + 0.5,
                y: hy + 0.5,
                radius: 0.6
            });
        }
    }

    triggerSonar() {
        if (this.status !== 'playing') return;

        // Cast rays in 8 directions
        const directions = [
            { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: 0.7, y: 0.7 }, { x: 0.7, y: -0.7 }, { x: -0.7, y: 0.7 }, { x: -0.7, y: -0.7 }
        ];

        let hasHit = false;

        directions.forEach(dir => {
            const hit = this.maze.raycast(
                { x: this.player.x, y: this.player.y },
                dir,
                8 // Max distance reduced slightly
            );

            if (hit.hit) {
                // Create a temporary "ping" sound at the hit location
                // Pitch depends on distance? Closer = Higher pitch?
                const ping = new Synth(this.audioEngine, {
                    x: hit.x,
                    y: hit.y,
                    z: 0
                });
                ping.playPing();
                hasHit = true;
            }
        });

        // Player feedback sound
        const localPing = new Synth(this.audioEngine, {
            x: this.player.x,
            y: this.player.y,
            z: 0
        });
        localPing.playPing();
    }

    loop(timestamp) {
        if (!this.isRunning) return;
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        if (this.status === 'playing') {
            this.update(dt);
        }

        // Debug UI
        const statusEl = document.getElementById('status');
        const debugEl = document.getElementById('debug-info');
        if (statusEl) {
            statusEl.innerText = `Status: ${this.status.toUpperCase()} | Time: ${Math.ceil(this.timeLeft)}`;
        }
        if (debugEl) {
            debugEl.innerText = `Pos: ${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)}`;
        }

        requestAnimationFrame(this.loop.bind(this));
    }

    update(dt) {
        this.player.update(dt, this.input);

        // Update Audio Listener
        this.audioEngine.updateListener(
            this.player.getPosition(),
            this.player.forward,
            this.player.up
        );

        // Check Win Condition
        const distToExit = Math.hypot(this.player.x - this.maze.exitPos.x - 0.5, this.player.y - this.maze.exitPos.y - 0.5);
        if (distToExit < 0.8) {
            this.status = 'won';
            this.endGame(true);
            return;
        }

        // Check Lose Conditions (Time)
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
            this.status = 'lost';
            this.endGame(false);
            return;
        }

        // Check Hazards
        for (const h of this.hazards) {
            const dist = Math.hypot(this.player.x - h.x, this.player.y - h.y);
            if (dist < h.radius) {
                this.status = 'lost';
                this.endGame(false);
                return;
            }
        }
    }

    endGame(won) {
        this.isRunning = false;
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.innerText = won ? "VICTORY! You found the artifact." : "GAME OVER. You were lost in the darkness.";
            // Add a restart hint or button logic here if needed
        }

        this.soundSources.forEach(s => s.stop());

        // Play win/lose sound
        const resultSound = new Synth(this.audioEngine, {
            x: this.player.x,
            y: this.player.y,
            z: 0
        });

        if (won) {
            // Victory Fanfare (Simple Arpeggio)
           // Implementation left simple for now
           resultSound.playPing(); // Just a ping for now
        } else {
           // Lose Sound
           resultSound.playPing();
        }
    }
}
