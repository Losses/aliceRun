import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { SepiaShader } from 'three/examples/jsm/shaders/SepiaShader';
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader';
import { CANVAS_SIZE, updateCanvasSize } from './stores/settings';

import { ResourceTracker } from './utils/ResourceTracker';
import { timeManager } from './manager/TimeManager';
import { FrameRateLevel } from './utils/TimeMagic';
import { GlitchShader } from './utils/shaders/GlitchPass';

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

   const smaaPass = new SMAAPass(window.innerWidth, window.innerHeight);

   const renderScene = new RenderPass(scene, camera);
   const sepiaPass = new ShaderPass(SepiaShader);
   const filmPass = new FilmPass(0, false);
   const glitchPass = new ShaderPass(GlitchShader);
   const vignettePass = new ShaderPass(VignetteShader);

   const effects = { glitchPass, sepiaPass, vignettePass, filmPass } as const;

   timeManager.addFn((time) => {
      glitchPass.uniforms.time.value = time;
   }, FrameRateLevel.D3);

   const finalComposer = new EffectComposer(renderer);
   finalComposer.addPass(renderScene);
   finalComposer.addPass(smaaPass);
   finalComposer.addPass(vignettePass);
   finalComposer.addPass(filmPass);
   finalComposer.addPass(sepiaPass);
   finalComposer.addPass(glitchPass);

   glitchPass.enabled = false;
   filmPass.enabled = false;
   sepiaPass.enabled = false;
   vignettePass.enabled = false;

   CANVAS_SIZE.subscribe(({ width, height }) => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      smaaPass.setSize(width, height);
      finalComposer.setSize(width, height);
   }, true);

   window.addEventListener('resize', updateCanvasSize, false);

   $container.appendChild(renderer.domElement);

   renderer.domElement.id = 'three_canvas';

   return {
      scene,
      camera,
      renderer,
      composer: finalComposer,
      effects,
      tracker,
   };
};
