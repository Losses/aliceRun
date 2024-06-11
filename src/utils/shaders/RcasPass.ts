export const RcasShader = (sharpness = 0.2) => ({
   name: 'RcasShader',

   uniforms: {
      iResolution: {
         value: null,
      },
      sharpness: { value: sharpness },
      tDiffuse: {
         value: null,
      },
   },

   vertexShader: require('./glitchPassVertex.glsl'),
   fragmentShader: require('./rcasPassFragment.glsl'),
});
