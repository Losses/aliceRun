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

	vertexShader: /* glsl */`
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,

	fragmentShader: /* glsl */`
		precision highp float;

		uniform float opacity;
		uniform float time;
		uniform float rowHeight;
		uniform float offset;
		uniform float amount;

		uniform sampler2D tDiffuse;

		in vec2 vUv;

		float random(float x) {
			return fract(sin(dot(vec2(x, 12.9898), vec2(78.233, 157.99))) * 43758.5453);
		}

		float valueGrp(float x, float scale, float scaleFactor) {
			return (trunc((x * scaleFactor) / scale) * scale) / scaleFactor;
		}

		void main() {
			vec2 uv = vUv;
			float _time = valueGrp(time, 50., 1.);
			float timeRnd = random(_time);

			float _y = valueGrp(uv.y, rowHeight * timeRnd, 100.);
			float randomValue = random(_y * _time);

			bool shouldOffset = randomValue < amount;
			float offset = shouldOffset ? offset * (randomValue - 0.5) : 0.0;

			if (mod(_y, rowHeight) < rowHeight * amount) {
				uv.x += offset;
			}

			vec4 texel = texture(tDiffuse, uv);
			gl_FragColor = opacity * texel;
		}`

};