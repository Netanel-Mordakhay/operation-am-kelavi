import { TextStyles } from "../config.js";
import {
  MENU_ITEMS,
  MISSION_BRIEFING,
  ABOUT,
  HOW_TO_PLAY,
  CREDITS,
  MISSION_1_BRIEFING,
  COMMANDER_TITLE,
} from "../constants.js";
import { showLoading } from "../src/libs/loadingUI.js";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  preload() {
    this.loadingUI = showLoading(this);

    this.load.video("background", "assets/video/menu_bg.mp4");
    this.load.audio("menu_music", "assets/sounds/menu_music.mp3");
    this.load.image("logo", "assets/logo_am_kelavi.png");

    this.load.on("complete", () => {
      this.loadingUI.destroy();
    });
  }

  create() {
    this.add
      .text(0, 0, ".", {
        fontFamily: "Black Ops One",
        fontSize: "1px",
        color: "#000000",
      })
      .setAlpha(0);

    const { width, height } = this.scale;

    // Background Video
    const video = this.add.video(width / 2, height / 2, "background");
    video.setDisplaySize(width / 4, height / 4);
    video.setDepth(-1);
    video.play(true);
    video.setMute(true);
    video.setPlaybackRate(0.7);

    // Music
    const music = this.sound.add("menu_music");
    music.play();
    music.setLoop(true);
    music.setVolume(0.5);

    // Menu Background
    this.add.rectangle(
      width / 2,
      height / 2,
      width * 0.85,
      height,
      0x000000,
      0.5
    );

    // Logo
    const logo = this.add.image(width / 2, height * 0.18, "logo");
    logo.setDisplaySize(350, 254);
    logo.setOrigin(0.5);

    // Title
    this.add
      .text(width / 2, height * 0.4, "Operation Am Kelavi", TextStyles.title())
      .setOrigin(0.5);

    // Menu Items
    MENU_ITEMS.forEach((label, index) => {
      const item = this.add
        .text(
          width / 2,
          height * 0.5 + index * 60,
          label,
          TextStyles.menuItem()
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      item.on("pointerover", () => {
        item.setColor(TextStyles.menuItemHover().color);
      });

      item.on("pointerout", () => {
        item.setColor(TextStyles.menuItem().color);
      });

      item.on("pointerdown", () => {
        if (label === "Start Game") {
          music.stop();
          this.scene.start("BriefingScene", {
            missionTitle: "Mission 1",
            briefText: MISSION_1_BRIEFING,
            audioKey: "mission1_brief",
            //videoKey: "brief_commander",
            nextScene: "Mission1Scene",
            commanderTitle: COMMANDER_TITLE,
          });
        } else if (label === "Mission Briefing") {
          this.openModal("Mission Briefing", MISSION_BRIEFING);
        } else if (label === "About") {
          this.openModal("About", ABOUT);
        } else if (label === "How to Play") {
          this.openModal("How to Play", HOW_TO_PLAY);
        } else if (label === "Credits") {
          this.openModal("Credits", CREDITS);
        }
      });
    });

    this.add
      .text(
        width * 0.5,
        height * 0.5 + 5 * 60,
        "SOUND ON RECOMMENDED",
        TextStyles.defaultText()
      )
      .setOrigin(0.5);

    // Credit text
    const creditText = this.add
      .text(
        width / 2,
        height * 0.95,
        "Game by Netanel Mordakhay © 2025",
        TextStyles.defaultText()
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        window.open("https://www.linkedin.com/in/netanel-mordakhay/", "_blank");
      });

    // Glow mask
    const maskWidth = 100;
    const maskHeight = creditText.height + 10;

    const maskGfx = this.make.graphics({}, false);
    maskGfx.fillStyle(0xffffff);
    maskGfx.fillRect(0, 0, maskWidth, maskHeight);

    // Glow text
    const glowText = this.add
      .text(creditText.x, creditText.y, creditText.text, {
        ...TextStyles.defaultText(),
        color: "#ffffff",
      })
      .setOrigin(0.5);

    const mask = maskGfx.createGeometryMask();
    glowText.setMask(mask);

    // Glow effect
    maskGfx.x = -maskWidth;
    maskGfx.y = creditText.y - maskHeight / 2;

    this.tweens.add({
      targets: maskGfx,
      x: width + maskWidth,
      duration: 5000,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  openModal(title, content) {
    const { width, height } = this.scale;

    const overlay = this.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.6
    );
    overlay.setDepth(10).setOrigin(0.5);

    const modalWidth = width * 0.8;

    const titleText = this.add
      .text(width / 2, height / 2 - 150, title, TextStyles.title())
      .setOrigin(0.5)
      .setDepth(12);

    const contentText = this.add
      .text(width / 2, height / 2, content, TextStyles.defaultText())
      .setOrigin(0.5)
      .setDepth(12)
      .setWordWrapWidth(modalWidth - 80);

    const titleBounds = titleText.getBounds();
    const contentBounds = contentText.getBounds();
    const padding = 60;
    const modalHeight =
      titleBounds.height + contentBounds.height + padding + 120;

    const modalBg = this.add.rectangle(
      width / 2,
      height / 2,
      modalWidth,
      modalHeight,
      0x222222,
      0.95
    );
    modalBg.setStrokeStyle(3, 0x00ccff);
    modalBg.setDepth(11).setOrigin(0.5);

    titleText.setY(height / 2 - modalHeight / 2 + 50);
    contentText.setY(height / 2);

    const closeBtn = this.add
      .text(
        width / 2,
        height / 2 + modalHeight / 2 - 50,
        "Close",
        TextStyles.button()
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(12);

    closeBtn.on("pointerover", () => {
      closeBtn.setStyle(TextStyles.buttonHover());
    });

    closeBtn.on("pointerout", () => {
      closeBtn.setStyle(TextStyles.button());
    });

    closeBtn.on("pointerdown", () => {
      overlay.destroy();
      modalBg.destroy();
      titleText.destroy();
      contentText.destroy();
      closeBtn.destroy();
    });
  }
}
