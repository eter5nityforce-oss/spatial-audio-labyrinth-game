export default class Maze {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = []; // 0 = empty, 1 = wall
        this.startPos = { x: 1, y: 1 };
        this.exitPos = { x: width - 2, y: height - 2 };
        this.generate();
    }

    generate() {
        // Initialize full grid with walls
        for (let y = 0; y < this.height; y++) {
            let row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(1);
            }
            this.grid.push(row);
        }

        // Recursive Backtracker
        const directions = [
            { x: 0, y: -2 }, // Up
            { x: 0, y: 2 },  // Down
            { x: -2, y: 0 }, // Left
            { x: 2, y: 0 }   // Right
        ];

        const stack = [];
        const start = { x: 1, y: 1 };
        this.grid[start.y][start.x] = 0;
        stack.push(start);

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = [];

            directions.forEach(dir => {
                const nx = current.x + dir.x;
                const ny = current.y + dir.y;

                if (nx > 0 && nx < this.width - 1 && ny > 0 && ny < this.height - 1) {
                    if (this.grid[ny][nx] === 1) {
                        neighbors.push({ x: nx, y: ny, dx: dir.x, dy: dir.y });
                    }
                }
            });

            if (neighbors.length > 0) {
                const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];

                // Knock down wall between
                this.grid[current.y + chosen.dy / 2][current.x + chosen.dx / 2] = 0;
                this.grid[chosen.y][chosen.x] = 0;

                stack.push({ x: chosen.x, y: chosen.y });
            } else {
                stack.pop();
            }
        }

        // Ensure exit is reachable and open
        this.grid[this.exitPos.y][this.exitPos.x] = 0;
    }

    isWall(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return true;
        return this.grid[Math.floor(y)][Math.floor(x)] === 1;
    }

    // Simple raycast for sonar
    raycast(origin, direction, maxDistance) {
        let dist = 0;
        let step = 0.5; // Precision
        let cx = origin.x;
        let cy = origin.y;

        while (dist < maxDistance) {
            cx += direction.x * step;
            cy += direction.y * step;

            if (this.isWall(cx, cy)) {
                return { hit: true, distance: dist, x: cx, y: cy };
            }
            dist += step;
        }
        return { hit: false, distance: maxDistance };
    }
}
