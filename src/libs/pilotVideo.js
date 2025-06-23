export function createPilotVideo(scene) {
  const x = 80;
  const y = 80;
  const diameter = 150;
  const radius = diameter / 2;

  const video = scene.add.video(x, y, "pilot_video");
  video.setDisplaySize(40, 40);
  video.video.playbackRate = 0.5;
  video.setAlpha(0.9);
  video.setDepth(20);
  video.setMute(true);

  // Create a circular mask
  const maskShape = scene.make.graphics({ x: 0, y: 0, add: false });
  maskShape.fillStyle(0xffffff);
  maskShape.beginPath();
  maskShape.arc(x, y, radius, 0, Math.PI * 2);
  maskShape.fillPath();

  const mask = maskShape.createGeometryMask();
  video.setMask(mask);

  video.play(true);

  return video;
}
