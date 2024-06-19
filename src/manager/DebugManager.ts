// biome-ignore lint/style/useImportType: We need to use it as non-type while debugging.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// @ts-ignore
import { Spector } from 'spectorjs';
import type { ResourceTracker } from '../utils/ResourceTracker';
import { timeManager } from './TimeManager';
import { FrameRateLevel } from '../utils/TimeMagic';

export const DebugManager = (
   camera: THREE.Camera,
   scene: THREE.Scene,
   tracker: ResourceTracker,
   enable = false,
) => {
   if (enable) {
      camera.position.set(-1200, 0, 0);
      camera.lookAt(60, 0, 0);

      const controls = new OrbitControls(camera, document.querySelector("#app") as HTMLDivElement);
      controls.update();

      const axesHelper = new THREE.AxesHelper(5);
      scene.add(axesHelper);

      tracker.track(controls);

      timeManager.addFn(() => {
         controls.update();
      }, FrameRateLevel.D0);

      const spector = new Spector();
      spector.displayUI();
   }

   return {};
};
