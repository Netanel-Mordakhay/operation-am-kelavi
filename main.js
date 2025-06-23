// main.js
import Phaser from "phaser";
import MainMenuScene from "./scenes/MainMenuScene.js";
import BriefingScene from "./scenes/BriefingSceneGeneric.js";
import Mission1Scene from "./scenes/Mission1Scene.js";
import Mission2Scene from "./scenes/Mission2Scene.js";
import Mission3Scene from "./scenes/Mission3Scene.js";
import Mission4Scene from "./scenes/Mission4Scene.js";
import Mission5Scene from "./scenes/Mission5Scene.js";

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

  scene: [
    mainMenu,
    BriefingScene,
    Mission1Scene,
    Mission2Scene,
    Mission3Scene,
    Mission4Scene,
    Mission5Scene,
  ],
  /*
  scene: [
    Mission5Scene,
    Mission4Scene,
    Mission3Scene,
    Mission2Scene,
    Mission1Scene,
    BriefingScene,
    mainMenu,
  ],
  */
};

window.onload = () => {
  new Phaser.Game(config);
};
