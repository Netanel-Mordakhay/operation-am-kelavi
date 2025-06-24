import WebFont from "webfontloader";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.ready = false;

    this.loadingText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, "Loading...", {
        fontSize: "32px",
        color: "#ffffff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

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
      this.loadingText.destroy();
      this.scene.start("MainMenu");
    }
  }
}
