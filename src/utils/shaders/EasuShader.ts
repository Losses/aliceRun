import * as THREE from 'three';

export const EasuShader = ({
   name: 'EasuShader',

   uniforms: {
      iResolution: {
         value: new THREE.Vector2(1, 1),
      },
      tDiffuse: {
         value: null,
      },
   },

   vertexShader: require('./glitchPassVertex.glsl'),
   fragmentShader: require('./easuPassFragment.glsl'),
});
