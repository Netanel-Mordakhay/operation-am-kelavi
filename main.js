// main.js
import Phaser from "phaser";
import MainMenuScene from "./scenes/MainMenuScene.js";
import BriefingScene from "./scenes/BriefingSceneGeneric.js";

const mainMenu = new MainMenuScene("MainMenu");

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  scene: [mainMenu, BriefingScene],
};

window.onload = () => {
  new Phaser.Game(config);
};
