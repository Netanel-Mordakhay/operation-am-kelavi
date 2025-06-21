import { TextStyles } from "../config.js";
import {
  MENU_ITEMS,
  MISSION_BRIEFING,
  ABOUT,
  HOW_TO_PLAY,
  CREDITS,
  GAME_WIDTH,
  GAME_HEIGHT,
} from "../constants.js";

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  preload() {
    this.load.video("background", "assets/menu/bg_video.mp4");
    this.load.audio("menu_music", "assets/menu/bg_music.mp3");
    this.load.image("logo", "assets/logo_am_kelavi.png");
  }

  create() {
    /* Background Video */
    const { width, height } = this.scale;
    const video = this.add.video(width / 2, height / 2, "background");
    video.setDisplaySize(width / 4, height / 4);
    video.setDepth(-1);
    video.play(true);
    video.setMute(true);

    /* Menu Music */
    const music = this.sound.add("menu_music");
    music.play();
    music.setLoop(true);
    music.setVolume(0.5);

    /* Logo */
    const logo = this.add.image(GAME_WIDTH / 2, 150, "logo");
    logo.setDisplaySize(350, 254);
    logo.setOrigin(0.5);

    /* Title */
    this.add
      .text(GAME_WIDTH / 2, 320, "Operation Am Kelavi", TextStyles.title)
      .setOrigin(0.5);

    /* Menu Items */
    MENU_ITEMS.forEach((label, index) => {
      const item = this.add
        .text(GAME_WIDTH / 2, 420 + index * 80, label, TextStyles.menuItem)
        .setOrigin(0.5);

      item.setInteractive({ useHandCursor: true });

      /* Menu Item Hover */
      item.on("pointerover", () => {
        item.setColor(TextStyles.menuItemHover.color);
      });

      /* Menu Item Out */
      item.on("pointerout", () => {
        item.setColor(TextStyles.menuItem.color);
      });

      /* Menu Item Click */
      item.on("pointerdown", () => {
        if (label === "Start Game") {
          console.log(`${label} clicked`);
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
  }

  openModal(title, content) {
    // Create a semi-transparent overlay covering the entire game
    const overlay = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      0.6
    );
    overlay.setDepth(10);
    overlay.setOrigin(0.5);

    // Fixed modal width at 80% of scene width
    const modalWidth = GAME_WIDTH * 0.8;

    // Create title text
    const titleText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 150, title, TextStyles.title)
      .setOrigin(0.5)
      .setDepth(12);

    // Create content text with the new width
    const contentText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, content, TextStyles.defaultText)
      .setOrigin(0.5)
      .setDepth(12)
      .setWordWrapWidth(modalWidth - 80); // Adjust wrap width for padding

    // Get text bounds to size modal height
    const titleBounds = titleText.getBounds();
    const contentBounds = contentText.getBounds();
    const padding = 60;
    const modalHeight =
      titleBounds.height + contentBounds.height + padding + 120; // Extra space for button

    // Modal background with fixed width
    const modalBg = this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      modalWidth,
      modalHeight,
      0x222222,
      0.95
    );
    modalBg.setStrokeStyle(3, 0x00ccff);
    modalBg.setDepth(11);
    modalBg.setOrigin(0.5);

    // Reposition title and content within modal
    titleText.setY(GAME_HEIGHT / 2 - modalHeight / 2 + 50);
    contentText.setY(GAME_HEIGHT / 2);

    const closeBtn = this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 + modalHeight / 2 - 50,
        "Close",
        TextStyles.button
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(12);

    closeBtn.on("pointerover", () => {
      closeBtn.setStyle(TextStyles.buttonHover);
    });
    closeBtn.on("pointerout", () => {
      closeBtn.setStyle(TextStyles.button);
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
