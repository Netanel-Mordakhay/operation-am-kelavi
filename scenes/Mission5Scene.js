import { TextStyles } from "../config.js";
import { MISSION_SUCCESS_BRIEFING, COMMANDER_TITLE } from "../constants.js";
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
const BOSS_SIZE = { width: 150, height: 300 };

export default class Mission5Scene extends Phaser.Scene {
  constructor() {
    super("Mission5Scene");
    // Control shooting rate and missile spawn timing
    this.canShoot = true;
    this.missleSpawnTime = 1000;
    // Boss lives
    this.bossLives = 1;
    // Boss missile cooldown
    this.bossMissileCooldown = 0;
    // Timer variables (not used in this mission)
    this.timeLeft = 90;
    this.timerEvent = null;
    this.timerText = null;
    this.bossDefeated = false;
  }

  preload() {
    // Load all assets: images and sounds
    this.load.image("mission5bg", "assets/sprites/mission5bg.webp");
    this.load.image("plane", "assets/sprites/f35.webp");
    this.load.image("bullet", "assets/sprites/f35missile.webp");
    this.load.image("target", "assets/sprites/missile.webp");
    this.load.image("f4", "assets/sprites/f4.webp");
    this.load.image("boss", "assets/sprites/boss.webp");
    this.load.image("boss_missile", "assets/sprites/bossmissile.webp");
    this.load.image(
      "desroyed_explosion",
      "assets/sprites/destroyed_explosion.webp"
    );
    this.load.audio("mission5bgm", "assets/sounds/mission5_bgm.mp3");
    this.load.audio("explosion", "assets/sounds/effects/explosion1.mp3");
    this.load.audio("f35explosion", "assets/sounds/effects/f35explosion.mp3");
    this.load.video("pilot_video", "assets/video/pilot.mp4");
  }

  create() {
    // Add and configure background music and sound effects
    this.mission5bgm = this.sound
      .add("mission5bgm")
      .setVolume(0.5)
      .setLoop(true);
    this.mission5bgm.play();
    this.explosionSound = this.sound
      .add("explosion")
      .setVolume(0.3)
      .setLoop(false);
    this.f35explosionSound = this.sound
      .add("f35explosion")
      .setVolume(0.3)
      .setLoop(false);

    const { width, height } = this.scale;

    // Get the original size of the background image
    const bgTexture = this.textures.get("mission5bg").getSourceImage();
    const bgOriginalWidth = bgTexture.width;
    const bgOriginalHeight = bgTexture.height;
    // Calculate scale to cover the screen (cover strategy)
    const scaleX = width / bgOriginalWidth;
    const scaleY = height / bgOriginalHeight;
    const scale = Math.max(scaleX, scaleY);

    // Create scrolling background, scaled to cover the screen
    this.bg1 = this.add
      .tileSprite(
        width / 2,
        height / 2,
        bgOriginalWidth,
        bgOriginalHeight,
        "mission5bg"
      )
      .setOrigin(0.5)
      .setScale(scale);

    this.bg2 = this.add
      .tileSprite(
        width / 2,
        this.bg1.y - this.bg1.displayHeight,
        bgOriginalWidth,
        bgOriginalHeight,
        "mission5bg"
      )
      .setOrigin(0.5)
      .setScale(scale);

    // Create pilot video overlay
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

    // Spawn boss immediately at a random y in the top 20% of the screen
    this.bossSpawned = false;
    this.spawnBoss();
    // Set initial boss target x for smooth movement
    if (this.boss) {
      this.bossTargetX = this.boss.x;
    }

    // Spawn missiles at regular intervals (missiles and F4 only)
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

    // Handle player-target collisions (player hit by missile/F4/boss)
    this.physics.add.overlap(
      this.player,
      this.targets,
      (player, target) => {
        if (target.texture.key === "boss") {
          this.lives = 0;
          this.livesText.setText("Lives: " + this.lives);
        }
        handlePlayerHit(this, player, target);
      },
      null,
      this
    );

    // Initialize lives
    this.lives = 3;

    // Display boss lives on screen
    this.scoreText = this.add.text(
      170,
      20,
      `Boss lives: ${this.bossLives}`,
      TextStyles.defaultText()
    );
    // Display player lives on screen
    this.livesText = this.add.text(
      170,
      50,
      "Lives: 3",
      TextStyles.defaultText()
    );

    // Set up keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create group for boss missiles
    this.bossMissiles = this.physics.add.group();

    // Add collision between boss missiles and player
    this.physics.add.overlap(
      this.player,
      this.bossMissiles,
      (player, missile) => {
        missile.destroy();
        handlePlayerHit(this, player, missile);
      },
      null,
      this
    );
  }

