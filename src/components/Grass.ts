import * as THREE from 'three';
import { ResourceTracker } from '../ResourceTracker';
import { timeManager } from '../manager/TimeManager';
import { GROUND_Y_OFFSET, RADIUS, SCALE_Z } from './Ground2';

function createRectanglePositions(
    width: number,
    height: number,
    widthSegments: number,
    heightSegments: number,
    convergeRatio: number = 0.99,
) {
    const positions = [];
    const segmentWidth = width / widthSegments;
    const segmentHeight = height / heightSegments;

    for (let i = 0; i <= heightSegments; i++) {
        const y = (i * segmentHeight);
        const convergence = (i / heightSegments) * convergeRatio;

        for (let j = 0; j <= widthSegments; j++) {
            const xCenterOffset = (widthSegments / 2 - j) * segmentWidth * convergence;
            const x = (j * segmentWidth) - (width / 2) + xCenterOffset;
            positions.push(x, y, 0);
        }
    }

    return positions;
}

function createRectangleIndices(widthSegments: number, heightSegments: number) {
    const indices = [];

    for (let i = 0; i < heightSegments; i++) {
        for (let j = 0; j < widthSegments; j++) {
            const a = i * (widthSegments + 1) + j;
            const b = a + widthSegments + 1;
            const c = a + 1;
            const d = b + 1;

            // first triangle
            indices.push(a, b, c);
            // second triangle
            indices.push(c, b, d);
        }
    }

    return indices;
}

const WIND_SPEED_FACTOR = 0.5;
const GRASS_BASE_COLOR = 0x0c3302;
const GRASS_TIP_COLOR = 0x7f7f19;
const GRASS_LEAN_FACTOR = 1;
const GRASS_SEGMENTS = 4;
const GRASS_WIDTH = 0.6;
const GRASS_HEIGHT = 3;
const GRASS_HEIGHT_FACT0R = 0.6;
const DISTANCE_FACTOR = 5;
const GRID_SEGMENTS_X = 128 * 2;
const GRID_SEGMENTS_Y = 64 * 2;
const GRID_WIDTH = 80;
const GRID_HEIGHT = Math.PI / 6;

export const Grass = (tracker: ResourceTracker) => {
    const positions = createRectanglePositions(GRASS_WIDTH, 1, 1, GRASS_SEGMENTS);
    const indices = createRectangleIndices(1, GRASS_SEGMENTS);

    const gridSegmentWidth = GRID_WIDTH / GRID_SEGMENTS_X;
    const gridSegmentHeight = GRID_HEIGHT / GRID_SEGMENTS_Y;

    const instanceIndex = new Array(GRID_SEGMENTS_X * GRID_SEGMENTS_Y).fill(0).map((_, index) => index);

    const geometry = new THREE.InstancedBufferGeometry();
    geometry.instanceCount = GRID_SEGMENTS_X * GRID_SEGMENTS_Y;

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('instanceIndex', new THREE.InstancedBufferAttribute(new Uint32Array(instanceIndex), 1));

    // material
    const material = new THREE.RawShaderMaterial({
        uniforms: {
            'time': { value: 0.0 },
            'groundRadius': {value: RADIUS},
            'groundRatio': {value: SCALE_Z},
            'groundBeginTheta': {value: -Math.PI / 16},
            'groundDeltaTheta': {value: 0},
            'windSpeedFactor': {value: WIND_SPEED_FACTOR},
            'grassBaseColor': {value: new THREE.Color(GRASS_BASE_COLOR)},
            'grassTipColor': {value: new THREE.Color(GRASS_TIP_COLOR)},
            'grassLeanFactor': {value: GRASS_LEAN_FACTOR},
            'grassSegments': {value: GRASS_SEGMENTS},
            'grassHeight': {value: GRASS_HEIGHT},
            'grassHeightFactor': {value: GRASS_HEIGHT_FACT0R},
            'grassDistanceFactor': {value: DISTANCE_FACTOR},
            'grassVectors': {value: indices.length},
            'gridSegmentsX': {value: GRID_SEGMENTS_X},
            'gridSegmentsY': {value: GRID_SEGMENTS_Y},
            'gridSegmentWidth': {value: gridSegmentWidth},
            'gridSegmentHeight': {value: gridSegmentHeight},
        },
        vertexShader: require('./shaders/grassVertex.glsl'),
        fragmentShader: require('./shaders/grassFragment.glsl'),
        side: THREE.DoubleSide,
        transparent: true,
        glslVersion: THREE.GLSL3,
    });

    const grass = new THREE.Mesh(geometry, material);

    grass.position.setY(GROUND_Y_OFFSET);
    grass.position.setZ(-GRID_HEIGHT / 2 * 0.8);

    grass.frustumCulled = false;
    timeManager.addFn((time) => {
        material.uniforms['time'].value = time * 0.001;
    });

    tracker.track(geometry);
    tracker.track(material);

    return { grass };
}