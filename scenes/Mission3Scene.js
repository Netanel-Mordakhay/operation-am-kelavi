import { TextStyles } from "../config.js";
import { MISSION_4_BRIEFING, COMMANDER_TITLE } from "../constants.js";
import { showEndScreen } from "../src/libs/showEndScreen.js";
import { createPilotVideo } from "../src/libs/pilotVideo.js";
import {
  shootBullet,
  handlePlayerHit,
  handlePlayerMovement,
} from "../src/libs/playerUtils.js";

// Constants for sizes
const PLAYER_SIZE = { width: 100, height: 100 };
const TARGET_SIZE = { width: 30, height: 90 };

export default class Mission3Scene extends Phaser.Scene {
  constructor() {
    super("Mission3Scene");
    // Control shooting rate and missile spawn timing
    this.canShoot = true;
    this.missleSpawnTime = 1000;
    // Timer variables
    this.timeLeft = 120; // seconds
    this.timerEvent = null;
    this.timerText = null;
  }

  preload() {
    // Load all assets: images and sounds
    this.load.image("mission3bg", "assets/sprites/mission3bg.webp");
    this.load.image("plane", "assets/sprites/f35.webp");
    this.load.image("bullet", "assets/sprites/f35missile.webp");
    this.load.image("target", "assets/sprites/missile.webp");
    this.load.image("f4", "assets/sprites/f4.webp");
    this.load.image("enemyTruck", "assets/sprites/enemyTruck.webp");
    this.load.image(
      "desroyed_explosion",
      "assets/sprites/destroyed_explosion.webp"
    );

    this.load.audio("mission3bgm", "assets/sounds/mission3_bgm.mp3");
    this.load.audio("explosion", "assets/sounds/effects/explosion1.mp3");
    this.load.audio("f35explosion", "assets/sounds/effects/f35explosion.mp3");
    this.load.video("pilot_video", "assets/video/pilot.mp4");
  }

