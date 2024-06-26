import * as THREE from 'three';
import type { ResourceTracker } from '../utils/ResourceTracker';

export const SkyBox = (tracker: ResourceTracker) => {
   const geometry = new THREE.SphereGeometry(500, 20, 20);
   geometry.computeBoundingBox();

   const material = new THREE.ShaderMaterial({
      uniforms: {
         color1: {
            value: new THREE.Color(),
         },
         color2: {
            value: new THREE.Color(),
         },
         bboxMin: {
            value: geometry.boundingBox?.min.multiplyScalar(0.2) ?? 0,
         },
         bboxMax: {
            value: geometry.boundingBox?.max.multiplyScalar(0.2) ?? 0,
         },
      },
      vertexShader: require('./shaders/skyBoxVertex.glsl'),
      fragmentShader: require('./shaders/skyBoxFragment.glsl'),
      // wireframe: true
   });

   material.side = THREE.BackSide;
   const skyBox = new THREE.Mesh(geometry, material);

   tracker.track(geometry);
   tracker.track(material);

   return { skyBox };
};
