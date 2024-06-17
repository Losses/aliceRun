uniform float time;
uniform float windSpeedFactor;
uniform float groundRadius;
uniform float groundRatio;
uniform float groundBeginTheta;

uniform float grassLeanFactor;
uniform uint gridSegmentsY;
uniform float gridSegmentHeight;


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

float noise12(vec2 p) {
  vec2 i = floor(p);

  vec2 f = fract(p);
  vec2 u = smoothstep(vec2(0.0), vec2(1.0), f);

	float val = mix( mix( hash12( i + vec2(0.0, 0.0) ), 
                        hash12( i + vec2(1.0, 0.0) ), u.x),
                   mix( hash12( i + vec2(0.0, 1.0) ), 
                        hash12( i + vec2(1.0, 1.0) ), u.x), u.y);
  return val * 2.0 - 1.0;
}

float inverseLerp(float minValue, float maxValue, float v) {
  return (v - minValue) / (maxValue - minValue);
}

float remap(float v, float inMin, float inMax, float outMin, float outMax) {
  float t = inverseLerp(inMin, inMax, v);
  return mix(outMin, outMax, t);
}

float easeIn(float x, float t) {
	return pow(x, t);
}

vec3 groundCoord(float r, float x) {
  return vec3(x, groundRadius * cos(r), groundRadius * sin(r) * groundRatio);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 noise = texture2D(textureNoise, uv);
    vec4 position = texture2D(texturePosition, uv);

    float x = position.x;
    float theta = position.w;

    vec3 stableTheta = groundCoord(
      groundBeginTheta + mod(theta, (gridSegmentHeight * float(gridSegmentsY))), 
      x
    );
    vec3 stableOffset = vec3(x, stableTheta.y, stableTheta.z);

    float windNoiseSample = noise12(stableOffset.xz * 0.25 + time);
    float windDirection = noise12(position.xz * 0.05 + windSpeedFactor * time);
    windDirection = remap(windDirection, -1.0, 1.0, 0.0, 3.14159 * 2.);
    float randomAngle = noise.z * 2.0 * 3.14159;
    float curveAmount = remap(windNoiseSample, -1.0, 1.0, 0.25, 1.0);
    curveAmount = easeIn(curveAmount, 1.5) * grassLeanFactor;

    gl_FragColor = vec4(sin(windDirection), cos(windDirection), curveAmount, randomAngle);
}