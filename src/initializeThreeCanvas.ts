import * as THREE from "three";

import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { SepiaShader } from 'three/examples/jsm/shaders/SepiaShader';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader';
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { CANVAS_SIZE, updateCanvasSize } from "./stores/settings";

import { timeManager } from "./manager/TimeManager";
import { GlitchShader } from "./utils/shaders/GlitchPass";
import { FrameRateLevel } from "./utils/TimeMagic";
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
  const glitchPass = new ShaderPass(GlitchShader);
  const sepiaPass = new ShaderPass(SepiaShader);
  const vignettePass = new ShaderPass(VignetteShader);
  const filmPass = new FilmPass(100);

  timeManager.addFn((time) => {
    glitchPass.uniforms.time.value = time;
  }, FrameRateLevel.D3);
  
  const finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderScene);
  finalComposer.addPass(smaaPass);
  finalComposer.addPass(sepiaPass);
  finalComposer.addPass(vignettePass);
  finalComposer.addPass(glitchPass);
  finalComposer.addPass(filmPass);
  
  glitchPass.enabled = false;
  filmPass.enabled = false;
  sepiaPass.enabled = false;
  vignettePass.enabled = false;
  sepiaPass.uniforms['amount'].value = 1;
  vignettePass.uniforms[ 'offset' ].value = 3;
  vignettePass.uniforms[ 'darkness' ].value = 4;


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
