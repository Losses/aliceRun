precision highp float;

uniform float sineTime;

uniform float time;
uniform float grassSegments;
uniform float heightFactor;
uniform float grassHeightFactor;
uniform float grassDistanceFactor;
uniform uint gridSegmentX;
uniform uint gridSegmentY;
uniform float gridSegmentWidth;
uniform float gridSegmentHeight;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in vec3 offset;
in vec4 color;

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

void main(){
    vec3 vPosition = position;

    vec3 grassWorldPos = (modelMatrix * vec4(offset, 1.0)).xyz;

    vec4 hashVal1 = hash42(vec2(grassWorldPos.x, grassWorldPos.z));
    float randomAngle = hashVal1.x * 2.0 * 3.14159;
    vPosition.x += (hashVal1.z - 0.5) * gridSegmentWidth * grassDistanceFactor * 2.;
    vPosition.z += (hashVal1.w - 0.5) * gridSegmentHeight * grassDistanceFactor * 2.;

    float windDir = noise12(grassWorldPos.xz * 0.05 + 0.05 * time);
    float windNoiseSample = noise12(grassWorldPos.xz * 0.25 + time * 1.0);
    float windLeanAngle = remap(windNoiseSample, -1.0, 1.0, 0.25, 1.0);
    windLeanAngle = easeIn(windLeanAngle, 2.0) * 1.25;
    vec3 windAxis = vec3(cos(windDir), 0.0, sin(windDir));

    windLeanAngle *= position.y;

    mat3 grassMat = rotateAxis(windAxis, windLeanAngle) * rotateY(randomAngle);

    vPosition.y *= grassSegments * hashVal1.y * heightFactor + grassSegments;
    vPosition = grassMat * vPosition;

    vPosition = vPosition + offset;
    vColor = color;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
}