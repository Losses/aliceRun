import * as THREE from 'three';
import GUI from 'lil-gui';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { SepiaShader } from 'three/examples/jsm/shaders/SepiaShader';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';
import { CANVAS_SIZE, updateCanvasSize } from './stores/settings';

import { ResourceTracker } from './utils/ResourceTracker';
import { timeManager } from './manager/TimeManager';
import { FrameRateLevel } from './utils/TimeMagic';
import { GlitchShader } from './utils/shaders/GlitchPass';
import { RenderFSRPass } from './utils/shaders/RenderFSRPass';

export type Effects = ReturnType<typeof initializeThreeCanvas>['effects'];

export const initializeThreeCanvas = ($container: HTMLDivElement) => {
   const tracker = new ResourceTracker();

   const scene = new THREE.Scene();

   const camera = new THREE.PerspectiveCamera(
      30,
      window.innerWidth / window.innerHeight,
      1,
      10000,
   );
   camera.position.set(0, 0, 40);

   const renderer = new THREE.WebGLRenderer({ antialias: true });
   renderer.setPixelRatio(window.devicePixelRatio);
   renderer.setSize(window.innerWidth, window.innerHeight);
   renderer.localClippingEnabled = true;
   tracker.track(renderer);

   const renderFsrPass = new RenderFSRPass(2, scene, camera, { sharpness: 0.1 });
   const sepiaPass = new ShaderPass(SepiaShader);
   const filmPass = new FilmPass(0, false);
   const glitchPass = new ShaderPass(GlitchShader);
   const vignettePass = new ShaderPass(VignetteShader);
   const outputPass = new OutputPass();

   const gui = new GUI();
   gui.add(renderFsrPass, 'downSampleAmount', 1, 4, 0.1);
   gui.add(renderFsrPass, 'sharpness', 0.0, 2.0, 0.001);

   const effects = { glitchPass, sepiaPass, vignettePass, filmPass } as const;

   const composer = new EffectComposer(renderer);
   composer.addPass(renderFsrPass);
   composer.addPass(vignettePass);
   composer.addPass(filmPass);
   composer.addPass(sepiaPass);
   composer.addPass(glitchPass);
   composer.addPass(outputPass);

   glitchPass.enabled = false;
   filmPass.enabled = false;
   sepiaPass.enabled = false;
   vignettePass.enabled = false;

   CANVAS_SIZE.subscribe(({ width, height }) => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      composer.setSize(width, height);
   }, true);

   timeManager.addFn((time) => {
      glitchPass.uniforms.time.value = time;
   }, FrameRateLevel.D3);

   timeManager.addFn(() => composer.render(), FrameRateLevel.D0);

   window.addEventListener('resize', updateCanvasSize, false);

   $container.appendChild(renderer.domElement);

   renderer.domElement.id = 'three_canvas';

   return {
      scene,
      camera,
      renderer,
      composer,
      effects,
      tracker,
   };
};
