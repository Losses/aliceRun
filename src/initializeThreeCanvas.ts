import * as THREE from "three";

import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { CANVAS_SIZE, updateCanvasSize } from "./stores/settings";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";

import { ResourceTracker } from "./ResourceTracker";

export const initializeThreeCanvas = ($container: HTMLDivElement) => {
  const tracker = new ResourceTracker();

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    30,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.set(0, 0, 40);

  const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
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

  CANVAS_SIZE.subscribe(({width, height}) => {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    smaaPass.setSize(width, height);
    finalComposer.setSize(width, height);
  }, true);

  window.addEventListener("resize", updateCanvasSize, false);

  $container.appendChild(renderer.domElement);

  renderer.domElement.id = 'three_canvas'

  return {
    scene,
    camera,
    controls,
    renderer,
    composer: finalComposer,
    tracker
  };
};
