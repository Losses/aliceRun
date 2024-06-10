import type * as THREE from 'three';

import { Ground } from '../components/Ground2';
import { useLerp } from '../utils/lerp';
import { STEP_ANGLE } from '../constants/ground';
import { STEP_EVENT } from '../utils/StepCounter';
import type { ResourceTracker } from '../utils/ResourceTracker';
import type { CylinderGeometry2 } from '../components/CylinderGeometry2';

import { p1 } from './JoyConManager';

export const GroundManager = (
   camera: THREE.Camera,
   scene: THREE.Scene,
   tracker: ResourceTracker,
) => {
   const { ground } = Ground(tracker);
   scene.add(ground);

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
