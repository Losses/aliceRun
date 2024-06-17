uvec4 murmurHash41(uint src) {
    const uint M = 0x5bd1e995u;
    uvec4 h = uvec4(1190494759u, 2147483647u, 3559788179u, 179424673u);
    src *= M; src ^= src>>24u; src *= M;
    h *= M; h ^= src;
    h ^= h>>13u; h *= M; h ^= h>>15u;
    return h;
}

// 4 outputs, 1 input
vec4 hash41(float src) {
    uvec4 h = murmurHash41(floatBitsToUint(src));
    return uintBitsToFloat(h & 0x007fffffu | 0x3f800000u) - 1.0;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 noise = texture2D(textureNoise, uv);
    float index = noise.x;

    gl_FragColor = hash41(index);
}