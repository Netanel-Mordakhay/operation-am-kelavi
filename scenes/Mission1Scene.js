const PLAYER_SIZE = { width: 100, height: 100 };
const BULLET_SIZE = { width: 10, height: 30 };
const TARGET_SIZE = { width: 30, height: 90 };

export default class Mission1Scene extends Phaser.Scene {
  constructor() {
    super("Mission1Scene");
    this.canShoot = true;
    this.missleSpawnTime = 800;
  }

  preload() {
    this.load.image("mission1bg", "assets/sprites/mission1bg.webp");
    this.load.image("plane", "assets/sprites/f35.webp");
    this.load.image("bullet", "assets/sprites/f35missile.webp");
    this.load.image("target", "assets/sprites/missile.webp");
    this.load.image("f4", "assets/sprites/f4.webp");
    this.load.image(
      "desroyed_explosion",
      "assets/sprites/destroyed_explosion.webp"
    );
    this.load.audio("mission1bgm", "assets/sounds/mission1bgm.mp3");
    this.load.audio("explosion", "assets/sounds/explosion1.mp3");
    this.load.audio("f35explosion", "assets/sounds/f35explosion.mp3");
  }

  create() {
    this.mission1bgm = this.sound
      .add("mission1bgm")
      .setVolume(0.5)
      .setLoop(true);
    this.mission1bgm.play();
    this.explosionSound = this.sound
      .add("explosion")
      .setVolume(0.3)
      .setLoop(false);
    this.f35explosionSound = this.sound
      .add("f35explosion")
      .setVolume(0.3)
      .setLoop(false);
    const { width, height } = this.scale;

    // Background
    this.bg1 = this.add
      .tileSprite(width / 2, height / 2, width, height, "mission1bg")
      .setOrigin(0.5);
    this.bg2 = this.add
      .tileSprite(0, -height, width, height, "mission1bg")
      .setOrigin(0.5);

    // Player
    this.player = this.physics.add.sprite(width / 2, height * 0.8, "plane");
    this.player.setDisplaySize(PLAYER_SIZE.width, PLAYER_SIZE.height);
    this.player.setCollideWorldBounds(true);

    this.movementBounds = {
      top: height * 0.6,
      bottom: height,
      left: 0,
      right: width,
    };

    // Bullets
    this.bullets = this.physics.add.group();
    this.input.keyboard.on("keydown-SPACE", this.shoot, this);

    // Targets (missiles)
    this.targets = this.physics.add.group();

    // Spawn missiles continuously
    this.time.addEvent({
      //delay: 800,
      delay: this.missleSpawnTime,
      callback: this.spawnMissile,
      callbackScope: this,
      loop: true,
    });

    // Collisions
    this.physics.add.overlap(
      this.bullets,
      this.targets,
      this.hitTarget,
      null,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.targets,
      this.playerHit,
      null,
      this
    );

    // Score & lives
    this.lives = 3;
    this.score = 0;

    this.scoreText = this.add.text(20, 20, "Targets Hit: 0 / 50", {
      fontSize: "20px",
      fill: "#fff",
    });
    this.livesText = this.add.text(20, 50, "Lives: 3", {
      fontSize: "20px",
      fill: "#fff",
    });

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    // Scrolling background
    this.bg1.tilePositionY -= 0.3;
    this.bg2.tilePositionY -= 0.3;

    // Player movement
    let turning = false;

    if (this.cursors.left.isDown && this.player.x > this.movementBounds.left) {
      this.player.x -= 7;
      this.player.setAngle(Phaser.Math.Linear(this.player.angle, -15, 0.2));
      turning = true;
    } else if (
      this.cursors.right.isDown &&
      this.player.x < this.movementBounds.right
    ) {
      this.player.x += 7;
      this.player.setAngle(Phaser.Math.Linear(this.player.angle, 15, 0.2));
      turning = true;
    }

    // if not turning, return to 0
    if (!turning) {
      this.player.setAngle(Phaser.Math.Linear(this.player.angle, 0, 0.1));
    }

    // Y axis
    if (this.cursors.up.isDown && this.player.y > this.movementBounds.top) {
      this.player.y -= 5;
    } else if (
      this.cursors.down.isDown &&
      this.player.y < this.movementBounds.bottom
    ) {
      this.player.y += 5;
    }

    // Remove missiles that went out of bounds
    this.targets.children.each((target) => {
      if (target.y > this.scale.height + 50) {
        target.destroy();
      }
    });

    // Win condition
    if (this.score >= 50) {
      this.scene.start("MissionCompleteScene");
    }

    // Lose condition
    if (this.lives <= 0) {
      this.scene.start("GameOverScene"); // make sure you have this scene
    }
  }

  shoot() {
    if (!this.canShoot) return;

    const bullet = this.bullets.create(
      this.player.x,
      this.player.y - 20,
      "bullet"
    );
    bullet.setDisplaySize(BULLET_SIZE.width, BULLET_SIZE.height);
    bullet.setVelocityY(-300);
    bullet.setCollideWorldBounds(false);

    this.canShoot = false;
    setTimeout(() => {
      this.canShoot = true;
    }, 1000);
  }

  spawnMissile() {
    const x = Phaser.Math.Between(30, this.scale.width - 30);

    const isF4 = Phaser.Math.Between(0, 10) <= 7; // 70% chance for F4

    const texture = isF4 ? "f4" : "target";
    const height = isF4 ? 60 : TARGET_SIZE.height;
    const width = isF4 ? 60 : TARGET_SIZE.width;
    const speed = isF4 ? 180 : 260;

    const enemy = this.targets.create(x, -50, texture);
    enemy.setDisplaySize(width, height);
    enemy.setVelocityY(speed);

    // X axis movement
    enemy.initialX = x;
    enemy.oscillationSpeed = Phaser.Math.FloatBetween(2, 4);
    enemy.oscillationAmplitude = Phaser.Math.Between(10, 30);
    enemy.oscillationPhase = Math.random() * Math.PI * 2;
  }

  hitTarget(bullet, target) {
    bullet.destroy();
    target.destroy();
    // F4 gives 2 points, other missiles give 1 point
    const scoreToAdd = target.texture.key === "target" ? 2 : 1;
    this.score += scoreToAdd;
    this.scoreText.setText(`Targets Hit: ${this.score} / 50`);
    this.explosionSound.play();

    // explosion sprite
    const explosion = this.add.image(target.x, target.y, "desroyed_explosion");
    explosion.setDepth(10);
    explosion.setAlpha(1);
    explosion.setScale(0.2);

    // Fade out explosion
    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 0,
      duration: 350,
      ease: "Linear",
      onComplete: () => {
        explosion.destroy();
      },
    });
  }

  playerHit(player, target) {
    target.destroy();
    this.lives -= 1;
    this.livesText.setText(`Lives: ${this.lives}`);
    this.f35explosionSound.play();
  }
}
