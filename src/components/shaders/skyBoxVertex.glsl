uniform vec3 bboxMin;
uniform vec3 bboxMax;

varying vec2 vUv;

void main() {
    vUv.y = (position.y - bboxMin.y) / (bboxMax.y - bboxMin.y);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}