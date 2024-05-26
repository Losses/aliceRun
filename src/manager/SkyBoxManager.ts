import type * as THREE from 'three';

import type { ResourceTracker } from '../utils/ResourceTracker';
import { SkyBox } from '../components/SkyBox';
import { THEME_VALUE } from './ColorManager';

export const SkyBoxManager = (
   camera: THREE.Camera,
   scene: THREE.Scene,
   tracker: ResourceTracker,
) => {
   const { skyBox } = SkyBox(tracker);
   scene.add(skyBox);

   THEME_VALUE.subscribe((theme) => {
      const uniforms = skyBox.material.uniforms;

      (uniforms.color2.value as THREE.Color).setHex(theme.sky0);
      (uniforms.color1.value as THREE.Color).setHex(theme.sky1);

      skyBox.material.uniformsNeedUpdate = true;
   }, true);
};
