import type * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import type { ResourceTracker } from '../ResourceTracker';
import { FrameRateLevel } from '../utils/TimeMagic';
import { p1 } from './JoyConManager';
import { timeManager } from './TimeManager';

export const DebugManager = (
   camera: THREE.Camera,
   scene: THREE.Scene,
   tracker: ResourceTracker,
) => {
   // camera.position.set(-1200, 0, 0);
   // camera.lookAt(60, 0, 0);

   // const controls = new OrbitControls(camera, document.querySelector("#app") as HTMLDivElement);
   // controls.update();

   // const axesHelper = new THREE.AxesHelper(5);
   // scene.add(axesHelper);

   // tracker.track(controls);

   // timeManager.addFn(() => {
   //     controls.update();
   // }, FrameRateLevel.D0);

   const vJoyCon = new URLSearchParams(location.search).get('virtualJoyCon');
   if (vJoyCon !== null) {
      document.querySelector('.connect_section')?.classList.add('hidden');
      document.querySelector('.connected')?.classList.remove('hidden');
   }

   //@ts-ignore
   window.step = p1.mockStep;
   return {};
};
