precision highp float;

uniform float sineTime;

uniform float time;
uniform float seed;
uniform float roadRatio;
uniform float gridWidth;
uniform float gridHeight;
uniform float groundRadius;
uniform float groundRatio;
uniform float groundBeginTheta;
uniform float groundDeltaTheta;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec2 uv;
in vec3 position;
in uint planeIndex;
in uint instanceIndex;

out vec2 vUv;
flat out uint vPlaneIndex;
flat out uint vInstanceIndex;

uint murmurHash12(uvec2 src) {
  const uint M = 0x5bd1e995u;
  uint h = 1190494759u;
  src *= M; src ^= src>>24u; src *= M;
  h *= M; h ^= src.x; h *= M; h ^= src.y;
  h ^= h>>13u; h *= M; h ^= h>>15u;
  return h;
}

float hash12(vec2 src) {
  uint h = murmurHash12(floatBitsToUint(src));
  return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

uvec3 murmurHash33(uvec3 src) {
  const uint M = 0x5bd1e995u;
  uvec3 h = uvec3(1190494759u, 2147483647u, 3559788179u);
  src *= M; src ^= src>>24u; src *= M;
  h *= M; h ^= src.x; h *= M; h ^= src.y; h *= M; h ^= src.z;
  h ^= h>>13u; h *= M; h ^= h>>15u;
  return h;
}

vec3 hash33(vec3 src) {
  uvec3 h = murmurHash33(floatBitsToUint(src));
  return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

vec3 groundCoord(float r, float x) {
  return vec3(x, groundRadius * cos(r), groundRadius * sin(r) * groundRatio);
}

void main() {
    // Position
    vec3 vPosition = position;

    float baseTheta = hash12(vec2(instanceIndex, seed));
    float inPlaneTheta = groundDeltaTheta + baseTheta;

    // For calculating random X
    int rounds = int(inPlaneTheta / gridHeight);

    vec3 randomValue1 = hash33(vec3(instanceIndex, seed, rounds));

    // Basic position calculation
    float xRatio = randomValue1.x - 0.5;
    float halfRoadRatio = roadRatio / 2.;

    if (xRatio < 0.) {
      xRatio -= halfRoadRatio;
    } else {
      xRatio += halfRoadRatio;
    }

    float x =  xRatio * gridWidth;
    float theta = mod(inPlaneTheta, gridHeight) + groundBeginTheta;
    vec3 offset = groundCoord(theta, x);

    // Adjust position
    vPosition = vPosition + offset;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);

    vUv = uv;
    vInstanceIndex = instanceIndex;
    vPlaneIndex = planeIndex;
}