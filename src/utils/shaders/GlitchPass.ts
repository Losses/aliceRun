export const GlitchShader = {
	name: 'GlitchShader',

	uniforms: {
		'tDiffuse': { value: null },
		'opacity': { value: 1.0 },
		'time': { value: 0.0 },
		'rowHeight': { value: 4 },
		'offset': { value: 0.02 },
		'amount': { value: 0.5 }
	},

	vertexShader: require('./glitchPassVertex.glsl'),
	fragmentShader: require('./glitchPassFragment.glsl'),
};