  create() {
    // Add and configure background music and sound effects
    this.mission3bgm = this.sound
      .add("mission3bgm")
      .setVolume(0.5)
      .setLoop(true);
    this.mission3bgm.play();
    this.explosionSound = this.sound
      .add("explosion")
      .setVolume(0.3)
      .setLoop(false);
    this.f35explosionSound = this.sound
      .add("f35explosion")
      .setVolume(0.3)
      .setLoop(false);

    const { width, height } = this.scale;

    // Create scrolling background
    this.bg1 = this.add
      .tileSprite(width / 2, height / 2, width, height, "mission3bg")
      .setOrigin(0.5);
    this.bg2 = this.add
      .tileSprite(0, -height, width, height, "mission3bg")
      .setOrigin(0.5);

    // Create pilot video
    this.pilotVideo = createPilotVideo(this);

    // Create player sprite and set its properties
    this.player = this.physics.add.sprite(width / 2, height * 0.8, "plane");
    this.player.setDisplaySize(PLAYER_SIZE.width, PLAYER_SIZE.height);
    this.player.setCollideWorldBounds(true);

    // Define movement boundaries for the player
    this.movementBounds = {
      top: height * 0.6,
      bottom: height,
      left: 0,
      right: width,
    };

    // Create group for bullets
    this.bullets = this.physics.add.group();
    // Listen for spacebar to shoot
    this.input.keyboard.on("keydown-SPACE", () => {
      shootBullet(this, this.player, this.bullets);
    });

    // Create group for enemy targets (missiles and F4s)
    this.targets = this.physics.add.group();

    // Spawn missiles at regular intervals
    this.time.addEvent({
      delay: this.missleSpawnTime,
      callback: this.spawnMissile,
      callbackScope: this,
      loop: true,
    });

    // Handle bullet-target collisions
    this.physics.add.overlap(
      this.bullets,
      this.targets,
      this.hitTarget,
      null,
      this
    );

    // Handle player-target collisions (player hit by missile/F4)
    this.physics.add.overlap(
      this.player,
      this.targets,
      (player, target) => handlePlayerHit(this, player, target),
      null,
      this
    );

    // Initialize lives and score
    this.lives = 3;
    this.score = 0;

    // Display score and lives on screen
    this.scoreText = this.add.text(
      170,
      20,
      "Targets Hit: 0 / 50",
      TextStyles.defaultText()
    );
    this.livesText = this.add.text(
      170,
      50,
      "Lives: 3",
      TextStyles.defaultText()
    );

    // Initialize and display timer
    this.timerText = this.add.text(
      170,
      80,
      `Time Left: ${this.timeLeft}s`,
      TextStyles.defaultText()
    );

    // Start countdown timer event
    this.timerEvent = this.time.addEvent({
      delay: 1000, // 1 second
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Set up keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    // Scroll the background to create movement effect
    this.bg1.tilePositionY -= 2;
    this.bg2.tilePositionY -= 2;

    // Handle player movement (delegated to utility)
    handlePlayerMovement(
      this,
      this.cursors,
      this.player,
      this.movementBounds,
      delta
    );

    // Remove targets that have moved off the bottom of the screen
    this.targets.children.each((target) => {
      if (target.y > this.scale.height + 50) {
        if (target.texture.key === "enemyTruck") {
          this.lives--;
          this.livesText.setText("Lives: " + this.lives);
        }
        target.destroy();
      }
    });

    // End mission if enough targets are hit
    if (this.score >= 1 && !this.gameEnded) {
      this.mission3bgm.stop();
      this.gameEnded = true;
      showEndScreen(
        this,
        true,
        () => {
          this.scene.start("BriefingScene", {
            missionTitle: "Mission 4",
            briefText: MISSION_4_BRIEFING,
            audioKey: "mission4_brief",
            nextScene: "Mission4Scene",
            commanderTitle: COMMANDER_TITLE,
          });
        },
        "Mission3Scene"
      );
    }

    // End mission if player runs out of lives
    if (this.lives <= 0 && !this.gameEnded) {
      this.mission3bgm.stop();
      this.gameEnded = true;
      showEndScreen(
        this,
        false,
        () => {
          this.scene.start("BriefingScene", {
            missionTitle: "Mission 4",
            briefText: MISSION_4_BRIEFING,
            audioKey: "mission4_brief",
            nextScene: "Mission4Scene",
            commanderTitle: COMMANDER_TITLE,
          });
        },
        "Mission3Scene"
      );
    }

    // If timer runs out and game hasn't ended, trigger loss
    if (this.timeLeft <= 0 && !this.gameEnded) {
      this.mission3bgm.stop();
      this.gameEnded = true;
      showEndScreen(
        this,
        false,
        () => {
          this.scene.start("BriefingScene", {
            missionTitle: "Mission 4",
            briefText: MISSION_4_BRIEFING,
            audioKey: "mission4_brief",
            nextScene: "Mission4Scene",
            commanderTitle: COMMANDER_TITLE,
          });
        },
        "Mission3Scene"
      );
    }
  }

  // Spawns a missile, F4, or enemyTruck at a random x position at the top
  spawnMissile() {
    const x = Phaser.Math.Between(30, this.scale.width - 30);
    const rand = Phaser.Math.Between(0, 10);
    let texture, height, width, speed;

    if (rand <= 4) {
      // Most common: missile
      texture = "target";
      height = TARGET_SIZE.height;
      width = TARGET_SIZE.width;
      speed = 200;
    } else if (rand <= 8) {
      // Less common: F4 plane
      texture = "f4";
      height = 60;
      width = 60;
      speed = 160;
    } else {
      // Least common: enemyTruck
      texture = "enemyTruck";
      height = 100;
      width = 60;
      speed = 100;
    }

    const enemy = this.targets.create(x, -50, texture);
    enemy.setDisplaySize(width, height);
    enemy.setVelocityY(speed);
    enemy.initialX = x;
    enemy.oscillationSpeed = Phaser.Math.FloatBetween(2, 4);
    enemy.oscillationAmplitude = Phaser.Math.Between(10, 30);
    enemy.oscillationPhase = Math.random() * Math.PI * 2;
  }

  // Handles when a bullet hits a target
  hitTarget(bullet, target) {
    bullet.destroy();
    target.destroy();

    // Only add score if the target is an enemyTruck
    if (target.texture.key === "enemyTruck") {
      this.score += 1;
      this.scoreText.setText(`Targets Hit: ${this.score} / 10`);
    }
    this.explosionSound.play();

    // Show explosion animation at the target's position
    const explosion = this.add.image(target.x, target.y, "desroyed_explosion");
    explosion.setDepth(10).setAlpha(1).setScale(0.2);

    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: 0,
      duration: 350,
      ease: "Linear",
      onComplete: () => explosion.destroy(),
    });
  }

  // Timer update callback
  updateTimer() {
    if (this.timeLeft > 0) {
      this.timeLeft--;
      this.timerText.setText(`Time Left: ${this.timeLeft}s`);
    }
  }
}
