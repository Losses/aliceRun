export const EasuShader = () => ({
   name: 'EasuShader',

   uniforms: {
      iResolution: {
         value: null,
      },
      tDiffuse: {
         value: null,
      },
   },

   vertexShader: require('./glitchPassVertex.glsl'),
   fragmentShader: require('./easuPassFragment.glsl'),
});
