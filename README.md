# 공간 음향 미궁 탐험 (Spatial Audio Labyrinth)

A purely auditory exploration game where you navigate a dark labyrinth using only 3D sound cues. Built with the Web Audio API.

## Features

*   **3D Spatial Audio:** Sounds are positioned in 3D space relative to the player's head.
*   **Procedural Maze:** Every game features a new, randomly generated labyrinth.
*   **Raycast Sonar:** Use your sonar ping to detect walls and geometry echoes.
*   **Procedural Audio Synthesis:** All sounds are generated in real-time using oscillators and filters.
*   **Acoustics:** Simple reverb simulation for environmental depth.

## How to Play

1.  **Wear Headphones.** This is mandatory for the spatial audio to work correctly.
2.  **Controls:**
    *   **W / Up Arrow:** Move Forward
    *   **S / Down Arrow:** Move Backward
    *   **A / Left Arrow:** Rotate Left
    *   **D / Right Arrow:** Rotate Right
    *   **Q / E:** Strafe Left / Right
    *   **Spacebar:** Emit Sonar Ping
3.  **Objective:**
    *   Find the **High-Pitched Humming Artifact**.
    *   Avoid the **Low-Pitched Growling Hazards**.
    *   You have **120 seconds**.
4.  **Navigation Tips:**
    *   If you hear a sound equally in both ears, it is directly in front or behind you.
    *   Use the Sonar Ping to "see" walls. High-pitched echoes mean walls are close.
    *   The artifact's hum gets louder as you get closer.

## Demo / Running Locally

To run this project, you need a local web server because ES modules and AudioContext policies often block `file://` protocols.

### Prerequisites

*   Node.js and npm (optional, but recommended for serving).
*   Or Python.

### Steps

1.  Clone or download this repository.
2.  Open a terminal in the project root directory.

#### Method 1: Using Python (Simplest)

If you have Python installed:

```bash
# Python 3
python3 -m http.server 8000
```

Then open your browser to `http://localhost:8000`.

#### Method 2: Using Node.js (npx)

If you have Node.js installed:

```bash
npx http-server .
```

Then open your browser to the URL shown (usually `http://127.0.0.1:8080`).

#### Method 3: VS Code Live Server

If you use VS Code, install the "Live Server" extension, right-click `index.html`, and select "Open with Live Server".

## Architecture

*   `src/audio/`: Contains the WebAudio engine wrapper and sound synthesis classes.
*   `src/game/`: Contains game logic, maze generation, and player physics.
*   `src/main.js`: Entry point.

## License

MIT
