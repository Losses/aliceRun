import * as THREE from "three";

import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

import { ResourceTracker } from "./ResourceTracker";

import './effects/StatsEffect';

export const action = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
  canJump: false,
}

export const initializeThreeCanvas = ($container: HTMLDivElement) => {
  const tracker = new ResourceTracker();

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(5, 5, 40);

  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.localClippingEnabled = true;
  tracker.track(renderer);

  const controls = new PointerLockControls(camera, document.body);
  scene.add(controls.getObject());
  tracker.track(controls);

  const smaaPass = new SMAAPass(window.innerWidth, window.innerHeight);

  const renderScene = new RenderPass(scene, camera);

  const finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderScene);
  finalComposer.addPass(smaaPass);

  function onWindowResize() {
    var width = window.innerWidth;
    var height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    smaaPass.setSize(width, height);
    finalComposer.setSize(width, height);
  }

  window.addEventListener("resize", onWindowResize, false);

  $container.appendChild(renderer.domElement);

  renderer.domElement.id = 'three_canvas'

  // renderer.domElement.addEventListener('click', function () {
  //   controls.lock();
  // });

  const onKeyDown = function (event: KeyboardEvent) {

    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        action.moveForward = true;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        action.moveLeft = true;
        break;

      case 'ArrowDown':
      case 'KeyS':
        action.moveBackward = true;
        break;

      case 'ArrowRight':
      case 'KeyD':
        action.moveRight = true;
        break;

      case 'Space':
        action.canJump = false;
        break;

    }

  };

  const onKeyUp = function (event: KeyboardEvent) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW':
        action.moveForward = false;
        break;

      case 'ArrowLeft':
      case 'KeyA':
        action.moveLeft = false;
        break;

      case 'ArrowDown':
      case 'KeyS':
        action.moveBackward = false;
        break;

      case 'ArrowRight':
      case 'KeyD':
        action.moveRight = false;
        break;
    }
  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  return {
    scene,
    camera,
    controls,
    renderer,
    composer: finalComposer,
    tracker
  };
};
