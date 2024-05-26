import * as THREE from 'three';

import type { ResourceTracker } from '../utils/ResourceTracker';
import type { CylinderGeometry2 } from '../components/CylinderGeometry2';
import { Ground } from '../components/Ground2';
import { STEP_ANGLE } from '../constants/ground';
import { STEP_EVENT } from '../utils/StepCounter';
import { useLerp } from '../utils/lerp';
import { eventTarget } from './EventManager';
import { p1 } from './JoyConManager';

export const GroundManager = (
   camera: THREE.Camera,
   scene: THREE.Scene,
   tracker: ResourceTracker,
) => {
   const { ground } = Ground(tracker);
   scene.add(ground);

   const light = new THREE.AmbientLight(0x404040); // soft white light
   scene.add(light);

   let rotate = 0;

   const [updateValue] = useLerp(
      () => rotate,
      (x) => {
         (ground.geometry as CylinderGeometry2).updateTheta(-x);
         rotate = x;
      },
   );

   const step = () => {
      updateValue(rotate + STEP_ANGLE);
   };

   p1.addEventListener(STEP_EVENT, () => {
      step();
   });

   return { step };
};
