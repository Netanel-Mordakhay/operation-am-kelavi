// scenes/BriefingScene.js
import { TextStyles } from "../config.js";
import { typewriteText } from "../src/libs/typewrite.js";
import { showLoading } from "../src/libs/loadingUI.js";

export default class BriefingScene extends Phaser.Scene {
  constructor(key = "BriefingScene") {
    super("BriefingScene");
  }

  init(data) {
    this.missionTitle = data.missionTitle;
    this.briefText = data.briefText;
    this.audioKey = data.audioKey;
    this.videoKey = data.videoKey;
    this.nextScene = data.nextScene;
    this.commanderTitle = data.commanderTitle;

    // Optional with fallback
    this.backgroundKey = data.backgroundKey || "brief_bg";
    this.buttonText = data.buttonText || "Start Mission";
  }

  preload() {
    this.loadingUI = showLoading(this);

    if (this.backgroundKey)
      this.load.image(
        this.backgroundKey,
        `assets/sprites/${this.backgroundKey}.webp`
      );

    if (this.audioKey)
      this.load.audio(this.audioKey, `assets/sounds/${this.audioKey}.mp3`);

    this.load.video("brief_commander", `assets/video/brief_commander.mp4`);

    this.load.on("complete", () => {
      this.loadingUI.destroy();
    });
  }

  create() {
    const { width, height } = this.scale;

    // Background
    //this.cameras.main.setBackgroundColor("#000000");
    const background = this.add.image(
      width / 2,
      height / 2,
      this.backgroundKey
    );

    background.setOrigin(0.5);
    background.setDisplaySize(width * 1.4, height * 1.4);
    background.setDepth(-1);
    this.add
      .rectangle(width / 2, height / 2, width * 0.85, height, 0x000000, 0.65)
      .setDepth(0);

    // Audio
    const audio = this.sound.add(this.audioKey);
    audio.setVolume(0.5);
    audio.setLoop(false);
    audio.play();

    // Mission Title
    this.add
      .text(width / 2, height * 0.1, this.missionTitle, TextStyles.title())
      .setOrigin(0.5)
      .setWordWrapWidth(width * 0.8)
      .setDepth(2);

    // Briefing Text (Typewriter effect)
    typewriteText(
      this,
      width / 2,
      //height / 2 - 120,
      height * 0.4,
      this.briefText,
      TextStyles.defaultText()
    );

    // Commander Video
    const videoX = this.sys.game.device.os.desktop ? width * 0.2 : width * 0.5;
    const videoY = this.sys.game.device.os.desktop
      ? height * 0.8
      : height * 0.65;
    const video = this.add.video(videoX, videoY, "brief_commander");
    video.setDisplaySize(60, 60);
    video.setDepth(1);
    //video.setPlaybackRate(1.2);
    video.play(true);
    video.setMute(true);

    const circleMask = this.make.graphics({ x: 0, y: 0, add: false });
    const radius = Math.min(video.displayWidth, video.displayHeight) / 2;
    circleMask.fillStyle(0xffffff);
    circleMask.beginPath();
    circleMask.arc(video.x, video.y, 120, 0, Math.PI * 2);
    circleMask.fillPath();
    const mask = circleMask.createGeometryMask();
    video.setMask(mask);

    // Commander Title
    const commanderTitleX = this.sys.game.device.os.desktop
      ? width * 0.4
      : width * 0.5;
    const commanderTitleY = this.sys.game.device.os.desktop
      ? height * 0.8
      : height * 0.75;

    this.add
      .text(
        commanderTitleX,
        commanderTitleY,
        this.commanderTitle,
        TextStyles.defaultText()
      )
      .setOrigin(0.5)
      .setWordWrapWidth(width * 0.8)
      .setDepth(2);

    // Start Button
    const buttonX = this.sys.game.device.os.desktop ? width * 0.7 : width * 0.5;
    const button = this.add
      .text(buttonX, height * 0.8, this.buttonText, TextStyles.button())
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    button.on("pointerover", () => button.setStyle(TextStyles.buttonHover()));
    button.on("pointerout", () => button.setStyle(TextStyles.button()));
    button.on("pointerdown", () => {
      audio.stop();
      this.scene.start(this.nextScene);
    });
  }
}
