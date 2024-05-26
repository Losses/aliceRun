import type * as THREE from 'three'; 

import type { ResourceTracker } from '../utils/ResourceTracker';

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

   return {};
};
