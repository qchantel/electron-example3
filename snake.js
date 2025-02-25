class Snake {
  constructor() {
    this.reset();
  }

  reset() {
    this.position = [{ x: 10, y: 10 }];
    this.direction = { x: 1, y: 0 };
    this.growth = 0;
  }

  move() {
    const head = { ...this.position[0] };
    head.x += this.direction.x;
    head.y += this.direction.y;
    this.position.unshift(head);

    if (this.growth === 0) {
      this.position.pop();
    } else {
      this.growth--;
    }
  }

  grow() {
    this.growth += 2;
  }

  checkCollision(gridWidth, gridHeight) {
    const head = this.position[0];

    // Wall collision
    if (
      head.x < 0 ||
      head.x >= gridWidth ||
      head.y < 0 ||
      head.y >= gridHeight
    ) {
      return true;
    }

    // Self collision
    for (let i = 1; i < this.position.length; i++) {
      if (head.x === this.position[i].x && head.y === this.position[i].y) {
        return true;
      }
    }

    return false;
  }

  changeDirection(clickX, clickY, cellSize) {
    const head = this.position[0];

    // Convert grid coordinates to canvas coordinates
    const headX = (head.x + 0.5) * cellSize;
    const headY = (head.y + 0.5) * cellSize;

    // Calculate angle between click and head
    const angle = Math.atan2(clickY - headY, clickX - headX);
    const degrees = angle * (180 / Math.PI);

    // Prevent 180-degree turns
    const newDirection = this.getNewDirection(degrees);
    if (!this.isOppositeDirection(newDirection)) {
      this.direction = newDirection;
    }
  }

  getNewDirection(degrees) {
    if (degrees >= -45 && degrees < 45) {
      return { x: 1, y: 0 }; // right
    } else if (degrees >= 45 && degrees < 135) {
      return { x: 0, y: 1 }; // down
    } else if (degrees >= -135 && degrees < -45) {
      return { x: 0, y: -1 }; // up
    } else {
      return { x: -1, y: 0 }; // left
    }
  }

  isOppositeDirection(newDir) {
    return (
      (this.direction.x === 1 && newDir.x === -1) ||
      (this.direction.x === -1 && newDir.x === 1) ||
      (this.direction.y === 1 && newDir.y === -1) ||
      (this.direction.y === -1 && newDir.y === 1)
    );
  }
}

class Food {
  constructor() {
    this.position = this.getRandomPosition(40, 30);
  }

  getRandomPosition(gridWidth, gridHeight) {
    return {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
    };
  }

  checkCollision(snakeHead) {
    return this.position.x === snakeHead.x && this.position.y === snakeHead.y;
  }

  respawn(gridWidth, gridHeight) {
    this.position = this.getRandomPosition(gridWidth, gridHeight);
  }
}

class Game {
  constructor() {
    this.canvas = document.getElementById("gameCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.gridSize = 20;
    this.gridWidth = 40; // Number of cells in width
    this.gridHeight = 30; // Number of cells in height
    this.snake = new Snake();
    this.food = new Food();
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;

    // Set up resize handling
    this.setupCanvas();
    window.addEventListener("resize", () => this.setupCanvas());

    this.setupEventListeners();
    this.gameLoop();
  }

  setupCanvas() {
    // Calculate the maximum size while maintaining aspect ratio
    const maxWidth = window.innerWidth * 0.95;
    const maxHeight = window.innerHeight * 0.9;
    const aspectRatio = this.gridWidth / this.gridHeight;

    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    this.canvas.width = width;
    this.canvas.height = height;
    this.cellSize = Math.floor(width / this.gridWidth);
  }

  setupEventListeners() {
    this.canvas.addEventListener("click", (e) => {
      if (!this.gameOver) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.snake.changeDirection(x, y, this.cellSize);
      }
    });

    document.getElementById("restartButton").addEventListener("click", () => {
      this.restart();
    });
  }

  restart() {
    this.snake.reset();
    this.food.respawn(this.gridWidth, this.gridHeight);
    this.score = 0;
    this.gameOver = false;
    document.getElementById("score").textContent = `Score: ${this.score}`;
    document.getElementById("gameOver").style.display = "none";
  }

  update() {
    if (this.gameOver) return;

    if (this.frameCount % 10 === 0) {
      this.snake.move();

      if (this.snake.checkCollision(this.gridWidth, this.gridHeight)) {
        this.gameOver = true;
        document.getElementById("gameOver").style.display = "block";
        document.getElementById("finalScore").textContent = this.score;
        return;
      }

      if (this.food.checkCollision(this.snake.position[0])) {
        this.snake.grow();
        this.food.respawn(this.gridWidth, this.gridHeight);
        this.score += 10;
        document.getElementById("score").textContent = `Score: ${this.score}`;
      }
    }

    this.frameCount++;
  }

  draw() {
    // Clear and fill background
    this.ctx.fillStyle = "#2a2a2a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw grid lines
    this.ctx.strokeStyle = "#333333";
    this.ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x <= this.gridWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.cellSize, 0);
      this.ctx.lineTo(x * this.cellSize, this.canvas.height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= this.gridHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.cellSize);
      this.ctx.lineTo(this.canvas.width, y * this.cellSize);
      this.ctx.stroke();
    }

    // Draw snake
    this.snake.position.forEach((segment, index) => {
      const gradient = this.ctx.createLinearGradient(
        segment.x * this.cellSize,
        segment.y * this.cellSize,
        (segment.x + 1) * this.cellSize,
        (segment.y + 1) * this.cellSize
      );
      gradient.addColorStop(0, "#00ff00");
      gradient.addColorStop(1, "#008800");

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        segment.x * this.cellSize,
        segment.y * this.cellSize,
        this.cellSize - 1,
        this.cellSize - 1
      );

      // Draw eyes on the head
      if (index === 0) {
        this.ctx.fillStyle = "#ffffff";
        const eyeSize = Math.max(3, this.cellSize * 0.15);
        const eyeOffset = Math.max(5, this.cellSize * 0.25);

        // Left eye
        this.ctx.fillRect(
          segment.x * this.cellSize + eyeOffset,
          segment.y * this.cellSize + eyeOffset,
          eyeSize,
          eyeSize
        );

        // Right eye
        this.ctx.fillRect(
          segment.x * this.cellSize + this.cellSize - eyeOffset - eyeSize,
          segment.y * this.cellSize + eyeOffset,
          eyeSize,
          eyeSize
        );
      }
    });

    // Draw food with glow effect
    this.ctx.fillStyle = "#ff3333";
    this.ctx.shadowColor = "#ff0000";
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.position.x * this.cellSize + this.cellSize / 2,
      this.food.position.y * this.cellSize + this.cellSize / 2,
      this.cellSize / 2 - 1,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    // Reset shadow
    this.ctx.shadowColor = "transparent";
    this.ctx.shadowBlur = 0;
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
}

// Start the game when the window loads
window.onload = () => {
  new Game();
};
