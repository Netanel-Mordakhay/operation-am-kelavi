import { TextStyles } from "../config.js";
import { MISSION_3_BRIEFING, COMMANDER_TITLE } from "../constants.js";
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
const BUILDING_SIZE = { width: 80, height: 80 };

// Utility to detect mobile devices
function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );
}

export default class Mission2Scene extends Phaser.Scene {
  constructor() {
    super("Mission2Scene");
    // Time between building spawns (ms)
    this.spawnBuildingTime = 1600;
    // Allow player to shoot
    this.canShoot = true;
  }

  preload() {
    this.loadingUI = showLoading(this);

    // Load all assets: images and sounds
    this.load.image("mission2bg", "assets/sprites/mission2bg.webp");
    this.load.image("plane", "assets/sprites/f35.webp");
    this.load.image("bullet", "assets/sprites/f35missile.webp");
    this.load.image("enemyBuilding", "assets/sprites/enemyBuilding.webp");
    this.load.image(
      "civillianBuilding",
      "assets/sprites/civillianBuilding.webp"
    );
    this.load.image(
      "desroyed_explosion",
      "assets/sprites/destroyed_explosion.webp"
    );

    this.load.audio("mission2bgm", "assets/sounds/mission2_bgm.mp3");
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
    this.mission2bgm = this.sound
      .add("mission2bgm")
      .setVolume(0.5)
      .setLoop(true);
    this.mission2bgm.play();
    this.explosionSound = this.sound.add("explosion").setVolume(0.3);
    this.f35explosionSound = this.sound.add("f35explosion").setVolume(0.3);

    const { width, height } = this.scale;

    // Get the original size of the background image
    const bgTexture = this.textures.get("mission2bg").getSourceImage();
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
        "mission2bg"
      )
      .setOrigin(0.5)
      .setScale(scale);

    this.bg2 = this.add
      .tileSprite(
        width / 2,
        this.bg1.y - this.bg1.displayHeight,
        bgOriginalWidth,
        bgOriginalHeight,
        "mission2bg"
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

    // Create group for buildings (targets)
    this.targets = this.physics.add.group();

    // Spawn buildings at regular intervals
    this.time.addEvent({
      delay: this.spawnBuildingTime,
      callback: this.spawnBuilding,
      callbackScope: this,
      loop: true,
    });

    // Handle bullet-building collisions
    this.physics.add.overlap(
      this.bullets,
      this.targets,
      this.hitTarget,
      null,
      this
    );
    // Handle player-building collisions
    this.physics.add.overlap(
      this.player,
      this.targets,
      (player, target) => {
        if (target.texture.key === "civillianBuilding" && this.isMobile) {
          // On mobile, ignore hitting civillianBuilding
          return;
        }
        if (target.texture.key === "civillianBuilding") {
          // lose immediately if hit a civillian building (desktop only)
          handlePlayerHit(this, player, target);
          this.lives = 0;
        } else {
          // hit enemy building
          handlePlayerHit(this, player, target);
          this.lives--;
          this.livesText.setText("Lives: " + this.lives);
        }
        target.destroy();
      },
      null,
      this
    );

    // Display score and lives on screen
    this.scoreText = this.add.text(
      170,
      20,
      "Targets Hit: 0 / 20",
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
      "Objectives: Destroy 20 enemy buildings.",
      TextStyles.defaultText()
    );
    this.objectivesTextTwo = this.add.text(
      170,
      110,
      "Avoid hitting civilian buildings.",
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

    // Remove buildings that have moved off the bottom of the screen
    this.targets.children.each((target) => {
      if (target.y > this.scale.height + 50) {
        target.destroy();
        if (target.texture.key === "enemyBuilding") {
          this.lives--;
          this.livesText.setText("Lives: " + this.lives);
        }
      }
    });

    // End mission if enough targets are hit
    if (this.score >= 20 && !this.gameEnded) {
      this.mission2bgm.stop();
      this.gameEnded = true;
      showEndScreen(
        this,
        true,
        () => {
          this.scene.start("BriefingScene", {
            missionTitle: "Mission 3",
            briefText: MISSION_3_BRIEFING,
            audioKey: "mission3_brief",
            nextScene: "Mission3Scene",
            commanderTitle: COMMANDER_TITLE,
          });
        },
        "Mission2Scene"
      );
    }

    // End mission if player runs out of lives
    if (this.lives <= 0 && !this.gameEnded) {
      this.mission2bgm.stop();
      this.gameEnded = true;
      showEndScreen(
        this,
        false,
        () => {
          this.scene.start("BriefingScene", {
            missionTitle: "Mission 3",
            briefText: MISSION_3_BRIEFING,
            audioKey: "mission3_brief",
            nextScene: "Mission3Scene",
            commanderTitle: COMMANDER_TITLE,
          });
        },
        "Mission2Scene"
      );
    }
  }

  // Spawns a building (enemy or civilian) at a random x position at the top
  spawnBuilding() {
    const x = Phaser.Math.Between(30, this.scale.width - 30);
    const isEnemy = Phaser.Math.Between(0, 10) <= 6;
    const texture = isEnemy ? "enemyBuilding" : "civillianBuilding";

    const building = this.targets.create(x, -50, texture);
    building.setDisplaySize(BUILDING_SIZE.width, BUILDING_SIZE.height);
    building.setVelocityY(200);
  }

  // Handles when a bullet hits a building
  hitTarget(bullet, target) {
    bullet.destroy();

    if (target.texture.key === "civillianBuilding") {
      if (!this.isMobile) {
        this.lives = 0;
      }
    } else {
      this.score += 1;
      this.scoreText.setText("Targets Hit: " + this.score + " / 20");
    }

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

    target.destroy();
  }
}
