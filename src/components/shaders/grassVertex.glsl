precision highp float;

uniform vec3 grassBaseColor;
uniform vec3 grassTipColor;
uniform float grassHeight;
uniform float grassHeightFactor;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform sampler2D texturePosition;
uniform sampler2D textureWind;
uniform sampler2D textureNoise;

in vec3 position;
in vec2 reference;

out vec4 vColor;

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

float easeIn(float x, float t) {
	return pow(x, t);
}

void main() {
    vec4 computedNoise = texture(textureNoise, reference);
    vec4 computedPosition = texture(texturePosition, reference);
    vec4 computedWind = texture(textureWind, reference);

    vec3 offset = computedPosition.xyz;

    float sinWindDirection = computedWind.x;
    float cosWindDirection = computedWind.y;
    float curveAmount = computedWind.z;
    float randomAngle = computedWind.w;

    // Shape and position
    vec3 vPosition = position;

    float heightPercent = vPosition.y;
    curveAmount *= heightPercent;
    vec3 windAxis = vec3(cosWindDirection, 0.0, sinWindDirection);
    mat3 grassMat = rotateAxis(windAxis, curveAmount) * rotateY(randomAngle);

    // Apply what we want
    vPosition = grassMat * vPosition;

    // Adjust height
    vPosition.y *= grassHeight;
    vPosition.y *=  1. + computedNoise.y * grassHeightFactor;

    // Adjust position
    vPosition = vPosition + offset;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);

    // color
    // vColor = vec4(0., position.y, position.y, 1);
    vColor = vec4(mix(grassBaseColor, grassTipColor, easeIn(heightPercent, 4.)), 1);
    // vColor = vec4(curveAmount, curveAmount, curveAmount, 1);
}