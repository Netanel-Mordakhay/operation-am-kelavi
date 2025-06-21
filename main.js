import { GAME_WIDTH, GAME_HEIGHT } from "./constants.js";
import Phaser from "phaser";
import MainMenuScene from "./scenes/MainMenuScene.js";

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#000022",
  parent: document.body,
  scene: [MainMenuScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
};

const game = new Phaser.Game(config);
