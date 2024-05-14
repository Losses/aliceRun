import type * as THREE from 'three';

import type { ResourceTracker } from '../ResourceTracker';
import {
   GRID_HEIGHT,
   GRID_WIDTH,
   Grass,
   SEGMENTS_BASE_X,
   SEGMENTS_BASE_Y,
} from '../components/Grass';
import { STEP_ANGLE } from '../constants/ground';
import { VISUAL_LOAD } from '../stores/settings';
import { STEP_EVENT } from '../utils/StepCounter';
import { useLerp } from '../utils/lerp';
import { THEME_VALUE } from './ColorManager';
import { eventTarget } from './EventManager';

export const GrassManager = (
   camera: THREE.Camera,
   scene: THREE.Scene,
   tracker: ResourceTracker,
) => {
   const { grass } = Grass(tracker);
   scene.add(grass);

   let rotation = 0;

   const { material, geometry } = grass;

   const [updateValue] = useLerp(
      () => rotation,
      (x) => {
         rotation = x;
         material.uniforms.groundDeltaTheta.value = x;
         material.uniformsNeedUpdate = true;
      },
   );

   const step = () => {
      updateValue(rotation + STEP_ANGLE);
   };

   eventTarget.addEventListener(STEP_EVENT, ({ detail }) => {
      step();
   });

   VISUAL_LOAD.subscribe((value) => {
      const Xs = Math.ceil(SEGMENTS_BASE_X * value);
      const Ys = Math.ceil(SEGMENTS_BASE_Y * value);
      geometry.instanceCount = Xs * Ys;
      material.uniforms.gridSegmentsX.value = Xs;
      material.uniforms.gridSegmentsY.value = Ys;
      material.uniforms.gridSegmentWidth.value = GRID_WIDTH / Xs;
      material.uniforms.gridSegmentHeight.value = GRID_HEIGHT / Ys;

      material.uniformsNeedUpdate = true;
   });

   const $three = document.querySelector('#three_canvas');
   if (!$three) throw new Error('Three canvas not found');

   THEME_VALUE.subscribe((theme) => {
      (material.uniforms.grassBaseColor.value as THREE.Color).setHex(
         theme.grassBase,
      );
      (material.uniforms.grassTipColor.value as THREE.Color).setHex(
         theme.grassTip,
      );

      material.uniformsNeedUpdate = true;
   });

   return {};
};
