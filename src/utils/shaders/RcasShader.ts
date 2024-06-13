import * as THREE from 'three';

export const RcasShader = ({
   name: 'RcasShader',

   uniforms: {
      iResolution: {
         value: new THREE.Vector2(1, 1),
      },
      sharpness: { value: 0 },
      tDiffuse: {
         value: null,
      },
   },

   vertexShader: require('./glitchPassVertex.glsl'),
   fragmentShader: require('./rcasPassFragment.glsl'),
});
