precision highp float;

uniform sampler2D map;

in vec2 vUv;

out vec4 fragColor;

void main() {
    vec4 textureColor = texture(map, vUv);
    fragColor = vec4(textureColor.rgb, textureColor.a);
}