precision highp float;

uniform float sineTime;

uniform float time;
uniform float windSpeedFactor;
uniform vec3 grassBaseColor;
uniform vec3 grassTipColor;
uniform float grassLeanFactor;
uniform float grassSegments;
uniform uint grassVectors;
uniform float grassHeight;
uniform float grassHeightFactor;
uniform float grassDistanceFactor;
uniform uint gridSegmentsX;
uniform uint gridSegmentsY;
uniform float gridSegmentWidth;
uniform float gridSegmentHeight;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in uint instanceIndex;

out vec3 vPosition;
out vec4 vColor;

mat3 rotateX(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(1, 0, 0),
        vec3(0, c, -s),
        vec3(0, s, c)
    );
}

mat3 rotateY(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(c, 0, s),
        vec3(0, 1, 0),
        vec3(-s, 0, c)
    );
}

mat3 rotateAxis(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat3(
    oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
  );
}


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

uvec4 murmurHash42(uvec2 src) {
    const uint M = 0x5bd1e995u;
    uvec4 h = uvec4(1190494759u, 2147483647u, 3559788179u, 179424673u);
    src *= M; src ^= src>>24u; src *= M;
    h *= M; h ^= src.x; h *= M; h ^= src.y;
    h ^= h>>13u; h *= M; h ^= h>>15u;
    return h;
}

vec4 hash42(vec2 src) {
  uvec4 h = murmurHash42(floatBitsToUint(src));
  return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
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

void main() {
    // Shape and position
    vec3 vPosition = position;

    float heightPercent = vPosition.y;

    uint xID = instanceIndex % gridSegmentsX;
    uint yID = instanceIndex / gridSegmentsX;

    // Commonly used random number
    vec2 grassCoord = vec2(xID, yID);
    vec4 hashVal1 = hash42(grassCoord);

    // Wind here
    float windNoiseSample = noise12(grassCoord * 0.25 + time);

    float curveAmount = remap(windNoiseSample, -1.0, 1.0, 0.25, 1.0);
    curveAmount = easeIn(curveAmount, 2.0) * grassLeanFactor;
    curveAmount *= heightPercent;

    float windDir = noise12(grassCoord * 0.05 + windSpeedFactor * time);
    windDir = remap(windDir, -1.0, 1.0, 0.0, 3.14159 * 2.);
    vec3 windAxis = vec3(cos(windDir), 0.0, sin(windDir));
    float randomAngle = hashVal1.x * 2.0 * 3.14159;
    mat3 grassMat = rotateAxis(windAxis, curveAmount) * rotateY(randomAngle);

    // Apply what we want
    vPosition = grassMat * vPosition;

    // Basic position calculation
    float x = float(float(xID) - float(gridSegmentsX) / 2.0) * gridSegmentWidth;
    float y = float(float(yID) - float(gridSegmentsY) / 2.0) * gridSegmentHeight;
    vec3 offset = vec3(x, 0, y);

    // Adjust position
    vPosition = vPosition + offset;
    // Adjust height
    vPosition.y *= grassHeight;

    // Add some random value
    vPosition.x += (hashVal1.z - 0.5) * 2. * gridSegmentWidth * grassDistanceFactor;
    vPosition.z += (hashVal1.w - 0.5) * 2. * gridSegmentHeight * grassDistanceFactor;
    vPosition.y *=  1. + hashVal1.y * grassHeightFactor;

    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);

    // color
    // vColor = vec4(0., position.y, position.y, 1);
    vColor = vec4(mix(grassBaseColor, grassTipColor, easeIn(heightPercent, 4.)), 1);
    // vColor = vec4(windDir, windDir, windDir, 1);
}