import * as THREE from 'three';

import { initializeThreeCanvas, action } from "./initializeThreeCanvas";
import { prepareVisualObjects } from "./prepareVisualObjects";
import {
  JoyConManager,
  accelerometerY, orientationY
} from './manager/JoyConManager';

import { GroundManager } from './manager/GroundManager';

const config = initializeThreeCanvas(
  document.querySelector("#app") as HTMLDivElement
);

prepareVisualObjects(config.scene, config.tracker);
const updateGroundTiles = GroundManager(config.camera, config.scene, config.tracker);

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let prevTime = performance.now();

const RUNNING_SPEED = 4800;

const animate = () => {
  updateGroundTiles();

  const time = performance.now();

  if (config.controls.isLocked === true) {
    const delta = (time - prevTime) / 1000;

    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(action.moveForward) - Number(action.moveBackward);
    direction.x = Number(action.moveRight) - Number(action.moveLeft);
    direction.normalize();

    if (action.moveForward || action.moveBackward) velocity.z -= direction.z * RUNNING_SPEED * delta;
    if (action.moveLeft || action.moveRight) velocity.x -= direction.x * RUNNING_SPEED * delta;
    if (action.canJump) velocity.y -= direction.y * RUNNING_SPEED * delta;

    config.controls.moveRight(- velocity.x * delta);
    config.controls.moveForward(- velocity.z * delta);
  }

  prevTime = time;

  requestAnimationFrame(animate);
  config.composer.render();
};

animate();

JoyConManager();