precision highp float;

uniform float sineTime;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 offset;
attribute vec4 color;
attribute float rotation;
attribute float lean;
attribute float height;

varying vec3 vPosition;
varying vec4 vColor;

mat3 rotateX(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat3(
        vec3(1, 0, 0),
        vec3(0, c, -s),
        vec3(0, s, c)
    );
}

void main(){
    vec3 vPosition = position;

    float curveAmount = lean * position.y;
    mat3 grassMat = rotateX(curveAmount);

    vPosition.y *= height;
    vPosition = grassMat * vPosition;

    float cosAngle = cos(rotation);
    float sinAngle = sin(rotation);
    vPosition.x = cosAngle * vPosition.x - sinAngle * vPosition.z;
    vPosition.z = sinAngle * vPosition.x + cosAngle * vPosition.z;

    vPosition = vPosition + offset;
    vColor = color;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
}