  update(time, delta) {
    // Scroll the backgrounds
    this.bg1.tilePositionY -= 2;
    this.bg2.tilePositionY -= 2;

    // Calculate the scaled height of the background
    const scaledBgHeight = this.bg1.displayHeight;

    // If bg1 moves off the bottom, move it above bg2
    if (this.bg1.y - scaledBgHeight / 2 > this.scale.height) {
      this.bg1.y = this.bg2.y - scaledBgHeight;
    }

    // If bg2 moves off the bottom, move it above bg1
    if (this.bg2.y - scaledBgHeight / 2 > this.scale.height) {
      this.bg2.y = this.bg1.y - scaledBgHeight;
    }

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
      if (target.y > this.scale.height + 50 && target.texture.key !== "boss") {
        target.destroy();
      }
    });

    // Move boss smoothly on the x axis toward a target x
    if (this.boss) {
      // If close to target x, pick a new random target x
      if (Math.abs(this.boss.x - this.bossTargetX) < 5) {
        const minX = this.boss.displayWidth / 2;
        const maxX = this.scale.width - this.boss.displayWidth / 2;
        this.bossTargetX = Phaser.Math.Between(minX, maxX);
      }
      // Lerp boss.x toward bossTargetX
      this.boss.x = Phaser.Math.Linear(this.boss.x, this.bossTargetX, 0.02);
      // Clamp x within screen
      this.boss.x = Phaser.Math.Clamp(
        this.boss.x,
        this.boss.displayWidth / 2,
        this.scale.width - this.boss.displayWidth / 2
      );
      // Boss fires missile if aligned with player and cooldown is over
      if (
        Math.abs(this.boss.x - this.player.x) < 10 &&
        this.bossMissileCooldown <= 0
      ) {
        this.fireBossMissile();
        this.bossMissileCooldown = 1200; // ms cooldown
      }
    }

    // Decrease boss missile cooldown
    if (this.bossMissileCooldown > 0) {
      this.bossMissileCooldown -= delta;
    }

    // Move boss missiles downward
    this.bossMissiles.children.each((missile) => {
      if (missile.active) {
        missile.y += 2;
        // Destroy if off screen
        if (missile.y > this.scale.height + 50) {
          missile.destroy();
        }
      }
    });

    // End mission if boss is defeated
    // (Handled in hitTarget)
    // End mission if player runs out of lives
    if (this.lives <= 0 && !this.gameEnded) {
      this.mission5bgm.stop();
      this.gameEnded = true;
      showEndScreen(
        this,
        false,
        () => {
          this.scene.start("BriefingScene", {
            missionTitle: "Victory",
            briefText: MISSION_SUCCESS_BRIEFING,
            audioKey: "mission_success_brief",
            nextScene: "MainMenu",
            commanderTitle: COMMANDER_TITLE,
          });
        },
        "Mission5Scene"
      );
    }
  }

  // Spawns a missile or F4 enemy at a random x position at the top
  spawnMissile() {
    const x = Phaser.Math.Between(30, this.scale.width - 30);
    const rand = Phaser.Math.Between(0, 8);
    let texture, height, width, speed;

    if (rand <= 6) {
      // Most common: missile
      texture = "target";
      height = TARGET_SIZE.height;
      width = TARGET_SIZE.width;
      speed = 180;
    } else {
      // Less common: F4 plane
      texture = "f4";
      height = 60;
      width = 60;
      speed = 120;
    }

    const enemy = this.targets.create(x, -50, texture);
    enemy.setDisplaySize(width, height);
    enemy.setVelocityY(speed);
    enemy.initialX = x;
    enemy.oscillationSpeed = Phaser.Math.FloatBetween(2, 4);
    enemy.oscillationAmplitude = Phaser.Math.Between(10, 30);
    enemy.oscillationPhase = Math.random() * Math.PI * 2;
  }

  // Spawns the boss target only once, at a random y in the top 20% of the screen
  spawnBoss() {
    if (this.bossSpawned) return;
    this.bossSpawned = true;
    const x = this.scale.width / 2;
    const minY = 0.1 * this.scale.height;
    const maxY = 0.2 * this.scale.height;
    const y = Phaser.Math.Between(minY, maxY);
    this.boss = this.targets.create(x, y, "boss");
    this.boss.setDisplaySize(BOSS_SIZE.width, BOSS_SIZE.height);
    this.boss.setVelocityY(0);
    this.boss.initialX = x;
    this.boss.oscillationSpeed = 0;
    this.boss.oscillationAmplitude = 0;
    this.boss.oscillationPhase = 0;
    this.boss.isBoss = true;
  }

  // Handles when a bullet hits a target
  hitTarget(bullet, target) {
    bullet.destroy();

    // If this is the boss and not already defeated
    if (target.texture.key === "boss" && target.isBoss && !this.bossDefeated) {
      this.bossLives--;
      this.scoreText.setText(`Boss lives: ${this.bossLives}`);
      this.explosionSound.play();

      // Show explosion animation at the boss's position
      const explosion = this.add.image(
        target.x,
        target.y,
        "desroyed_explosion"
      );
      explosion.setDepth(10).setAlpha(1).setScale(0.2);
      this.tweens.add({
        targets: explosion,
        alpha: 0,
        scale: 0,
        duration: 350,
        ease: "Linear",
        onComplete: () => explosion.destroy(),
      });

      if (this.bossLives <= 0) {
        this.bossDefeated = true; // <--- Set flag
        target.destroy(); // Only destroy boss after last hit
        this.boss = null; // Prevent further references
        this.mission5bgm.stop();
        this.gameEnded = true;
        showEndScreen(
          this,
          true,
          () => {
            this.scene.start("BriefingScene", {
              missionTitle: "Victory",
              briefText: MISSION_SUCCESS_BRIEFING,
              audioKey: "mission_success_brief",
              nextScene: "MainMenu",
              commanderTitle: COMMANDER_TITLE,
              backgroundKey: "win_bg",
              buttonText: "Return to Main Menu",
            });
          },
          "Mission5Scene"
        );
      }
      return;
    }

    // For all other targets, destroy as usual
    target.destroy();
    this.explosionSound.play();
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

  // Boss fires a missile downward
  fireBossMissile() {
    const missile = this.bossMissiles.create(
      this.boss.x,
      this.boss.y + this.boss.displayHeight / 2,
      "boss_missile"
    );
    missile.setDisplaySize(30, 90);
    missile.setVelocityY(400);
    missile.setCollideWorldBounds(false);
  }
}
