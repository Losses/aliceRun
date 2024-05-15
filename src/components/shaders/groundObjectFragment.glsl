precision highp float;

uniform float time;
uniform sampler2D map;

in vec2 vUv;

out vec4 fragColor;

float random(float x) {
    return fract(sin(dot(vec2(x, 12.9898), vec2(78.233, 157.99))) * 43758.5453);
}

void main() {
    vec2 uv = vUv;

    // float r = 0.08;
    // float d = 0.5;
    // float seed = vUv.x * vUv.y;
    // float xRnd = ((random(time + seed) - 0.5) * 2.) * r;
    // float yRnd = ((random(time + seed + 1.) - 0.5) * 2.) * r;
    // float dRnd = ((random(time + seed + 2.) - 0.5) * 2.);

    // uv.x += xRnd;
    // uv.y += yRnd;
    vec4 textureColor = texture(map, uv);

    fragColor = vec4(textureColor.rgb, textureColor.a);

    if (textureColor.a < 0.7) discard;
    // if (dRnd < d) discard;
}