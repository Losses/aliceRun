precision highp float;

uniform float time;
in vec3 vPosition;
in vec4 vColor;

out vec4 fragColor;

void main() {
    vec4 color = vec4(vColor);
    color.r += sin(vPosition.x * 10.0 + time) * 0.5;

    fragColor = color;
}