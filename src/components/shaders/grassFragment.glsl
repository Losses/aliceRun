precision highp float;

in vec4 vColor;

out vec4 fragColor;

void main() {
    vec4 color = vec4(vColor);

    fragColor = color;
}