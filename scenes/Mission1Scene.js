import { TextStyles } from "../config.js";
import { MISSION_2_BRIEFING, COMMANDER_TITLE } from "../constants.js";
import { showEndScreen } from "../src/libs/showEndScreen.js";
import { createPilotVideo } from "../src/libs/pilotVideo.js";
import { showLoading } from "../src/libs/loadingUI.js";
import {
  shootBullet,
  handlePlayerHit,
  handlePlayerMovement,
} from "../src/libs/playerUtils.js";

// Constants for sizes
const PLAYER_SIZE = { width: 100, height: 100 };
const TARGET_SIZE = { width: 30, height: 90 };

// Utility to detect mobile devices
function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );
}

export default class Mission1Scene extends Phaser.Scene {
  constructor() {
    super("Mission1Scene");
    // Control shooting rate and missile spawn timing
    this.canShoot = true;
    this.missleSpawnTime = 800;
  }

  preload() {
    this.loadingUI = showLoading(this);

    // Load all assets: images and sounds
    this.load.image("mission1bg", "assets/sprites/mission1bg.webp");
    this.load.image("plane", "assets/sprites/f35.webp");
    this.load.image("bullet", "assets/sprites/f35missile.webp");
    this.load.image("target", "assets/sprites/missile.webp");
    this.load.image("f4", "assets/sprites/f4.webp");
    this.load.image(
      "desroyed_explosion",
      "assets/sprites/destroyed_explosion.webp"
    );

    this.load.audio("mission1bgm", "assets/sounds/mission1_bgm.mp3");
    this.load.audio("explosion", "assets/sounds/effects/explosion1.mp3");
    this.load.audio("f35explosion", "assets/sounds/effects/f35explosion.mp3");
    this.load.video("pilot_video", "assets/video/pilot.mp4");

    this.load.on("complete", () => {
      this.loadingUI.destroy();
    });
  }

  create() {
    // Reset all per-playthrough state
    this.score = 0;
    this.lives = 3;
    this.gameEnded = false;

    // Add and configure background music and sound effects
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

    // Get the original size of the background image
    const bgTexture = this.textures.get("mission1bg").getSourceImage();
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
        "mission1bg"
      )
      .setOrigin(0.5)
      .setScale(scale);

    this.bg2 = this.add
      .tileSprite(
        width / 2,
        this.bg1.y - this.bg1.displayHeight,
        bgOriginalWidth,
        bgOriginalHeight,
        "mission1bg"
      )
      .setOrigin(0.5)
      .setScale(scale);

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

    // Device check
    this.isMobile = isMobileDevice();

    // Shooting logic
    if (this.isMobile) {
      // Shoot automatically every 400ms (adjust as needed)
      this.autoShootEvent = this.time.addEvent({
        delay: 400,
        callback: () => {
          shootBullet(this, this.player, this.bullets);
        },
        callbackScope: this,
        loop: true,
      });
    } else {
      // Desktop: shoot on SPACE
      this.input.keyboard.on("keydown-SPACE", () => {
        shootBullet(this, this.player, this.bullets);
      });
    }

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

    // Display score and lives on screen
    this.scoreText = this.add.text(
      170,
      20,
      "Targets Hit: 0 / 30",
      TextStyles.defaultText()
    );
    this.livesText = this.add.text(
      170,
      50,
      "Lives: 3",
      TextStyles.defaultText()
    );
    this.objectivesText = this.add.text(
      170,
      80,
      "Objectives: Destroy 30 targets, avoid the rest.",
      TextStyles.defaultText()
    );

    // Set up keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
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
      if (target.y > this.scale.height + 50) {
        target.destroy();
      }
    });

    // End mission if enough targets are hit
    if (this.score >= 30 && !this.gameEnded) {
      this.mission1bgm.stop();
      this.gameEnded = true;
      showEndScreen(
        this,
        true,
        () => {
          this.scene.start("BriefingScene", {
            missionTitle: "Mission 2",
            briefText: MISSION_2_BRIEFING,
            audioKey: "mission2_brief",
            nextScene: "Mission2Scene",
            commanderTitle: COMMANDER_TITLE,
          });
        },
        "Mission1Scene"
      );
    }

    // End mission if player runs out of lives
    if (this.lives <= 0 && !this.gameEnded) {
      this.mission1bgm.stop();
      this.gameEnded = true;
      showEndScreen(
        this,
        false,
        () => {
          this.scene.start("BriefingScene", {
            missionTitle: "Mission 2",
            briefText: MISSION_2_BRIEFING,
            audioKey: "mission2_brief",
            nextScene: "Mission21Scene",
            commanderTitle: COMMANDER_TITLE,
          });
        },
        "Mission1Scene"
      );
    }
  }

  // Spawns a missile or F4 enemy at a random x position at the top
  spawnMissile() {
    const x = Phaser.Math.Between(30, this.scale.width - 30);
    const isF4 = Phaser.Math.Between(0, 10) <= 7;
    const texture = isF4 ? "f4" : "target";
    const height = isF4 ? 60 : TARGET_SIZE.height;
    const width = isF4 ? 60 : TARGET_SIZE.width;
    const speed = isF4 ? 180 : 260;

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

    // Add score based on target type
    const scoreToAdd = target.texture.key === "target" ? 2 : 1;
    this.score += scoreToAdd;
    this.scoreText.setText(`Targets Hit: ${this.score} / 30`);
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
}
