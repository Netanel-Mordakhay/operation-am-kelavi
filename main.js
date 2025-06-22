// main.js
import Phaser from "phaser";
import MainMenuScene from "./scenes/MainMenuScene.js";
import BriefingScene from "./scenes/BriefingSceneGeneric.js";
import Mission1Scene from "./scenes/Mission1Scene.js";

const mainMenu = new MainMenuScene("MainMenu");

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [mainMenu, BriefingScene, Mission1Scene],
};

window.onload = () => {
  new Phaser.Game(config);
};
