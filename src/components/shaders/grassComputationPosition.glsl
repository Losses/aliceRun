uniform float groundRadius;
uniform float groundRatio;
uniform float groundBeginTheta;
uniform float groundDeltaTheta;

uniform float grassDistanceFactor;
uniform float gridSegmentWidth;
uniform float gridSegmentHeight;

vec3 groundCoord(float r, float x) {
  return vec3(x, groundRadius * cos(r), groundRadius * sin(r) * groundRatio);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 noise = texture2D(textureNoise, uv);

    float x = (gl_FragCoord.x - float(resolution.x) / 2.0) * gridSegmentWidth;
    float theta = (gl_FragCoord.y - float(resolution.y) / 2.0) * gridSegmentHeight;
    theta += (noise.w - 0.5) * 2. * gridSegmentHeight * grassDistanceFactor;
    vec3 basicOffset = groundCoord(
      groundBeginTheta + mod(groundDeltaTheta + theta, (gridSegmentHeight * float(resolution.y))), 
      x
    );
    vec3 offset = vec3(x, basicOffset.y, basicOffset.z);

    gl_FragColor = vec4(offset, theta);
}