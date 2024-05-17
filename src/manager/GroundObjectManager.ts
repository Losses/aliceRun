import type * as THREE from 'three';

import type { ResourceTracker } from '../ResourceTracker';
import { GroundObject } from '../components/GroundObject';
import { STEP_ANGLE } from '../constants/ground';
import { CompressedTexture } from '../utils/CompressedTexture';
import { STEP_EVENT } from '../utils/StepCounter';
import { useLerp } from '../utils/lerp';
import { eventTarget } from './EventManager';
import { p1 } from './JoyConManager';

export const GroundObjectManager = (
   camera: THREE.Camera,
   scene: THREE.Scene,
   tracker: ResourceTracker,
   renderer: THREE.WebGLRenderer,
) => {
   const groundObjects: ReturnType<typeof GroundObject>['groundObject'][] = [];
   const textures: THREE.Texture[] = [];

   for (let i = 0; i < 7; i += 1) {
      const texture = CompressedTexture(`/textures/g${i + 1}.ktx2`, renderer);
      const { groundObject } = GroundObject(texture, tracker);
      scene.add(groundObject);

      groundObjects.push(groundObject);
      texture.then((x) => textures.push(x));
   }

   for (let i = 4; i < 7; i += 1) {
      const texture = CompressedTexture(`/textures/p${i + 1}.ktx2`, renderer);
      const { groundObject } = GroundObject(texture, tracker);
      scene.add(groundObject);

      groundObjects.push(groundObject);
      texture.then((x) => textures.push(x));
   }

   let rotate = 0;

   const [updateValue] = useLerp(
      () => rotate,
      (x) => {
         for (let i = 0; i < groundObjects.length; i += 1) {
            const object = groundObjects[i];

            object.material.uniforms.groundDeltaTheta.value = x;
            object.material.uniformsNeedUpdate = true;
         }

         rotate = x;
      },
   );

   const step = () => {
      updateValue(rotate + STEP_ANGLE);
   };

   p1.addEventListener(STEP_EVENT, () => {
      step();
   });

   let transitionProgress = 0;
   const [lerpTransitionProgress] = useLerp(
      () => transitionProgress,
      (x) => {
         for (let i = 0; i < groundObjects.length; i += 1) {
            groundObjects[i].material.uniforms.transitionProgress.value = x;
            groundObjects[i].material.uniformsNeedUpdate = true;
         }

         transitionProgress = x;
      },
      0.055,
      1e-2,
   )

   // @ts-ignore
   window.transitionOn = () => {
      lerpTransitionProgress(1);
   }

   // @ts-ignore
   window.transitionOff = () => {
      lerpTransitionProgress(0);
   }

   return { step };
};
