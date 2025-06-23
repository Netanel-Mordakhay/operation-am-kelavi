export function typewriteText(scene, x, y, fullText, style, delay = 0.5) {
  const text = scene.add
    .text(x, y, "", style)
    .setOrigin(0.5)
    .setWordWrapWidth(scene.scale.width * 0.75);
  let i = 0;

  scene.time.addEvent({
    delay: delay,
    repeat: fullText.length - 1,
    callback: () => {
      text.setText(fullText.substr(0, ++i));
    },
  });

  return text;
}
