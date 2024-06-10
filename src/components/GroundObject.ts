import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

import { GROUND_Y_OFFSET, RADIUS, SCALE_Z } from './Ground2';
import type { ResourceTracker } from '../utils/ResourceTracker';

const GRID_WIDTH = 80;
const GRID_HEIGHT = Math.PI / 6;

const MAX_INSTANCE_COUNT = 4;
const STAR_SHAPE_SIDES = 4;

const StarShape = (n: number) => {
   const unit = Math.PI / n;

   const planes = (new Array(n).fill(0)).map((_, index) => {
      const plane = new THREE.PlaneGeometry(24, 24, 1, 1);
      plane.rotateY(unit * index);

      return plane;
   });

   return BufferGeometryUtils.mergeBufferGeometries(planes);
}


export const GroundObject = (
   textures: THREE.Texture[] | Promise<THREE.Texture>[],
   tracker: ResourceTracker,
) => {
   let time = 0;
   let groundDeltaTheta = 0;
   let transitionProgress = 0;

   const totalObjectCount = MAX_INSTANCE_COUNT * textures.length;
   const plane = StarShape(STAR_SHAPE_SIDES);
   plane.translate(0, 12, 0);

   const geometry = new THREE.InstancedBufferGeometry();
   geometry.instanceCount = totalObjectCount;

   const instanceIndex = new Array(totalObjectCount)
      .fill(0)
      .map((_, index) => index);

   const randomThetaSeed = new Array(totalObjectCount).fill(0).map(() => Math.random());
   const seedSum = randomThetaSeed.reduce((a, b) => a + b, 0);
   let lastTheta = 0;
   const instanceBaseTheta = randomThetaSeed.map((x) => {
      const currentTheta = x / seedSum;
      lastTheta += currentTheta;

      return lastTheta;
   });

   const planeIndex = new Array(STAR_SHAPE_SIDES * 4).fill(0).map((_, index) => Math.floor(index / 4));

   geometry.setIndex(plane.index);
   geometry.setAttribute('uv', plane.getAttribute('uv'));
   geometry.setAttribute('position', plane.getAttribute('position'));
   geometry.setAttribute(
      'instanceIndex',
      new THREE.InstancedBufferAttribute(new Uint32Array(instanceIndex), 1),
   );
   geometry.setAttribute(
      'planeIndex',
      new THREE.BufferAttribute(new Int32Array(planeIndex), 1),
   );

   // material
   const material = new THREE.RawShaderMaterial({
      uniforms: {
         seed: { value: Math.random() },
         map: { value: null },
         transitionProgress: { value: 0 },
         curlFactor: { value: 0.3 },
         planeCount: { value: STAR_SHAPE_SIDES },
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

   Promise.resolve(textures).then((x) => {
      material.uniforms.map.value = x;
      material.uniformsNeedUpdate = true;
   });

   const groundObject = new THREE.Mesh(geometry, material);

   groundObject.position.setY(GROUND_Y_OFFSET);

   groundObject.frustumCulled = false;

   tracker.track(geometry);
   tracker.track(material);

   return { 
      object: groundObject,
      set groundDeltaTheta(x) {
         groundDeltaTheta = x;
         material.uniforms.groundDeltaTheta.value = x;
         material.uniformsNeedUpdate = true;
      },
      get groundDeltaTheta() {
         return groundDeltaTheta;
      },
      set time(x) {
         time = x;
         material.uniforms.time.value = x * 0.001;
         material.uniformsNeedUpdate = true;
      },
      get time() {
         return time;
      },
      set transitionProgress(x) {
         transitionProgress = x;
         material.uniforms.transitionProgress.value = x;
         material.uniformsNeedUpdate = true;
      },
      get transitionProgress() {
         return transitionProgress;
      }
    };
};
