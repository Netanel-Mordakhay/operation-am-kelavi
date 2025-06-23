// shoot bullet
export function shootBullet(
  scene,
  player,
  bulletsGroup,
  bulletCooldownMs = 1000
) {
  if (!scene.canShoot) return;

  const bullet = bulletsGroup.create(player.x, player.y - 20, "bullet");
  bullet.setDisplaySize(10, 30);
  bullet.setVelocityY(-300);
  bullet.setCollideWorldBounds(false);

  scene.canShoot = false;
  setTimeout(() => {
    scene.canShoot = true;
  }, bulletCooldownMs);
}

// player hit
export function handlePlayerHit(
  scene,
  player,
  target,
  explosionSoundKey = "f35explosion"
) {
  target.destroy();
  scene.lives -= 1;
  scene.livesText.setText(`Lives: ${scene.lives}`);
  scene.sound.play(explosionSoundKey, { volume: 0.3 });

  const explosion = scene.add.image(player.x, player.y, "desroyed_explosion");
  explosion.setDepth(10).setAlpha(1).setScale(0.3);

  scene.tweens.add({
    targets: explosion,
    alpha: 0,
    scale: 0,
    duration: 500,
    ease: "Linear",
    onComplete: () => explosion.destroy(),
  });

  player.setPosition(scene.scale.width / 2, scene.scale.height * 0.8);
}

/*
// player movement
export function handlePlayerMovement(scene, cursors, player, movementBounds) {
  let turning = false;

  if (cursors.left.isDown && player.x > movementBounds.left) {
    player.x -= 7;
    player.setAngle(Phaser.Math.Linear(player.angle, -15, 0.2));
    turning = true;
  } else if (cursors.right.isDown && player.x < movementBounds.right) {
    player.x += 7;
    player.setAngle(Phaser.Math.Linear(player.angle, 15, 0.2));
    turning = true;
  }

  if (!turning) {
    player.setAngle(Phaser.Math.Linear(player.angle, 0, 0.1));
  }

  if (cursors.up.isDown && player.y > movementBounds.top) {
    player.y -= 5;
  } else if (cursors.down.isDown && player.y < movementBounds.bottom) {
    player.y += 5;
  }
}
*/

export function handlePlayerMovement(
  scene,
  cursors,
  player,
  movementBounds,
  delta
) {
  let turning = false;

  const speedX = 800;
  const speedY = 400;
  const moveX = (speedX * delta) / 1000;
  const moveY = (speedY * delta) / 1000;

  if (cursors.left.isDown && player.x > movementBounds.left) {
    player.x -= moveX;
    player.setAngle(Phaser.Math.Linear(player.angle, -15, 0.2));
    turning = true;
  } else if (cursors.right.isDown && player.x < movementBounds.right) {
    player.x += moveX;
    player.setAngle(Phaser.Math.Linear(player.angle, 15, 0.2));
    turning = true;
  }

  if (!turning) {
    player.setAngle(Phaser.Math.Linear(player.angle, 0, 0.1));
  }

  if (cursors.up.isDown && player.y > movementBounds.top) {
    player.y -= moveY;
  } else if (cursors.down.isDown && player.y < movementBounds.bottom) {
    player.y += moveY;
  }
}
