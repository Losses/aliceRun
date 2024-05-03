import * as THREE from 'three';
import { ResourceTracker } from '../ResourceTracker';
import { timeManager } from '../manager/TimeManager';
import { GROUND_Y_OFFSET, RADIUS, SCALE_Z } from './Ground2';

const GRID_WIDTH = 80;
const GRID_HEIGHT = Math.PI / 6;

export const GroundObject = (src: string, tracker: ResourceTracker) => {
    // CompressedTexture('/textures/g1.ktx2', renderer).then((material) => {
    //     items.map((x) => x.mesh.material = material);
    //   });
    
    const plane = new THREE.PlaneGeometry(24, 24);

    const geometry = new THREE.InstancedBufferGeometry();
    geometry.instanceCount = 50;

    const instanceIndex = new Array(geometry.instanceCount).fill(0).map((_, index) => index);

    geometry.setIndex(plane.index);
    geometry.setAttribute('position', plane.getAttribute('position'));
    geometry.setAttribute('instanceIndex', new THREE.InstancedBufferAttribute(new Uint32Array(instanceIndex), 1));

    // material
    const material = new THREE.RawShaderMaterial({
        uniforms: {
            'time': { value: 0.0 },
            'seed': { value: Math.random() },
            'gridWidth': { value: GRID_WIDTH },
            'gridHeight': { value: GRID_HEIGHT },
            'groundRadius': { value: RADIUS },
            'groundRatio': { value: SCALE_Z },
            'groundBeginTheta': { value: -Math.PI / 7 },
            'groundDeltaTheta': { value: 0 },
        },
        vertexShader: require('./shaders/groundObjectVertex.glsl'),
        fragmentShader: require('./shaders/grassFragment.glsl'),
        side: THREE.DoubleSide,
        transparent: false,
        glslVersion: THREE.GLSL3,
    });

    const groundObject = new THREE.Mesh(geometry, material);

    groundObject.position.setY(GROUND_Y_OFFSET);

    groundObject.frustumCulled = false;
    timeManager.addFn((time) => {
        material.uniforms['time'].value = time * 0.001;
    });

    tracker.track(geometry);
    tracker.track(material);

    return { groundObject };
}