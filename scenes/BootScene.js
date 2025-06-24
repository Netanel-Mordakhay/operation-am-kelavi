import WebFont from "webfontloader";
import { showLoading } from "../src/libs/loadingUI.js";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.ready = false;

    this.loadingUI = showLoading(this);

    WebFont.load({
      google: {
        families: ["Black Ops One"],
      },
      active: () => {
        this.ready = true;
      },
    });
  }

  update() {
    if (this.ready) {
      this.loadingUI.destroy();
      this.scene.start("MainMenu");
    }
  }
}
