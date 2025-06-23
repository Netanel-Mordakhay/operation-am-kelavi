import { TextStyles } from "../../config.js";

export function showEndScreen(
  scene,
  isWin,
  nextScene = "MainMenu",
  retryScene = scene.scene.key
) {
  const { width, height } = scene.scale;

  // pause game
  scene.physics.pause();
  if (scene.mission1bgm?.stop) {
    scene.mission1bgm.stop();
  }

  // black background
  scene.add
    .rectangle(width / 2, height / 2, width, height, 0x000000, 0.8)
    .setDepth(100);

  // result text
  scene.add
    .text(
      width / 2,
      height * 0.3,
      isWin ? "Mission Successful" : "Mission Failed",
      TextStyles.title()
    )
    .setOrigin(0.5)
    .setDepth(101);

  // button
  const buttonText = isWin ? "Continue" : "Try Again";
  const button = scene.add
    .text(width / 2, height * 0.6, buttonText, TextStyles.button())
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true })
    .setDepth(101);

  button.on("pointerover", () => {
    button.setStyle({ fill: "#ffff88", backgroundColor: "#666" });
  });

  button.on("pointerout", () => {
    button.setStyle({ fill: "#ffffff", backgroundColor: "#444" });
  });

  button.on("pointerdown", () => {
    if (isWin) {
      if (typeof nextScene === "function") {
        nextScene();
      } else {
        scene.scene.start(nextScene);
      }
    } else {
      scene.scene.start(retryScene);
    }
  });
}
