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

  // Different speeds for keyboard vs touch
  const keyboardSpeedX = 700;
  const keyboardSpeedY = 500;

  const keyboardMoveX = (keyboardSpeedX * delta) / 1000;
  const keyboardMoveY = (keyboardSpeedY * delta) / 1000;

  const touchSpeedX = 900;
  const touchSpeedY = 400;
  const touchMoveX = (touchSpeedX * delta) / 1000;
  const touchMoveY = (touchSpeedY * delta) / 1000;

  if (cursors.left.isDown && player.x > movementBounds.left) {
    player.x -= keyboardMoveX;
    player.setAngle(Phaser.Math.Linear(player.angle, -15, 0.2));
    turning = true;
  } else if (cursors.right.isDown && player.x < movementBounds.right) {
    player.x += keyboardMoveX;
    player.setAngle(Phaser.Math.Linear(player.angle, 15, 0.2));
    turning = true;
  }

  if (cursors.up.isDown && player.y > movementBounds.top) {
    player.y -= keyboardMoveY;
  } else if (cursors.down.isDown && player.y < movementBounds.bottom) {
    player.y += keyboardMoveY;
  }

  // Handle touch/swipe controls
  if (!scene.input.touch) {
    scene.input.addPointer(2); // Enable multi-touch

    // Track swipe
    scene.input.on("pointerdown", (pointer) => {
      pointer.dragStartX = pointer.x;
      pointer.dragStartY = pointer.y;
    });

    scene.input.on("pointermove", (pointer) => {
      if (pointer.isDown) {
        const dragX = pointer.x - pointer.dragStartX;
        const dragY = pointer.y - pointer.dragStartY;

        const threshold = 10;

        // Move horizontally based on swipe
        if (Math.abs(dragX) > threshold) {
          if (dragX < 0 && player.x > movementBounds.left) {
            player.x -= touchMoveX;
            player.setAngle(Phaser.Math.Linear(player.angle, -15, 0.2));
          } else if (dragX > 0 && player.x < movementBounds.right) {
            player.x += touchMoveX;
            player.setAngle(Phaser.Math.Linear(player.angle, 15, 0.2));
          }
          pointer.dragStartX = pointer.x;
        }

        // Move vertically based on swipe
        if (Math.abs(dragY) > threshold) {
          if (dragY < 0 && player.y > movementBounds.top) {
            player.y -= touchMoveY;
          } else if (dragY > 0 && player.y < movementBounds.bottom) {
            player.y += touchMoveY;
          }
          pointer.dragStartY = pointer.y;
        }
      }
    });

    // Handle double tap to shoot
    let lastTapTime = 0;
    scene.input.on("pointerdown", (pointer) => {
      const currentTime = new Date().getTime();
      const tapGap = currentTime - lastTapTime;

      if (tapGap < 300) {
        // Double tap detected
        scene.input.keyboard.emit("keydown-SPACE");
      }

      lastTapTime = currentTime;
    });
  }

  if (!turning) {
    player.setAngle(Phaser.Math.Linear(player.angle, 0, 0.1));
  }
}
