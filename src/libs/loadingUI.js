// utils/LoadingUI.js
export function showLoading(scene, text = "Loading...") {
  const { width, height } = scene.scale;

  const loadingText = scene.add
    .text(width / 2, height / 2 - 30, text, {
      fontSize: "32px",
      color: "#ffffff",
      fontFamily: "Arial",
    })
    .setOrigin(0.5)
    .setDepth(1001);

  const spinner = scene.add.circle(width / 2, height / 2 + 30, 20, 0xffffff);
  spinner.setDepth(1001);

  scene.tweens.add({
    targets: spinner,
    scaleX: 0.6,
    scaleY: 0.6,
    yoyo: true,
    duration: 500,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  return {
    destroy: () => {
      loadingText.destroy();
      spinner.destroy();
    },
  };
}
