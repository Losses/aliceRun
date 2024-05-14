import * as THREE from 'three';
import type { ResourceTracker } from '../ResourceTracker';
import { timeManager } from '../manager/TimeManager';
import { GROUND_Y_OFFSET, RADIUS, SCALE_Z } from './Ground2';

const GRID_WIDTH = 80;
const GRID_HEIGHT = Math.PI / 6;

const MAX_INSTANCE_COUNT = 4;

export const GroundObject = (
   texture: THREE.Texture | Promise<THREE.Texture>,
   tracker: ResourceTracker,
) => {
   const plane = new THREE.PlaneGeometry(24, 24);
   plane.translate(0, 12, 0);

   const geometry = new THREE.InstancedBufferGeometry();
   geometry.instanceCount = 4;

   const instanceIndex = new Array(MAX_INSTANCE_COUNT)
      .fill(0)
      .map((_, index) => index);

   geometry.setIndex(plane.index);
   geometry.setAttribute('uv', plane.getAttribute('uv'));
   geometry.setAttribute('position', plane.getAttribute('position'));
   geometry.setAttribute(
      'instanceIndex',
      new THREE.InstancedBufferAttribute(new Uint32Array(instanceIndex), 1),
   );

   // material
   const material = new THREE.RawShaderMaterial({
      uniforms: {
         time: { value: 0.0 },
         seed: { value: Math.random() },
         map: { value: null },
         roadRatio: { value: 0.2 },
         gridWidth: { value: GRID_WIDTH },
         gridHeight: { value: GRID_HEIGHT * 2.2 },
         groundRadius: { value: RADIUS },
         groundRatio: { value: SCALE_Z },
         groundBeginTheta: { value: -Math.PI / 3 },
         groundDeltaTheta: { value: 0 },
      },
      vertexShader: require('./shaders/groundObjectVertex.glsl'),
      fragmentShader: require('./shaders/groundObjectFragment.glsl'),
      side: THREE.DoubleSide,
      transparent: true,
      glslVersion: THREE.GLSL3,
   });

   Promise.resolve(texture).then((x) => {
      material.uniforms.map.value = x;
      material.uniformsNeedUpdate = true;
   });

   const groundObject = new THREE.Mesh(geometry, material);

   groundObject.position.setY(GROUND_Y_OFFSET);

   groundObject.frustumCulled = false;
   timeManager.addFn((time) => {
      material.uniforms.time.value = time * 0.001;
   });

   tracker.track(geometry);
   tracker.track(material);

   return { groundObject };
};
