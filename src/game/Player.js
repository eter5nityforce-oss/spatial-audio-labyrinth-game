export default class Player {
    constructor(maze) {
        this.maze = maze;
        this.x = maze.startPos.x + 0.5; // Center of cell
        this.y = maze.startPos.y + 0.5;
        this.angle = 0; // Radians, 0 is pointing East (Positive X)
        this.moveSpeed = 3.0;
        this.turnSpeed = 2.0;

        // Vectors for AudioListener
        this.forward = { x: 1, y: 0, z: 0 };
        this.up = { x: 0, y: 0, z: 1 };
    }

    update(dt, input) {
        // Rotation
        if (input.left) this.angle -= this.turnSpeed * dt;
        if (input.right) this.angle += this.turnSpeed * dt;

        // Calculate Forward Vector
        this.forward.x = Math.cos(this.angle);
        this.forward.y = Math.sin(this.angle);

        // Movement
        let dx = 0;
        let dy = 0;

        if (input.forward) {
            dx += this.forward.x * this.moveSpeed * dt;
            dy += this.forward.y * this.moveSpeed * dt;
        }
        if (input.backward) {
            dx -= this.forward.x * this.moveSpeed * dt;
            dy -= this.forward.y * this.moveSpeed * dt;
        }

        // Strafe
        const rightX = Math.cos(this.angle + Math.PI / 2);
        const rightY = Math.sin(this.angle + Math.PI / 2);

        if (input.strafeLeft) {
            dx -= rightX * this.moveSpeed * dt;
            dy -= rightY * this.moveSpeed * dt;
        }
        if (input.strafeRight) {
            dx += rightX * this.moveSpeed * dt;
            dy += rightY * this.moveSpeed * dt;
        }

        // Collision Check (Simple circle/point collision against grid)
        const nextX = this.x + dx;
        const nextY = this.y + dy;
        const radius = 0.3;

        // Check X axis movement
        if (!this.maze.isWall(nextX + (dx > 0 ? radius : -radius), this.y)) {
            this.x = nextX;
        }
        // Check Y axis movement
        if (!this.maze.isWall(this.x, nextY + (dy > 0 ? radius : -radius))) {
            this.y = nextY;
        }
    }

    getPosition() {
        return { x: this.x, y: this.y, z: 0 };
    }
}
