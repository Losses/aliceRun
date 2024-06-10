import type * as THREE from 'three';

import { useLerp } from '../utils/lerp';
import { STEP_ANGLE } from '../constants/ground';
import { STEP_EVENT } from '../utils/StepCounter';
import { GroundObject } from '../components/GroundObject';
import { CompressedTexture, CompressedTextureLoader } from '../utils/CompressedTexture';
import type { ResourceTracker } from '../utils/ResourceTracker';

import { p1 } from './JoyConManager';
import { timeManager } from './TimeManager';

export const GroundObjectManager = (
   camera: THREE.Camera,
   scene: THREE.Scene,
   tracker: ResourceTracker,
   renderer: THREE.WebGLRenderer,
) => {
   const loader = CompressedTextureLoader(renderer);

   const texturesPaths: string[] = [
      '/textures/trees.ktx2'
   ];

   const textureRequests = CompressedTexture(texturesPaths, loader);
   const groundObject = GroundObject(textureRequests, tracker);
   scene.add(groundObject.object);

   let rotate = 0;

   const [updateValue] = useLerp(
      () => rotate,
      (x) => {
         groundObject.groundDeltaTheta = x;
         rotate = x;
      },
   );

   timeManager.addFn((time) => {
      groundObject.time = time * 0.001;
   });

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
         groundObject.transitionProgress = x;
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
