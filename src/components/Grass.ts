import * as THREE from 'three';
import { ResourceTracker } from '../ResourceTracker';

const midRand = () => Math.random() - 0.5;

function createRectanglePositions(width: number, height: number, widthSegments: number, heightSegments: number) {
    const positions = [];
    const segmentWidth = width / widthSegments;
    const segmentHeight = height / heightSegments;

    for (let i = 0; i <= heightSegments; i++) {
        const y = (i * segmentHeight);
        for (let j = 0; j <= widthSegments; j++) {
            const x = (j * segmentWidth) - (width / 2);
            positions.push(x, y, 0);
        }
    }

    console.log(positions);

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

const GRASS_SEGMENTS = 9;
const GRASS_HEIGHT_FACT0R = 0.8;
const DISTANCE_FACTOR = 0.8;
const GRID_SEGMENTS_X = 80;
const GRID_SEGMENTS_Y = 80;
const GRID_WIDTH = 80;
const GRID_HEIGHT = 80;

export const Grass = (tracker: ResourceTracker) => {
    // geometry
    const positions = createRectanglePositions(1, 1, 1, GRASS_SEGMENTS);
    const indices = createRectangleIndices(1, GRASS_SEGMENTS);
    const offsets = [];
    const colors = [];
    const rotations = [];
    const heights = [];
    const leans = [];

    const gridSegmentWidth = GRID_WIDTH / GRID_SEGMENTS_X;
    const gridSegmentHeight = GRID_HEIGHT / GRID_SEGMENTS_Y;

    for (let xId = 0; xId < GRID_SEGMENTS_X; xId++) {
        const x = (xId - GRID_SEGMENTS_X / 2) * gridSegmentWidth;

        for (let yId = 0; yId < GRID_SEGMENTS_Y; yId++) {
            const y = (yId - GRID_SEGMENTS_Y / 2) * gridSegmentHeight;

            offsets.push(
                x + midRand() * gridSegmentWidth * DISTANCE_FACTOR,
                0,
                y + midRand() * gridSegmentHeight * DISTANCE_FACTOR
            );
            colors.push(Math.random(), Math.random(), Math.random(), 1);
            rotations.push(Math.random() * Math.PI * 2);
            heights.push(GRASS_SEGMENTS * midRand() * GRASS_HEIGHT_FACT0R + GRASS_SEGMENTS);
            leans.push(Math.random());
        }
    }

    const geometry = new THREE.InstancedBufferGeometry();
    geometry.instanceCount = GRID_SEGMENTS_X * GRID_SEGMENTS_Y;

    geometry.setIndex(indices);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(offsets), 3));
    geometry.setAttribute('rotation', new THREE.InstancedBufferAttribute(new Float32Array(rotations), 1));
    geometry.setAttribute('color', new THREE.InstancedBufferAttribute(new Float32Array(colors), 4));
    geometry.setAttribute('lean', new THREE.InstancedBufferAttribute(new Float32Array(leans), 1));
    geometry.setAttribute('height', new THREE.InstancedBufferAttribute(new Float32Array(heights), 1));

    // material
    const material = new THREE.RawShaderMaterial({

        uniforms: {
            'time': { value: 1.0 },
            'sineTime': { value: 1.0 }
        },
        vertexShader: require('./shaders/grassVertex.glsl'),
        fragmentShader: require('./shaders/grassFragment.glsl'),
        side: THREE.DoubleSide,
        transparent: true
    });

    const grass = new THREE.Mesh(geometry, material);

    tracker.track(geometry);
    tracker.track(material);

    return { grass };
}