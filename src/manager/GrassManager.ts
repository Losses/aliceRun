import * as THREE from 'three';

import {
   Grass,
   GRID_WIDTH,
   GRID_HEIGHT,
   SEGMENTS_BASE_X,
   SEGMENTS_BASE_Y,
} from '../components/Grass';
import { useLerp } from '../utils/lerp';
import { STEP_ANGLE } from '../constants/ground';
import { STEP_EVENT } from '../utils/StepCounter';
import { THEME_VALUE } from './ColorManager';
import { VISUAL_LOAD } from '../stores/settings';
import type { ResourceTracker } from '../utils/ResourceTracker';

import { p1 } from './JoyConManager';

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

   p1.addEventListener(STEP_EVENT, () => {
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

   THEME_VALUE.subscribe((theme) => {
      (material.uniforms.grassBaseColor.value as THREE.Color).setHex(
         theme.grassBase, THREE.LinearSRGBColorSpace
      );
      (material.uniforms.grassTipColor.value as THREE.Color).setHex(
         theme.grassTip, THREE.LinearSRGBColorSpace
      );

      material.uniformsNeedUpdate = true;
   });

   return {};
};
